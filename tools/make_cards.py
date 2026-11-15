"""Print-ready QR cards: tools/out/cards.pdf (and loose SVG files with --svg)."""
import argparse
import re

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas

import qr_encode
from common import ROOT, config, load_info

OUT = ROOT / "tools" / "out"
CW, CH = 95 * mm, 62 * mm


def ascii_text(s):
    return s.replace("₂", "2").replace("–", "-").replace("’", "'").encode("latin-1", "replace").decode("latin-1")


def wrap(text, font, size, width):
    lines, cur = [], ""
    for w in text.split():
        t = (cur + " " + w).strip()
        if stringWidth(t, font, size) <= width:
            cur = t
        else:
            lines.append(cur)
            cur = w
    return lines + [cur]


def draw_card(c, x, y, code, topic, url):
    c.setStrokeColorRGB(0.35, 0.15, 0.1)
    c.setLineWidth(0.8)
    c.roundRect(x, y, CW, CH, 4 * mm)
    c.setFillColorRGB(0.77, 0.34, 0.18)
    c.setFont("Helvetica-Bold", 7)
    c.drawString(x + 6 * mm, y + CH - 8 * mm, "MISSION MARS  /  " + ascii_text(topic["cat"]["en"]).upper())
    c.setFillColorRGB(0.07, 0.03, 0.06)
    c.setFont("Helvetica-Bold", 13)
    ty = y + CH - 16 * mm
    for line in wrap(ascii_text(topic["title"]["en"]), "Helvetica-Bold", 13, CW - 46 * mm)[:3]:
        c.drawString(x + 6 * mm, ty, line)
        ty -= 5.5 * mm
    c.setFont("Helvetica-Bold", 26)
    c.drawString(x + 6 * mm, y + 11 * mm, code)
    c.setFont("Helvetica", 6.5)
    c.drawString(x + 6 * mm, y + 6 * mm, "Scan or type the code in the QR tab")
    m = qr_encode.encode(url + "#info=" + code)
    n = len(m)
    size = 34 * mm
    cell = size / (n + 4)
    qx, qy = x + CW - size - 5 * mm, y + (CH - size) / 2
    c.setFillColorRGB(0.96, 0.91, 0.83)
    c.rect(qx, qy, size, size, stroke=0, fill=1)
    c.setFillColorRGB(0.07, 0.03, 0.06)
    for r, row in enumerate(m):
        for col, v in enumerate(row):
            if v:
                c.rect(qx + (col + 2) * cell, qy + size - (r + 3) * cell, cell + 0.15, cell + 0.15, stroke=0, fill=1)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--url", default=config()["site_url"])
    ap.add_argument("--svg", action="store_true")
    a = ap.parse_args()
    if not a.url:
        raise SystemExit("set site_url in tools/config.json or pass --url https://name.github.io/mission-mars/")
    url = a.url if a.url.endswith("/") else a.url + "/"
    info = load_info()
    OUT.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT / "cards.pdf"), pagesize=A4)
    c.setTitle("MISSION MARS QR cards")
    per_page, left, top = 8, (A4[0] - 2 * CW) / 2, A4[1] - 14 * mm
    for i, code in enumerate(sorted(info)):
        k = i % per_page
        if i and k == 0:
            c.showPage()
        draw_card(c, left + (k % 2) * CW, top - (k // 2 + 1) * (CH + 3 * mm) + 3 * mm, code, info[code], url)
    c.save()
    if a.svg:
        (OUT / "qr").mkdir(exist_ok=True)
        for code in info:
            (OUT / "qr" / (code + ".svg")).write_text(qr_encode.to_svg(url + "#info=" + code), encoding="utf8")
    print("cards:", len(info), "->", OUT / "cards.pdf")


if __name__ == "__main__":
    main()
