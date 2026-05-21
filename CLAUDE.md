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
