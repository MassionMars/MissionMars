import hashlib, io, json, random, sys
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
from PIL import Image, ImageDraw
PORT = int(sys.argv[1])

def jpg(seed):
    r = random.Random(seed)
    img = Image.new("RGB", (1600, 900), (r.randint(40, 200), r.randint(20, 90), r.randint(20, 90)))
    d = ImageDraw.Draw(img)
    for _ in range(40):
        x, y, s = r.randint(0, 1600), r.randint(0, 900), r.randint(20, 200)
        d.ellipse([x, y, x + s, y + s], fill=(r.randint(0, 255), r.randint(0, 255), r.randint(0, 255)))
    b = io.BytesIO(); img.save(b, "JPEG", quality=92); return b.getvalue()

class H(BaseHTTPRequestHandler):
    def log_message(self, *a): pass
    def send(self, body, ctype):
        self.send_response(200); self.send_header("Content-Type", ctype); self.send_header("Content-Length", str(len(body))); self.end_headers(); self.wfile.write(body)
    def do_GET(self):
        u = urlparse(self.path); q = parse_qs(u.query)
        if u.path == "/search":
            h = hashlib.md5(q["q"][0].encode()).hexdigest()[:6]
            items = [{"data": [{"nasa_id": "mock-%s-%d" % (h, i), "title": "Mock %s %d" % (q["q"][0], i), "media_type": "image", "center": "JPL", "photographer": "Test Photographer %d" % i}], "links": []} for i in range(4)]
            self.send(json.dumps({"collection": {"items": items}}).encode(), "application/json")
        elif u.path.startswith("/asset/"):
            nid = u.path.split("/")[-1]
            base = "http://127.0.0.1:%d/img/%s" % (PORT, nid)
            items = [{"href": base + "~orig.jpg"}, {"href": base + "~large.jpg"}, {"href": base + "~small.jpg"}, {"href": base + "~medium.jpg"}]
            self.send(json.dumps({"collection": {"items": items}}).encode(), "application/json")
        elif u.path.startswith("/img/"):
            self.send(jpg(u.path), "image/jpeg")
        elif u.path == "/fonts.css":
            css = "".join("/* %s */\n@font-face {\n  font-family: 'Rubik';\n  font-style: normal;\n  font-weight: 300 900;\n  font-display: swap;\n  src: url(http://127.0.0.1:%d/font/%s.woff2) format('woff2');\n  unicode-range: U+0000-00FF;\n}\n" % (s, PORT, s) for s in ("cyrillic-ext", "cyrillic", "hebrew", "latin"))
            self.send(css.encode(), "text/css")
        elif u.path.startswith("/font/"):
            self.send(b"wOF2" + u.path.encode(), "font/woff2")
        else:
            self.send_response(404); self.end_headers()
HTTPServer(("127.0.0.1", PORT), H).serve_forever()
