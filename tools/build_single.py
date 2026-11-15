"""Build ONE self-contained index.html from site/ (everything inlined: styles, scripts, the game, images).

    python tools/build_single.py [output.html]        default: dist-single/index.html

Photos are re-encoded smaller (max 800 px wide) so the file stays a few MB; the normal build (tools/build.py) keeps the
originals. The one-file version has no service worker / offline install; it simply opens by double click."""
import base64
import io
import json
import re
import sys

from common import ROOT, SITE, config

OUT = ROOT / "dist-single" / "index.html"
MAXW, Q = 800, 66


def b64(data, mime):
    return "data:%s;base64,%s" % (mime, base64.b64encode(data).decode())


def small_webp(path):
    raw = path.read_bytes()
    try:
        from PIL import Image
        im = Image.open(io.BytesIO(raw))
        if im.width > MAXW:
            im = im.resize((MAXW, round(im.height * MAXW / im.width)), Image.LANCZOS)
        buf = io.BytesIO()
        im.save(buf, "WEBP", quality=Q, method=6)
        out = buf.getvalue()
        return out if len(out) < len(raw) else raw
    except ImportError:
        return raw


def js_safe(text):
    """Make text safe inside an inline <script> element."""
    return re.sub(r"</(script)", r"<\\/\1", text, flags=re.I).replace("<!--", "<\\!--")


def inline_game_page(name):
    html = (SITE / "dune" / (name + ".html")).read_text(encoding="utf8")
    html = re.sub(r'<meta http-equiv="Content-Security-Policy"[^>]*>\n?', "", html)

    def css(m):
        return "<style>\n" + (SITE / "dune" / m.group(1)).read_text(encoding="utf8") + "\n</style>"

    def js(m):
        return "<script>\n" + js_safe((SITE / "dune" / m.group(1)).read_text(encoding="utf8")) + "\n</script>"

    html = re.sub(r'<link rel="stylesheet" href="([^"]+)">', css, html)
    html = re.sub(r'<script src="([^"]+)"></script>', js, html)
    assert 'href="' not in html.split("<body")[0].replace("http://www.w3.org", ""), name + ": a stylesheet was not inlined"
    return html


def main():
    out = __import__("pathlib").Path(sys.argv[1]) if len(sys.argv) > 1 else OUT
    page = (SITE / "index.html").read_text(encoding="utf8")
    url = config()["site_url"].strip()

    # 1. images: assets/images.js holds every photo path; replace each by a small data URI
    images = (SITE / "assets" / "images.js").read_text(encoding="utf8")
    cache = {}

    def img(m):
        rel = m.group(1)
        if rel not in cache:
            cache[rel] = b64(small_webp(SITE / rel), "image/webp")
        return '"src": "%s"' % cache[rel]

    images = re.sub(r'"src":\s*"(assets/img/[^"]+\.webp)"', img, images)

    # 2. stylesheets
    def css(m):
        text = (SITE / m.group(1)).read_text(encoding="utf8")
        text = text.replace("url(assets/mars-disc.webp)", 'url("%s")' % b64((SITE / "assets/mars-disc.webp").read_bytes(), "image/webp"))
        return "<style>\n" + text + "\n</style>"

    page = re.sub(r'<link rel="stylesheet" href="([^"]+\.css)">', css, page)

    # 3. scripts (the game pages become strings that the game frame shows through srcdoc)
    docs = {n: inline_game_page(n) for n in ("day", "hub", "lab", "airlock", "rover")}
    docs_js = "window.MM_DUNE_DOCS=" + json.dumps(docs, ensure_ascii=False) + ";"

    def script(m):
        name = m.group(1)
        if name == "assets/images.js":
            text = images
        elif name == "pwa.js":
            return ""
        else:
            text = (SITE / name).read_text(encoding="utf8")
            if name == "content.js" and url:
                text = re.sub(r'const SITE_URL="[^"]*";', 'const SITE_URL="%s";' % (url if url.endswith("/") else url + "/"), text)
        if name == "dune-host.js":
            text = docs_js + "\n" + text
        if name == "video.js":
            vids = {k: base64.b64encode((SITE / "assets" / "video" / (k + ".mp4")).read_bytes()).decode() for k in ("intro", "finale")}
            text = "window.MM_VIDEO_B64=" + json.dumps(vids) + ";\n" + text
        return "<script>\n" + js_safe(text) + "\n</script>"

    page = re.sub(r'<script src="([^"]+)"></script>', script, page)

    # 4. head: icons, manifest, a policy that fits one file (no network, inline code)
    icon = b64((SITE / "assets/icons/icon-192.png").read_bytes(), "image/png")
    page = page.replace('<link rel="manifest" href="manifest.webmanifest">\n', "")
    page = page.replace('href="assets/icons/icon-192.png"', 'href="%s"' % icon)
    csp = ("default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; media-src blob:; "
           "connect-src 'none'; frame-src data: blob: about: https://www.youtube-nocookie.com https://www.youtube.com; object-src 'none'; base-uri 'none'; form-action 'none'")
    page, n = re.subn(r'<meta http-equiv="Content-Security-Policy" content="[^"]*">', '<meta http-equiv="Content-Security-Policy" content="%s">' % csp, page)
    assert n == 1
    page = page.replace("assets/placeholder.svg", b64((SITE / "assets/placeholder.svg").read_bytes(), "image/svg+xml"))
    markup = re.sub(r"<(script|style)\b.*?</\1>", "", page, flags=re.S)
    left = re.findall(r'(?:src|href)="(?!data:|https?:|#)([^"]+)"', markup)
    assert not left, "files still referenced from the one-file page: %s" % left[:5]
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(page, encoding="utf8")
    print("one-file build: %s, %.1f MB" % (out, out.stat().st_size / 1048576))


if __name__ == "__main__":
    main()
