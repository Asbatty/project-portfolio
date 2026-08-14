#!/usr/bin/env node
// Checks every relative src/href in HTML files resolves to a real file on disk.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function findHtmlFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...findHtmlFiles(full));
    else if (entry.name.endsWith('.html')) results.push(full);
  }
  return results;
}

function extractRefs(html) {
  const refs = [];
  const re = /(?:src|href)=["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const raw = m[1];
    if (/^(https?:|mailto:|tel:|data:|#)/.test(raw)) continue;
    const clean = raw.split('?')[0].split('#')[0];
    if (clean) refs.push(clean);
  }
  return refs;
}

const htmlFiles = findHtmlFiles(ROOT);
let errors = 0;
let checked = 0;

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const refs = extractRefs(html);
  const dir = path.dirname(file);

  for (const ref of refs) {
    const resolved = path.resolve(dir, ref);
    if (!resolved.startsWith(ROOT)) continue;
    if (!fs.existsSync(resolved)) {
      const rel = path.relative(ROOT, file);
      console.error(`MISSING  ${ref}`);
      console.error(`         in ${rel}\n`);
      errors++;
    }
    checked++;
  }
}

if (errors === 0) {
  console.log(`✓ ${checked} references checked across ${htmlFiles.length} HTML files — no missing assets`);
  process.exit(0);
} else {
  console.error(`${errors} missing reference(s) found`);
  process.exit(1);
}
