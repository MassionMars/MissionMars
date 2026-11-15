"""Download NASA photos and the Rubik font so the site works without internet.

    python tools/fetch_assets.py images      # candidates -> tools/cache/raw + review.html
    python tools/fetch_assets.py fonts       # Rubik woff2 -> site/assets/fonts

Then delete the raw photos you do not want and run optimize_images.py.
"""
import argparse
import hashlib
import html
import json
import os
import re
import sys
import time

import requests

from common import CACHE, ROOT, SITE, config, load_info

NASA_API = os.environ.get("MM_NASA_API", "https://images-api.nasa.gov")
FONTS_CSS = os.environ.get("MM_FONTS_CSS", "https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700;800&display=swap")
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
RAW = CACHE / "raw"

session = requests.Session()
session.headers["User-Agent"] = UA


def get(url, **kw):
    for attempt in range(3):
        try:
            r = session.get(url, timeout=30, **kw)
            if r.status_code == 200:
                return r
            if r.status_code in (404, 403):
                break
        except requests.RequestException:
            pass
        time.sleep(1 + attempt)
    return None


def save(url, dest):
    r = get(url)
    if not r or not r.content:
        return False
    dest.write_bytes(r.content)
    return True


def search(query, limit):
    r = get(NASA_API + "/search", params={"q": query, "media_type": "image", "page_size": 12})
    if not r:
        return []
    out = []
    for item in r.json().get("collection", {}).get("items", []):
        d = (item.get("data") or [{}])[0]
        if d.get("media_type") != "image" or not d.get("nasa_id"):
            continue
        out.append(d)
        if len(out) >= limit:
            break
    return out


def asset_url(nasa_id):
    r = get(NASA_API + "/asset/" + nasa_id)
    if not r:
        return None
    urls = [i.get("href", "") for i in r.json().get("collection", {}).get("items", [])]
    for tag in ("~large", "~medium", "~small"):
        for u in urls:
            if tag in u and u.lower().split("?")[0].endswith((".jpg", ".jpeg", ".png")):
                return u.replace("http://images-assets.nasa.gov", "https://images-assets.nasa.gov")
    return None


def credit_of(d):
    return d.get("photographer") or d.get("secondary_creator") or d.get("center") or "NASA"


def fetch_images(per_topic, reuse_old=True):
    info = load_info()
    queries = json.loads((ROOT / "tools" / "image_queries.json").read_text(encoding="utf8"))
    RAW.mkdir(parents=True, exist_ok=True)
    rows = []
    for code, topic in info.items():
        n = 0
        have = {p.stem for p in RAW.glob(code + "-*.json")}
        if have:
            print(code, "already has candidates, skipping")
            continue
        old = topic.get("img")
        old = {"src": old} if isinstance(old, str) else old
        if reuse_old and old and old.get("src"):
            n += 1
            ext = ".png" if ".png" in old["src"].lower() else ".jpg"
            if save(old["src"], RAW / f"{code}-{n}{ext}"):
                meta = {"code": code, "n": n, "title": (old.get("cap") or {}).get("en") or topic["title"]["en"],
                        "credit": old.get("credit") or "NASA", "source": old["src"]}
                (RAW / f"{code}-{n}.json").write_text(json.dumps(meta, ensure_ascii=False), encoding="utf8")
                rows.append(meta)
            else:
                n -= 1
        seen = set()
        for q in queries.get(code) or [topic["title"]["en"]]:
            if n >= per_topic:
                break
            for d in search(q, 4):
                if n >= per_topic or d["nasa_id"] in seen:
                    continue
                seen.add(d["nasa_id"])
                url = asset_url(d["nasa_id"])
                if not url:
                    continue
                ext = ".png" if url.lower().split("?")[0].endswith(".png") else ".jpg"
                if save(url, RAW / f"{code}-{n + 1}{ext}"):
                    n += 1
                    meta = {"code": code, "n": n, "title": d.get("title", ""), "credit": credit_of(d),
                            "source": "https://images.nasa.gov/details/" + d["nasa_id"], "nasa_id": d["nasa_id"]}
                    (RAW / f"{code}-{n}.json").write_text(json.dumps(meta, ensure_ascii=False), encoding="utf8")
                    rows.append(meta)
                time.sleep(0.3)
        print(code, topic["title"]["en"], "->", n, "images")
    write_review()


def write_review():
    cards = []
    for meta_file in sorted(RAW.glob("*.json")):
        m = json.loads(meta_file.read_text(encoding="utf8"))
        img = next((p for p in RAW.glob(meta_file.stem + ".*") if p.suffix != ".json"), None)
        if not img:
            continue
        cards.append('<figure><img src="raw/%s" loading="lazy"><figcaption><b>%s</b> %s<br>%s<br><code>%s</code></figcaption></figure>'
                     % (img.name, html.escape(meta_file.stem), html.escape(m["title"]), html.escape(m["credit"]), html.escape(img.name)))
    page = ("<!doctype html><meta charset=utf-8><title>Image review</title>"
            "<style>body{font:14px sans-serif;background:#111;color:#eee;display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;padding:12px}"
            "img{width:100%;height:170px;object-fit:cover}figure{margin:0;background:#1c1c1c;padding:8px}</style>"
            "<h3 style='grid-column:1/-1'>Delete the files you do not want from tools/cache/raw, then run optimize_images.py</h3>" + "".join(cards))
    (CACHE / "review.html").write_text(page, encoding="utf8")
    print("review sheet:", CACHE / "review.html")


def fetch_fonts():
    r = get(FONTS_CSS)
    if not r:
        sys.exit("could not download the font css")
    out = SITE / "assets" / "fonts"
    out.mkdir(parents=True, exist_ok=True)
    blocks = re.findall(r"/\*\s*([\w-]+)\s*\*/\s*(@font-face\s*\{.*?\})", r.text, flags=re.S)
    css, done = [], {}
    for subset, block in blocks:
        if subset == "hebrew":
            continue
        url = re.search(r"url\(([^)]+)\)", block).group(1).strip("'\"")
        if url not in done:
            name = "rubik-%s-%s.woff2" % (subset, hashlib.md5(url.encode()).hexdigest()[:6])
            if not save(url, out / name):
                sys.exit("failed to download " + url)
            done[url] = name
        css.append(re.sub(r"url\([^)]+\)", "url(%s)" % done[url], block))
    (out / "fonts.css").write_text("\n".join(css) + "\n", encoding="utf8")
    print("fonts:", len(done), "files,", sum((out / n).stat().st_size for n in done.values()) // 1024, "KB")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("what", choices=["images", "fonts", "all"])
    ap.add_argument("--new-only", action="store_true", help="do not re-download the photos already linked in qrdata.js")
    ap.add_argument("--per-topic", type=int, default=config()["images_per_topic"])
    a = ap.parse_args()
    if a.what in ("fonts", "all"):
        fetch_fonts()
    if a.what in ("images", "all"):
        fetch_images(a.per_topic, not a.new_only)


if __name__ == "__main__":
    main()
