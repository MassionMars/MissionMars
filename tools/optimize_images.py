"""Turn the raw photos into small WebP files and write site/assets/images.js and ATTRIBUTION.md."""
import json

from PIL import Image

from common import CACHE, ROOT, SITE, config, load_info

RAW = CACHE / "raw"
OUT = SITE / "assets" / "img"


def to_webp(src, dest, max_w, max_kb):
    img = Image.open(src).convert("RGB")
    if img.width > max_w:
        img = img.resize((max_w, round(img.height * max_w / img.width)), Image.LANCZOS)
    for q in (80, 72, 65, 58, 50):
        img.save(dest, "WEBP", quality=q, method=6)
        if dest.stat().st_size <= max_kb * 1024:
            break
    return dest.stat().st_size


def main():
    cfg = config()
    info = load_info()
    if not list(RAW.glob("*.json")):
        raise SystemExit("tools/cache/raw has no photos. Nothing was changed. Run fetch_assets.py images first.")
    OUT.mkdir(parents=True, exist_ok=True)
    for old in OUT.glob("*.webp"):
        old.unlink()
    table, credits, total = {}, [], 0
    for meta_file in sorted(RAW.glob("*.json")):
        meta = json.loads(meta_file.read_text(encoding="utf8"))
        src = next((p for p in RAW.glob(meta_file.stem + ".*") if p.suffix != ".json"), None)
        if not src or meta["code"] not in info or meta_file.stem in cfg.get("exclude", []):
            continue
        name = meta_file.stem + ".webp"
        total += to_webp(src, OUT / name, cfg["max_image_width"], cfg["max_image_kb"])
        table.setdefault(meta["code"], []).append(
            {"id": meta_file.stem, "src": "assets/img/" + name, "cap": {"en": meta["title"]}, "credit": meta["credit"]})
        credits.append((name, meta["title"], meta["credit"], meta["source"]))
    for items in table.values():
        items.sort(key=lambda x: x["src"])
    js = "window.LOCAL_IMG=" + json.dumps(table, ensure_ascii=False, indent=1) + ";\n"
    (SITE / "assets" / "images.js").write_text(js, encoding="utf8")
    lines = ["# Image credits", "",
             "Photos come from the NASA Image and Video Library and NASA web pages. "
             "Credits are taken from the library metadata; check the source link before reuse.", "",
             "| File | Title | Credit | Source |", "|---|---|---|---|"]
    lines += ["| %s | %s | %s | %s |" % (n, t.replace("|", "/"), c.replace("|", "/"), s) for n, t, c, s in credits]
    (ROOT / "ATTRIBUTION.md").write_text("\n".join(lines) + "\n", encoding="utf8")
    missing = [c for c in info if c not in table]
    print("%d images, %.1f MB total" % (len(credits), total / 1048576))
    if missing:
        print("topics without a local image:", ", ".join(missing))


if __name__ == "__main__":
    main()
