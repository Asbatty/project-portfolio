# CLAUDE.md — Portfolio

## Stack
Plain HTML5 / CSS3 / vanilla JS. No build step, no framework, no dependencies. Files are served directly (e.g. GitHub Pages).

## File Structure
```
project-portfolio/
├── index.html                  — Landing page: hero, project grid, about, contact
├── assets/
│   ├── css/style.css           — All styles (single shared stylesheet)
│   ├── Andrew.jpeg             — Hero photo
│   └── *.pdf                   — Resume and poster
└── projects/
    ├── macro-pad/
    │   ├── index.html
    │   └── *.jpg / *.png / *.f3d
    ├── mohrs-circle/
    │   ├── index.html
    │   └── *.pdf / *.png / *.jpg
    └── cctv-camcorder/
        ├── index.html
        └── *.jpg
```

## CSS (`assets/css/style.css`)
Single file. No preprocessor.

**Custom properties (tokens):**
```
--bg --surface --border
--text --text-secondary --text-tertiary
--accent --accent-hover
--tag-bg --tag-text
--radius (10px) --radius-lg (14px)
```
Dark mode: `@media (prefers-color-scheme: dark)` on `:root`. No JS toggle.
Responsive breakpoint: `max-width: 600px` only.

**Key layout classes:**
- `.container` — max-width 900px, centred
- `.projects-grid` — `repeat(auto-fill, minmax(260px, 1fr))`
- `.gallery` — `repeat(auto-fill, minmax(220px, 1fr))`, items 4:3 ratio
- `.project-hero`, `.project-meta`, `.meta-item`
- `.content-section` — section block with bordered `h2`
- `.parts-table` — styled `<table>`
- `.file-list`, `.file-item` — download list
- `.pdf-viewer` — `width:100%; height:600px`
- `.lightbox`, `.lightbox-close` — full-screen overlay

## Path Conventions
All project pages live two levels deep. From `projects/<slug>/index.html`:
- Root: `../../index.html`
- CSS: `../../assets/css/style.css`
- Assets: `../../assets/`

## Adding a New Project

### 1. Create the project folder
```
projects/<slug>/
├── index.html
└── (images, PDFs, CAD files)
```

### 2. Project page structure (`index.html`)
Copy from an existing project page (e.g. `projects/macro-pad/index.html`). Update:
- `<title>` and `<h1>`
- Breadcrumb span text
- `.subtitle` paragraph
- Three `.meta-item` values (Type, Date, Role)
- `.content-section` blocks for your content

**Gallery item:**
```html
<div class="gallery-item" onclick="openLightbox(this)" data-caption="Caption text">
  <img src="image.jpg" alt="Description" />
</div>
```

**PDF embed (local file):**
```html
<iframe class="pdf-viewer" src="document.pdf" title="Report"></iframe>
```

**PDF embed (GitHub Pages — use Google Docs viewer):**
```html
<iframe class="pdf-viewer" src="https://docs.google.com/viewer?url=https://asbatty.github.io/project-portfolio/projects/<slug>/file.pdf&embedded=true"></iframe>
```

**File download item:**
```html
<a class="file-item" href="file.pdf" download>
  <svg class="file-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
  <div class="file-info">
    <p class="file-name">File Name</p>
    <p class="file-meta">Short description</p>
  </div>
  <svg class="file-download" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
</a>
```

The inline lightbox JS is identical across all project pages — copy it verbatim.

### 3. Add a project card to `index.html`
Inside `<div class="projects-grid">`:
```html
<a class="project-card" href="projects/<slug>/">
  <div class="card-thumb">
    <img src="projects/<slug>/thumb.jpg" alt="Project name" />
  </div>
  <div class="card-body">
    <h3 class="card-title">Project Name</h3>
    <p class="card-desc">One-line description.</p>
    <div class="card-tags">
      <span class="tag">Tag 1</span>
      <span class="tag">Tag 2</span>
    </div>
  </div>
</a>
```
Recommended thumbnail: 800×450px (16:9).

## Current Project Status

| Project | Gallery | PDF | Downloads | Notes |
|---|---|---|---|---|
| macro-pad | 6 images | placeholder only | none | Awaiting PDF writeup |
| mohrs-circle | none | 2 PDFs (Google Docs viewer) | FinalPaper.pdf, ASEE Paper.pdf | Complete; images exist in folder but not linked |
| cctv-camcorder | 1 image | none | none | Overview text incomplete |

