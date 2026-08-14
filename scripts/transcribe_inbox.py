#!/usr/bin/env python3
"""Transcribe handwritten recipe photos dropped into recipes/_inbox/.

Run by .github/workflows/transcribe.yml on every push that touches recipes/_inbox/.
For each photo it:
  1. auto-rotates the photo upright (phone photos of a notebook are often sideways,
     which wrecks transcription accuracy), downscales it, then sends it to the
     Anthropic API (key from ANTHROPIC_API_KEY) and gets structured JSON back
  2. writes recipes/<slug>.html from scripts/recipe_page_template.html
  3. moves the photo to recipes/originals/<slug>.<ext> and links it as "Original"
  4. inserts a card into recipes/index.html at the AUTO-CARDS marker

Requires Pillow (the workflow pip-installs it). Generated pages are drafts:
review, tweak wording/tags, and re-commit.
"""

import base64
import datetime
import html
import json
import os
import re
import sys
import urllib.request
from io import BytesIO

from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INBOX = os.path.join(ROOT, "recipes", "_inbox")
ORIGINALS = os.path.join(ROOT, "recipes", "originals")
INDEX = os.path.join(ROOT, "recipes", "index.html")
TEMPLATE = os.path.join(ROOT, "scripts", "recipe_page_template.html")
MARKER = "<!-- AUTO-CARDS: the transcription pipeline inserts new cards below this line. Do not remove this comment. -->"

MODEL = os.environ.get("TRANSCRIBE_MODEL", "claude-sonnet-4-5")
API_KEY = os.environ.get("ANTHROPIC_API_KEY")

MEDIA_TYPES = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
               ".webp": "image/webp", ".gif": "image/gif"}

PROMPT = """Transcribe this photo of a handwritten recipe or kitchen/cocktail note.

Return ONLY a valid JSON object (no markdown fences, no commentary) with exactly these keys:
{
  "type": "recipe" or "idea",
  "title": "short name for the dish/drink/note",
  "subtitle": "one-line description or origin note",
  "source": "where it's from if evident (e.g. 'Recipe card', 'Notebook page'), else ''",
  "category": "one of: Breakfast, Dinner, Dessert, Baking, Cocktails, Sides, Sauces, Other",
  "yield": "servings/quantity if written, else ''",
  "tags": ["1-3 short category tags"],
  "ingredients": ["one string per ingredient with amounts, in original order"],
  "directions": ["one string per step"],
  "notes": "margin notes, substitutions, commentary written on the original, else ''",
  "body": ["for type 'idea' only: the transcribed note as paragraphs"]
}

Rules:
- A complete recipe (ingredients + how to make it) -> "recipe" with ingredients/directions filled, body [].
- A fragment, concept, or scribbled idea -> "idea" with the content in body, ingredients/directions [].
- Fix obvious spelling slips and expand shorthand (tps -> tsp) but keep the original voice and wording.
- If a word is illegible, transcribe your best guess followed by (?).
- Never invent content that isn't on the page."""


def slugify(title):
    s = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    return s or "untitled"


ORIENT_PROMPT = """This is a photo of a handwritten page. How many degrees CLOCKWISE must it be \
rotated so the text reads normally left-to-right? Reply with exactly one number: 0, 90, 180, or 270. \
No other text."""


def preprocess(path, rotation=0):
    """Rotate upright, cap the long edge, return (base64 jpeg, media_type)."""
    im = Image.open(path)
    im = ImageOps.exif_transpose(im)          # honour EXIF orientation if present
    if rotation:
        im = im.rotate(-rotation, expand=True)  # negative = clockwise
    im = im.convert("RGB")
    w, h = im.size
    longest = max(w, h)
    if longest > 1568:                        # the API downsamples past this anyway
        scale = 1568 / longest
        im = im.resize((int(w * scale), int(h * scale)), Image.LANCZOS)
    buf = BytesIO()
    im.save(buf, "JPEG", quality=88)
    return base64.b64encode(buf.getvalue()).decode(), "image/jpeg"


def detect_rotation(path):
    """Ask the model which way is up. Falls back to 0 on any problem."""
    try:
        b64, mt = preprocess(path)
        text = call_api(b64, mt, ORIENT_PROMPT, max_tokens=8, raw=True)
        deg = int(re.search(r"\d+", text).group())
        return deg if deg in (0, 90, 180, 270) else 0
    except Exception:
        return 0


