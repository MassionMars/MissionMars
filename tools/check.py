"""Sanity checks. Exit code 1 when something is wrong.

    python tools/check.py            # offline checks
    python tools/check.py --online   # also test that the source links open
"""
import argparse
import json
import re
import shutil
import subprocess
import sys

from common import LANGS, ROOT, SITE, load_info

problems = []


def bad(msg):
    problems.append(msg)
    print("  !", msg)


def shape(v):
    if isinstance(v, dict):
        return {k: shape(x) for k, x in v.items()}
    if isinstance(v, list):
        return [shape(x) for x in v]
    return type(v).__name__


def diff(a, b, path=""):
    if isinstance(a, dict) and isinstance(b, dict):
        for k in sorted(set(a) | set(b)):
            if k not in a:
                yield "%s.%s missing" % (path, k)
            elif k not in b:
                yield "%s.%s extra" % (path, k)
            else:
                yield from diff(a[k], b[k], path + "." + k)
    elif isinstance(a, list) and isinstance(b, list):
        if len(a) != len(b):
            yield "%s has %d items, expected %d" % (path, len(b), len(a))
        else:
            for i, (x, y) in enumerate(zip(a, b)):
                yield from diff(x, y, "%s[%d]" % (path, i))
    elif a != b:
        yield "%s type %s, expected %s" % (path, b, a)


def check_translations():
    print("translations")
    if not shutil.which("node"):
        print("  node not found, skipped")
        return
    data = json.loads(subprocess.check_output(["node", str(ROOT / "tools" / "dump_data.js"), str(SITE)]))
    for name in ("L", "GT"):
        block = data.get(name)
        if not block:
            bad(name + " not found")
            continue
        ref = shape(block["en"])
        for lang in LANGS[1:]:
            if lang not in block:
                bad("%s has no %s" % (name, lang))
                continue
            for d in list(diff(ref, shape(block[lang])))[:8]:
                bad("%s.%s%s" % (name, lang, d))
        check_strings(name, block)


PLACEHOLDER = re.compile(r"\{(\w+)\}")


def walk_strings(v, path=""):
    if isinstance(v, dict):
        for k, x in v.items():
            yield from walk_strings(x, path + "." + k)
    elif isinstance(v, list):
        for i, x in enumerate(v):
            yield from walk_strings(x, "%s[%d]" % (path, i))
    elif isinstance(v, str):
        yield path, v


def check_strings(name, block):
    """Every language must have non-empty strings and the same {placeholders} as English."""
    en = dict(walk_strings(block["en"]))
    for lang in LANGS:
        if lang not in block:
            continue
        got = dict(walk_strings(block[lang]))
        empty = [p for p, s in got.items() if not s.strip() and en.get(p, "x").strip()]
        for p in empty[:6]:
            bad("%s.%s%s is empty" % (name, lang, p))
        if lang == "en":
            continue
        wrong = [p for p, s in got.items() if p in en and set(PLACEHOLDER.findall(s)) != set(PLACEHOLDER.findall(en[p]))]
        for p in wrong[:6]:
            bad("%s.%s%s has different {placeholders} than English" % (name, lang, p))
        same = [p for p, s in got.items() if p in en and s == en[p] and len(s) > 40]
        if same:
            print("  note: %s.%s has %d long strings identical to English (untranslated?)" % (name, lang, len(same)))


def check_topics(info, online):
    print("qr topics")
    for code, t in info.items():
        for lang in LANGS:
            if not t["title"].get(lang):
                bad("%s: no title in %s" % (code, lang))
        if not t.get("text", {}).get("en"):
            bad("%s: no english text" % code)
        srcs = [t["source"]] if isinstance(t.get("source"), dict) else t.get("source") or []
        if not srcs:
            bad("%s: no source link" % code)
        for s in srcs:
            if not re.match(r"https?://", s.get("url", "")):
                bad("%s: bad source url %r" % (code, s.get("url")))
    if online:
        import requests
        for code, t in info.items():
            srcs = [t["source"]] if isinstance(t.get("source"), dict) else t.get("source") or []
            for s in srcs:
                try:
                    r = requests.get(s["url"], timeout=20, stream=True, headers={"User-Agent": "Mozilla/5.0"})
                    if r.status_code >= 400:
                        bad("%s: %s -> %d" % (code, s["url"], r.status_code))
                except requests.RequestException as e:
                    bad("%s: %s -> %s" % (code, s["url"], type(e).__name__))


def check_files(info):
    print("files")
    html = (SITE / "index.html").read_text(encoding="utf8")
    refs = re.findall(r'(?:src|href)="([^":#?]+)"', html)
    for r in refs:
        if not (SITE / r).exists():
            bad("index.html references missing file " + r)
    for page in sorted((SITE / "dune").glob("*.html")):
        for r in re.findall(r'(?:src|href)="([^":#?]+)"', page.read_text(encoding="utf8")):
            if not (page.parent / r).exists():
                bad("%s references missing file %s" % (page.name, r))
    images = SITE / "assets" / "images.js"
    table = json.loads(images.read_text(encoding="utf8").split("=", 1)[1].rstrip().rstrip(";")) if images.exists() else {}
    for code, items in table.items():
        if code not in info:
            bad("images.js has unknown topic " + code)
        for it in items:
            if not (SITE / it["src"]).exists():
                bad("missing image " + it["src"])
            if not it.get("credit"):
                bad("image without credit " + it["src"])
    if not (SITE / "assets" / "fonts" / "fonts.css").read_text(encoding="utf8").strip():
        print("  note: fonts.css is empty, run fetch_assets.py fonts")


def check_media():
    print("media slides and quizzes")
    if not shutil.which("node"):
        print("  node not found, skipped")
        return
    out = subprocess.check_output(["node", str(ROOT / "tools" / "check_media.js"), str(SITE)], text=True).splitlines()
    for line in out:
        if line.startswith("#"):
            print("  " + line[1:])
        else:
            bad(line)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--online", action="store_true")
    a = ap.parse_args()
    info = load_info()
    check_translations()
    check_topics(info, a.online)
    check_files(info)
    check_media()
    print("\n%d problem(s)" % len(problems))
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()