## Known TODOs
- `projects/macro-pad/index.html` — replace PDF placeholder section with actual writeup iframe
- `projects/cctv-camcorder/index.html` — complete overview paragraph; add more images and CAD/PDF files when ready
- `projects/mohrs-circle/` — `Prototype App.png`, `Prototype App 2.png`, `PrototypeReal.jpg` exist in folder but are not linked in the gallery



## Recipe Box (`recipes/`)

Digitized archive of Andrew's handwritten cocktail/kitchen notebook. Two sections:
**recipes** (finished specs) and **ideas** (loose concepts). Lives ONE level deep (unlike
projects): from `recipes/*.html`, root is `../index.html`, CSS `../assets/css/style.css`.

```
recipes/
├── index.html          — searchable index: All/Recipes/Ideas tabs, live search, tag chips
├── _template.html      — copy to <slug>.html for a manual entry
├── _inbox/             — drop photos here; GitHub Action transcribes them (see below)
├── originals/          — notebook-NN.jpg, upright & web-sized, linked from pages
└── <slug>.html         — one page per recipe/idea
assets/js/recipe-page.js  — shared renderer
assets/js/recipe-admin.js — in-browser editing (see below)
```

**Data-driven pages:** each page contains a `window.RECIPE_DATA` JSON block rendered by
`recipe-page.js`. Edit the JSON, not the markup.

- `type` — `"recipe"` (versions + ingredients/directions) or `"idea"` (freeform `body` paragraphs)
- `versions[]` — one entry per iteration. Append (bump `version`, keep old ones); the page shows
  a build dropdown, highlights ingredients/steps changed vs. the previous version, and lists
  removed ingredients. `peach-old-fashioned.html` is the worked example (v1 → v2).
- `log[]` — Cook's Log: `{date, text}` entries.
- `original` — `"originals/notebook-NN.jpg"` or `null`. Several recipes can share one notebook
  page (one photo often holds 2–5 recipes).
- `image` — finished-dish/drink photo, `"photos/<slug>.jpg"` or `null`. Rendered as a hero
  image at the top of the page AND as the card thumbnail on the index. Set it with the
  "Add photo" button on the live page, or drop a file in `recipes/photos/` and set the field.

**Index cards:** each entry needs a card in `recipes/index.html` with `data-type`
("recipe"/"idea" — drives the tabs), `data-tags` (comma-separated — filter chips generated
automatically), `data-search` (extra keywords), and optionally `data-thumb` plus a
`<div class="card-thumb"><img …></div>` before `.card-body`. The `<!-- AUTO-CARDS -->` comment
is the pipeline's insertion marker — do not remove.

**Thumbnails are adaptive:** if no card has `data-thumb`, the index renders text-only cards
(no empty boxes). As soon as one card has a photo, the index JS gives every other card a
placeholder thumb so the grid stays even.

**In-browser editing:** `assets/js/recipe-admin.js` adds an edit bar to every recipe/idea page.
"Enable editing" stores a fine-grained GitHub PAT (repo-scoped, Contents read/write) in
localStorage; "Add log entry" and "New version" then mutate `RECIPE_DATA` and commit the page
file back to `Asbatty/project-portfolio` via the GitHub Contents API (regex-replaces the
RECIPE_DATA block, PUT with sha). "Add photo" resizes the chosen image client-side via canvas
(1600px long edge, JPEG q0.85) and makes three commits: the image to `recipes/photos/<slug>.jpg`,
the page (sets `image`), and `recipes/index.html` (adds `data-thumb` + the thumb div to that
card only, via targeted regex on the card block). **After web edits the local clone is behind — `git pull`
before local work.**

**Transcription pipeline:** `.github/workflows/transcribe.yml` runs
`scripts/transcribe_inbox.py` when photos land in `recipes/_inbox/`. The script asks the model
which way is up, rotates the photo upright, downscales to 1568px, transcribes with
`TRANSCRIBE_MODEL` (default claude-sonnet-4-5), writes the page, saves an upright web-sized copy
to `originals/`, inserts the card, and commits with `[skip transcribe]`. Requires Pillow (the
workflow pip-installs it) and the `ANTHROPIC_API_KEY` repo secret. Failed photos stay in the inbox.

**Known gotcha — rotation.** The first batch was transcribed sideways with Haiku and produced
garbage (hallucinated titles like "Carpets with Caramel" for a negroni page). Rotation detection
plus Sonnet fixed it. If transcriptions come back nonsensical, check orientation first.

Recipe CSS lives in `assets/css/style.css` under `/* ---- Recipe Box ---- */`.

Entry points on the landing page: "Recipe Box" nav link + card in the `#recipes` section.

Current contents: 19 recipes + 4 idea pages transcribed from 12 notebook photos
(cocktails, syrups, spherification technique, and a few food recipes).
