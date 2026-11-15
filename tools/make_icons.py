from PIL import Image, ImageDraw, ImageFilter
from common import SITE


def planet(size, pad):
    img = Image.new("RGB", (size, size), (18, 8, 15))
    d = ImageDraw.Draw(img)
    r = int(size * (0.5 - pad))
    c = size // 2
    glow = Image.new("RGB", (size, size), (18, 8, 15))
    ImageDraw.Draw(glow).ellipse([c - r - size // 16, c - r - size // 16, c + r + size // 16, c + r + size // 16], fill=(120, 48, 28))
    img = Image.blend(img, glow.filter(ImageFilter.GaussianBlur(size // 14)), 0.8)
    d = ImageDraw.Draw(img)
    for i in range(r, 0, -1):
        t = i / r
        col = (int(232 - 110 * t), int(116 - 76 * t), int(60 - 40 * t))
        off = int((1 - t) * r * 0.35)
        d.ellipse([c - i - off // 2, c - i - off // 2, c + i - off // 2, c + i - off // 2], fill=col)
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).ellipse([c - r, c - r, c + r, c + r], fill=255)
    for cx, cy, cr in ((-0.25, -0.2, 0.14), (0.28, 0.25, 0.1), (0.05, -0.38, 0.06)):
        crater = Image.new("L", (size, size), 0)
        ImageDraw.Draw(crater).ellipse([c + cx * r - cr * r, c + cy * r - cr * r, c + cx * r + cr * r, c + cy * r + cr * r], fill=70)
        dark = Image.new("RGB", (size, size), (110, 40, 26))
        img.paste(dark, mask=Image.composite(crater, Image.new("L", (size, size), 0), mask))
    return img


def main():
    out = SITE / "assets" / "icons"
    out.mkdir(parents=True, exist_ok=True)
    planet(512, 0.14).resize((192, 192), Image.LANCZOS).save(out / "icon-192.png", optimize=True)
    planet(512, 0.14).save(out / "icon-512.png", optimize=True)
    planet(512, 0.26).save(out / "icon-maskable-512.png", optimize=True)
    print("icons written to", out)


if __name__ == "__main__":
    main()
