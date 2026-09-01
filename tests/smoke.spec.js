const { test, expect } = require('@playwright/test');

// ─── Landing page ────────────────────────────────────────────────────────────

test.describe('Landing page', () => {
  test('loads with correct title and no JS errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto('/');
    expect(errors, `JS errors: ${errors.join(', ')}`).toHaveLength(0);
    await expect(page).toHaveTitle(/Andrew/);
  });

  test('has three project cards', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.project-card')).toHaveCount(3);
  });

  test('hero photo is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.hero-photo img')).toBeVisible();
  });

  test('nav has five links', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav .nav-links a')).toHaveCount(5);
  });
});

// ─── Shared: breadcrumb and no JS errors on all project pages ────────────────

const PROJECTS = [
  { slug: 'macro-pad',       label: 'Macro Pad' },
  { slug: 'mohrs-circle',    label: "Mohr's Circle" },
  { slug: 'cctv-camcorder',  label: 'CCTV Camcorder' },
];

for (const { slug, label } of PROJECTS) {
  test.describe(`${label} — shared`, () => {
    test('loads without JS errors', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));
      await page.goto(`/projects/${slug}/`);
      expect(errors, `JS errors: ${errors.join(', ')}`).toHaveLength(0);
    });

    test('breadcrumb links home', async ({ page }) => {
      await page.goto(`/projects/${slug}/`);
      const crumb = page.locator('.breadcrumb a');
      await expect(crumb).toContainText('Home');
      await expect(crumb).toBeVisible();
    });
  });
}

// ─── Macro Pad ───────────────────────────────────────────────────────────────

test.describe('Macro Pad', () => {
  test('has 6 gallery items', async ({ page }) => {
    await page.goto('/projects/macro-pad/');
    await expect(page.locator('.gallery-item')).toHaveCount(6);
  });

  test('lightbox opens on gallery click and shows image', async ({ page }) => {
    await page.goto('/projects/macro-pad/');
    await page.locator('.gallery-item').first().click();
    await expect(page.locator('#lightbox')).toHaveClass(/active/);
    await expect(page.locator('#lightbox-img')).toHaveAttribute('src', /.+/);
  });

  test('lightbox closes on Escape', async ({ page }) => {
    await page.goto('/projects/macro-pad/');
    await page.locator('.gallery-item').first().click();
    await expect(page.locator('#lightbox')).toHaveClass(/active/);
    await page.keyboard.press('Escape');
    await expect(page.locator('#lightbox')).not.toHaveClass(/active/);
  });

  test('lightbox closes on close button', async ({ page }) => {
    await page.goto('/projects/macro-pad/');
    await page.locator('.gallery-item').first().click();
    await page.locator('.lightbox-close').click();
    await expect(page.locator('#lightbox')).not.toHaveClass(/active/);
  });

  test('CAD file download link present', async ({ page }) => {
    await page.goto('/projects/macro-pad/');
    const dl = page.locator('a.file-item[download]');
    await expect(dl).toHaveCount(1);
    await expect(dl).toHaveAttribute('href', /\.f3d$/);
  });
});

// ─── Mohr's Circle ───────────────────────────────────────────────────────────

test.describe("Mohr's Circle", () => {
  test('has two PDF iframes with non-empty src', async ({ page }) => {
    await page.goto('/projects/mohrs-circle/');
    const iframes = page.locator('iframe.pdf-viewer');
    await expect(iframes).toHaveCount(2);
    for (let i = 0; i < 2; i++) {
      const src = await iframes.nth(i).getAttribute('src');
      expect(src).toBeTruthy();
    }
  });

  test('has two downloadable PDF file links', async ({ page }) => {
    await page.goto('/projects/mohrs-circle/');
    await expect(page.locator('a.file-item[download]')).toHaveCount(2);
  });
});

// ─── CCTV Camcorder ──────────────────────────────────────────────────────────

test.describe('CCTV Camcorder', () => {
  test('has 1 gallery image', async ({ page }) => {
    await page.goto('/projects/cctv-camcorder/');
    await expect(page.locator('.gallery-item')).toHaveCount(1);
  });

  test('lightbox opens on gallery click', async ({ page }) => {
    await page.goto('/projects/cctv-camcorder/');
    await page.locator('.gallery-item').first().click();
    await expect(page.locator('#lightbox')).toHaveClass(/active/);
  });

  test('lightbox closes on Escape', async ({ page }) => {
    await page.goto('/projects/cctv-camcorder/');
    await page.locator('.gallery-item').first().click();
    await page.keyboard.press('Escape');
    await expect(page.locator('#lightbox')).not.toHaveClass(/active/);
  });
});
