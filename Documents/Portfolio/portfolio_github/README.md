# Portfolio

Personal engineering portfolio — built with plain HTML/CSS, no framework or build step.

## Structure

```
portfolio/
├── index.html                        ← landing page
├── assets/
│   └── css/style.css                 ← all styles
└── projects/
    ├── mohrs-circle/
    │   ├── index.html
    │   ├── img-01.jpg                ← add your images here
    │   ├── report.pdf
    │   ├── firmware.ino
    │   ├── mohrs-circle.m
    │   └── cad-assembly.step
    ├── macro-pad/
    │   ├── index.html
    │   └── ...
    └── cctv-camcorder/
        ├── index.html
        └── ...
```

## Deploying to GitHub Pages

1. Create a new GitHub repo — name it `yourusername.github.io` for a root URL,
   or any name for `yourusername.github.io/repo-name`.

2. Push this folder as the root of the repo:
   ```
   git init
   git add .
   git commit -m "initial portfolio"
   git remote add origin https://github.com/yourusername/yourusername.github.io.git
   git push -u origin main
   ```

3. Go to repo Settings → Pages → Source → Deploy from branch → `main` / `/ (root)`.

4. Your site will be live at `https://yourusername.github.io` in ~2 minutes.

## Customizing

### Personal details
Search and replace `your@email.com`, `yourusername`, `yourprofile` across all files.

### Adding images to a project
In any project `index.html`, find the gallery section and replace the placeholder divs:

```html
<!-- Before -->
<div class="gallery-item" onclick="openLightbox(this)">
  <div class="gallery-placeholder">...</div>
</div>

<!-- After -->
<div class="gallery-item" onclick="openLightbox(this)">
  <img src="img-01.jpg" alt="Short description of the image" />
</div>
```

Put the image files in the same folder as the project `index.html`.

### Embedding a PDF report
In the "Report / documentation" section, replace the placeholder `<p>` with:

```html
<iframe class="pdf-viewer" src="report.pdf" title="Project report"></iframe>
```

The viewer is 600px tall by default. Change it in `style.css` under `.pdf-viewer`.

### Adding a file download
In the "Files" section, copy an existing `<a class="file-item">` block and update:
- `href` — path to the file (relative to the project folder)
- `download` — triggers a download instead of opening in browser
- The file name and description text inside

### Adding a new project
1. Duplicate an existing project folder.
2. Edit its `index.html` with the new project details.
3. Add a new `<a class="project-card">` block to `index.html` in the root,
   pointing to `projects/new-project/index.html`.

### Adding a thumbnail to a project card
In `index.html` (root), find the card for your project and replace the placeholder:

```html
<!-- Before -->
<div class="card-thumb-placeholder">⬡</div>

<!-- After -->
<img src="projects/your-project/thumb.jpg" alt="Short description" />
```

Recommended thumbnail size: 800×450px (16:9).

## Resume
Drop a `resume.pdf` into `assets/` — it's already linked from the landing page.
