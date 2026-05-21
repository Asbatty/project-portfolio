# Portfolio

Personal engineering portfolio — built with plain HTML/CSS, no framework or build step.

Live site: [asbatty.github.io/project-portfolio](https://asbatty.github.io/project-portfolio/)

## Projects

- **Mohr's Circle Demo Tool** — strain gauge + ESP32 + MATLAB real-time stress visualiser
- **Macro Pad** — custom mechanical macro keyboard with display, v1–v3
- **CCTV Camcorder** — repurposed CCTV camera converted into a handheld camcorder

## Structure

```
project-portfolio/
├── index.html                  ← landing page
├── assets/
│   └── css/style.css           ← all styles
└── projects/
    ├── mohrs-circle/index.html
    ├── macro-pad/index.html
    └── cctv-camcorder/index.html
```

See [CLAUDE.md](CLAUDE.md) for full structure, CSS reference, and how to add a new project.

## Running Locally

No build step needed. Open `index.html` directly in a browser, or use any static file server:

```
npx serve .
# or
python -m http.server
```

## Deploying to GitHub Pages

1. Push to GitHub:
   ```
   git remote add origin https://github.com/asbatty/project-portfolio.git
   git push -u origin main
   ```

2. Go to repo **Settings → Pages → Source → Deploy from branch → `main` / `/ (root)`**.

3. Site goes live at `https://asbatty.github.io/project-portfolio/` in ~2 minutes.
