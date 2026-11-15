import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT / "site"
CACHE = ROOT / "tools" / "cache"
LANGS = ["en", "ru", "tg"]


def config():
    return json.loads((ROOT / "tools" / "config.json").read_text(encoding="utf8"))


def load_info():
    text = (SITE / "qrdata.js").read_text(encoding="utf8")
    start = text.index("const INFO=") + len("const INFO=")
    body = text[start:text.rindex("}") + 1]
    return json.loads(body)


def topic_title(info, code):
    return info[code]["title"]["en"]
