"""Render promo/index.html to an MP4.

    pip install playwright && playwright install chromium
    python render_video.py                 # promo.mp4, 1920x1080, 30 fps
    python render_video.py --fps 60 --out promo60.mp4

The page exposes render(t); every frame is drawn at an exact time, so the result is
identical on any computer. ffmpeg must be installed.
"""
import argparse
import asyncio
import math
import shutil
import subprocess
import sys
import tempfile
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path

from playwright.async_api import async_playwright

HERE = Path(__file__).resolve().parent


async def draw(chunk, fps, size, frames_dir, executable):
    w, h = size
    async with async_playwright() as p:
        kw = {"executable_path": executable} if executable else {}
        browser = await p.chromium.launch(**kw)
        page = await browser.new_page(viewport={"width": w, "height": h})
        await page.goto((HERE / "index.html").as_uri() + "?manual=1")
        await page.evaluate("document.fonts.ready")
        await page.wait_for_timeout(400)
        for i in chunk:
            await page.evaluate("t => render(t)", i / fps)
            await page.screenshot(path=str(frames_dir / ("%05d.jpg" % i)), type="jpeg", quality=95)
        await browser.close()


def work(args):
    asyncio.run(draw(*args))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--fps", type=int, default=30)
    ap.add_argument("--size", default="1920x1080")
    ap.add_argument("--out", default=str(HERE / "promo.mp4"))
    ap.add_argument("--workers", type=int, default=4)
    ap.add_argument("--chromium", default=None, help="path to a Chromium binary if Playwright's own is not installed")
    a = ap.parse_args()
    if not shutil.which("ffmpeg"):
        sys.exit("ffmpeg not found")
    size = tuple(int(x) for x in a.size.split("x"))
    total = round(51 * a.fps)
    with tempfile.TemporaryDirectory() as tmp:
        frames = Path(tmp)
        chunks = [list(range(k, total, a.workers)) for k in range(a.workers)]
        with ProcessPoolExecutor(a.workers) as pool:
            list(pool.map(work, [(c, a.fps, size, frames, a.chromium) for c in chunks]))
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-framerate", str(a.fps), "-i", str(frames / "%05d.jpg"),
                        "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p",
                        "-movflags", "+faststart", a.out], check=True)
    print("done:", a.out)


if __name__ == "__main__":
    main()
