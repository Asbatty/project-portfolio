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

Digitized archive of handwritten recipes (finished dishes) and ideas (scribbled notes).
Lives ONE level deep (unlike projects): from `recipes/*.html`, root is `../index.html`,
CSS is `../assets/css/style.css`.

```
recipes/
├── index.html          — searchable index: All/Recipes/Ideas tabs, live search, tag chips
├── _template.html      — copy to <slug>.html for a manual entry
├── _inbox/             — drop photos here; GitHub Action transcribes them (see below)
├── originals/          — photos of the handwritten originals, linked from pages
└── <slug>.html         — one page per recipe/idea
assets/js/recipe-page.js — shared renderer for all recipe/idea pages
```

**Data-driven pages:** each page contains a `window.RECIPE_DATA` JSON block; the DOM is
rendered by `assets/js/recipe-page.js`. To change content, edit the JSON — not the markup.

- `type` — `"recipe"` (versions + ingredients/directions) or `"idea"` (freeform `body` paragraphs)
- `versions[]` — one entry per iteration. Append a new object (bump `version`, keep the old
  ones) when the recipe changes; the page shows a dropdown of builds, with ingredients/steps
  changed vs. the previous version highlighted and removed ingredients listed.
- `log[]` — Cook's Log: dated comment entries `{date, text}`. Append to add a comment.
- `original` — path like `"originals/<slug>.jpg"` or `null`.

**Index cards:** each entry needs a card in `recipes/index.html` with `data-type`
("recipe"/"idea" — drives the tabs), `data-tags` (comma-separated — filter chips are
generated automatically), and `data-search` (extra keywords: ingredients, source).
The `<!-- AUTO-CARDS -->` comment is the pipeline's insertion marker — do not remove.

**Transcription pipeline:** `.github/workflows/transcribe.yml` runs
`scripts/transcribe_inbox.py` (stdlib-only, page template at
`scripts/recipe_page_template.html`) when photos land in `recipes/_inbox/`. It calls the
Anthropic API (`ANTHROPIC_API_KEY` repo secret; model via `TRANSCRIBE_MODEL`, default
claude-haiku-4-5), writes the page, moves the photo to `originals/`, inserts the card, and
commits with `[skip transcribe]`. Failed photos stay in the inbox. Setup instructions:
`recipes/_inbox/README.md`.

**In-browser editing:** `assets/js/recipe-admin.js` (loaded on every recipe/idea page)
adds an edit bar: "Enable editing" stores a fine-grained GitHub PAT (repo-scoped, Contents
read/write) in localStorage; then "Add log entry" and "New version" forms mutate
`RECIPE_DATA` and commit the page file back to `Asbatty/project-portfolio` via the GitHub
Contents API (regex-replaces the RECIPE_DATA block, PUT with sha). The local clone will be
behind after web edits — `git pull` before local work.

Recipe CSS lives in `assets/css/style.css` under `/* ---- Recipe Box ---- */`
(search, filter chips, tabs, version bar, changed-item highlight, Cook's Log).

Entry points on the landing page: "Recipe Box" nav link + card in the `#recipes` section.

Current status: sample pages only (`sample-pancakes.html` — demonstrates the version
switcher and Cook's Log — and `sample-idea.html`). Delete them and their cards once real
entries exist. API key secret not yet configured by the user.
