"""Copy site/ to dist/, put site_url from tools/config.json into content.js, stamp the service worker
with a content hash and write precache.json."""
import base64
import hashlib
import json
import re
import shutil

from common import ROOT, SITE, config

DIST = ROOT / "dist"
SKIP = {"precache.json"}


def add_sri():
    """Subresource Integrity: the browser refuses a script or stylesheet whose bytes changed after the build."""
    page = DIST / "index.html"
    html = page.read_text(encoding="utf8")

    def tag(m):
        name = m.group(2)
        f = DIST / name
        if not f.is_file():
            return m.group(0)
        digest = base64.b64encode(hashlib.sha384(f.read_bytes()).digest()).decode()
        return '%s integrity="sha384-%s">' % (m.group(1), digest)

    html, n1 = re.subn(r'(<script src="([^"]+\.js)")>', tag, html)
    html, n2 = re.subn(r'(<link rel="stylesheet" href="([^"]+\.css)")>', tag, html)
    page.write_text(html, encoding="utf8")
    print("SRI: %d scripts, %d stylesheets" % (n1, n2))


def main():
    if DIST.exists():
        shutil.rmtree(DIST)
    shutil.copytree(SITE, DIST, ignore=shutil.ignore_patterns(".DS_Store", "Thumbs.db"))
    url = config()["site_url"].strip()
    if url:
        content = DIST / "content.js"
        text, n = re.subn(r'const SITE_URL="[^"]*";', 'const SITE_URL="%s";' % (url if url.endswith("/") else url + "/"), content.read_text(encoding="utf8"))
        assert n == 1, "SITE_URL line not found in content.js"
        content.write_text(text, encoding="utf8")
    add_sri()
    files = sorted(p.relative_to(DIST).as_posix() for p in DIST.rglob("*") if p.is_file() and p.name not in SKIP)
    h = hashlib.sha1()
    for f in files:
        h.update(f.encode())
        h.update((DIST / f).read_bytes())
    version = h.hexdigest()[:10]
    sw = DIST / "sw.js"
    text = sw.read_text(encoding="utf8")
    text, n = re.subn(r'const VERSION="[^"]*";', 'const VERSION="%s";' % version, text)
    assert n == 1, "VERSION line not found in sw.js"
    sw.write_text(text, encoding="utf8")
    cache = ["./"] + [f for f in files if f != "sw.js"]
    (DIST / "precache.json").write_text(json.dumps({"version": version, "files": cache}, indent=1), encoding="utf8")
    size = sum((DIST / f).stat().st_size for f in files)
    by_ext = {}
    for f in files:
        e = f.rsplit(".", 1)[-1]
        by_ext[e] = by_ext.get(e, 0) + (DIST / f).stat().st_size
    print("dist: %d files, %.1f MB, version %s" % (len(files), size / 1048576, version))
    print("  " + ", ".join("%s %d KB" % (k, v // 1024) for k, v in sorted(by_ext.items(), key=lambda kv: -kv[1])))
    if size > 25 * 1048576:
        print("  warning: more than 25 MB will be cached on first visit")


if __name__ == "__main__":
    main()