def call_api(image_b64, media_type, prompt=None, max_tokens=4000, raw=False):
    body = json.dumps({
        "model": MODEL,
        "max_tokens": max_tokens,
        "messages": [{
            "role": "user",
            "content": [
                {"type": "image", "source": {"type": "base64", "media_type": media_type, "data": image_b64}},
                {"type": "text", "text": prompt or PROMPT},
            ],
        }],
    }).encode()
    req = urllib.request.Request(
        "https://api.anthropic.com/v1/messages",
        data=body,
        headers={
            "x-api-key": API_KEY,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
    )
    with urllib.request.urlopen(req, timeout=180) as resp:
        data = json.loads(resp.read())
    text = "".join(block.get("text", "") for block in data.get("content", []))
    if raw:
        return text.strip()
    text = re.sub(r"^```(json)?|```$", "", text.strip(), flags=re.MULTILINE).strip()
    return json.loads(text)


def build_page_data(parsed, original_rel):
    today = datetime.date.today()
    common = {
        "type": parsed.get("type", "recipe"),
        "title": parsed.get("title", "Untitled"),
        "subtitle": parsed.get("subtitle", ""),
        "source": parsed.get("source", ""),
        "category": parsed.get("category", "Other"),
        "original": original_rel,
        "log": [],
    }
    if common["type"] == "idea":
        common["body"] = parsed.get("body") or [parsed.get("notes", "")]
    else:
        common["yield"] = parsed.get("yield", "")
        common["versions"] = [{
            "version": 1,
            "date": today.strftime("%Y-%m"),
            "ingredients": parsed.get("ingredients", []),
            "directions": parsed.get("directions", []),
            "notes": parsed.get("notes", ""),
        }]
    return common


def build_card(slug, parsed):
    title = html.escape(parsed.get("title", "Untitled"))
    desc = html.escape(parsed.get("subtitle", "") or "Transcribed from a handwritten original.")
    ptype = parsed.get("type", "recipe")
    tags = parsed.get("tags") or [parsed.get("category", "Other")]
    tag_spans = "\n                ".join(
        f'<span class="tag">{html.escape(t)}</span>' for t in tags[:3])
    search_terms = " ".join(parsed.get("ingredients", []) + [parsed.get("source", ""), parsed.get("notes", "")])
    search_terms = html.escape(re.sub(r"[^A-Za-z0-9 ]", " ", search_terms).lower()[:300])
    return f'''
          <a class="project-card recipe-card" href="{slug}.html"
             data-type="{ptype}"
             data-tags="{html.escape(', '.join(tags[:3]))}"
             data-search="{search_terms}">
            <div class="card-body">
              <p class="card-title">{title}</p>
              <p class="card-desc">{desc}</p>
              <div class="card-tags">
                {tag_spans}
              </div>
            </div>
          </a>
'''


def main():
    if not API_KEY:
        print("ERROR: ANTHROPIC_API_KEY is not set (add it as a repo secret).", file=sys.stderr)
        sys.exit(1)

    photos = sorted(
        f for f in os.listdir(INBOX)
        if os.path.splitext(f)[1].lower() in MEDIA_TYPES
    ) if os.path.isdir(INBOX) else []
    if not photos:
        print("Inbox empty — nothing to transcribe.")
        return

    with open(TEMPLATE, encoding="utf-8") as fh:
        template = fh.read()
    with open(INDEX, encoding="utf-8") as fh:
        index_html = fh.read()
    if MARKER not in index_html:
        print("ERROR: AUTO-CARDS marker missing from recipes/index.html", file=sys.stderr)
        sys.exit(1)

    os.makedirs(ORIGINALS, exist_ok=True)
    ok, failed = [], []

    for photo in photos:
        path = os.path.join(INBOX, photo)
        ext = os.path.splitext(photo)[1].lower()
        try:
            rotation = detect_rotation(path)
            if rotation:
                print(f"    {photo}: rotating {rotation}deg to upright")
            b64, mt = preprocess(path, rotation)
            parsed = call_api(b64, mt)

            slug = slugify(parsed.get("title", os.path.splitext(photo)[0]))
            n = 2
            while os.path.exists(os.path.join(ROOT, "recipes", slug + ".html")):
                slug = f"{slugify(parsed.get('title', 'untitled'))}-{n}"
                n += 1

            # Save an upright, web-sized copy as the linked "original", then drop the raw file.
            original_name = slug + ".jpg"
            up = Image.open(path)
            up = ImageOps.exif_transpose(up)
            if rotation:
                up = up.rotate(-rotation, expand=True)
            up = up.convert("RGB")
            w, h = up.size
            if w > 1400:
                up = up.resize((1400, int(h * 1400 / w)), Image.LANCZOS)
            up.save(os.path.join(ORIGINALS, original_name), quality=82, optimize=True)
            os.remove(path)

            data = build_page_data(parsed, "originals/" + original_name)
            page = template.replace("__TITLE__", html.escape(data["title"]))
            page = page.replace("__DATA__", json.dumps(data, indent=2, ensure_ascii=False))
            with open(os.path.join(ROOT, "recipes", slug + ".html"), "w", encoding="utf-8") as fh:
                fh.write(page)

            index_html = index_html.replace(MARKER, MARKER + "\n" + build_card(slug, parsed))
            ok.append(f"{photo} -> recipes/{slug}.html ({data['type']})")
        except Exception as exc:  # noqa: BLE001 — keep going, report at the end
            failed.append(f"{photo}: {exc}")

    with open(INDEX, "w", encoding="utf-8") as fh:
        fh.write(index_html)

    for line in ok:
        print("OK  " + line)
    for line in failed:
        print("FAIL " + line, file=sys.stderr)
    print(f"\n{len(ok)} transcribed, {len(failed)} failed (failed photos stay in the inbox).")


if __name__ == "__main__":
    main()
