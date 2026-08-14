# Recipe inbox

Drop photos of handwritten recipes/notes here (JPG, PNG, or WebP — **not HEIC**;
if your phone shoots HEIC, set the camera to "Most Compatible" or export as JPG).

On push, a GitHub Action transcribes each photo with the Anthropic API and:

1. creates `recipes/<slug>.html` (standardized format, version 1, empty Cook's Log)
2. moves the photo to `recipes/originals/` and links it on the page
3. adds a card to `recipes/index.html`

Photos that fail to transcribe stay in this folder — check the Action log.
Generated pages are drafts: proofread them, then edit the `RECIPE_DATA` block if needed.

## Uploading from your phone

github.com → this repo → `recipes/_inbox` → **Add file → Upload files** → commit.
(Or the GitHub mobile app.)

## One-time setup

1. Create an API key at console.anthropic.com (a few dollars of credit lasts a long
   time — roughly a penny or less per photo with the default model).
2. Repo → **Settings → Secrets and variables → Actions → New repository secret**,
   name it `ANTHROPIC_API_KEY`, paste the key.
