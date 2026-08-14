/* Recipe Box page renderer.
   Each recipe/idea page embeds its data as `window.RECIPE_DATA` (see recipes/_template.html),
   then includes this script. It renders the hero, version switcher, ingredients/directions
   (with changes vs the previous version highlighted), notes, Cook's Log, and original-photo link.
   Re-render after mutating RECIPE_DATA by calling window.__rerenderRecipe()
   (used by recipe-admin.js after an in-browser edit is saved). */
(function () {
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? '' : s);

  function render() {
    const d = window.RECIPE_DATA;
    if (!d) return;

    // ---- Hero ----
    document.title = d.title + ' — Recipe Box';
    $('rp-crumb').textContent = d.title;
    $('rp-title').textContent = d.title;
    $('rp-subtitle').textContent = d.subtitle || '';

    const metaWrap = $('rp-meta');
    metaWrap.innerHTML = '';
    const metaPairs = d.type === 'idea'
      ? [['Type', 'Idea'], ['Category', d.category], ['Jotted down', d.source]]
      : [['Source', d.source], ['Category', d.category], ['Yield', d.yield]];
    metaPairs.forEach(([label, value]) => {
      if (!value) return;
      const item = document.createElement('div');
      item.className = 'meta-item';
      item.innerHTML = '<span class="meta-label"></span><span class="meta-value"></span>';
      item.querySelector('.meta-label').textContent = label;
      item.querySelector('.meta-value').textContent = value;
      metaWrap.appendChild(item);
    });

    const content = $('rp-content');
    content.innerHTML = '';
    const section = (title) => {
      const s = document.createElement('div');
      s.className = 'content-section';
      const h = document.createElement('h2');
      h.textContent = title;
      s.appendChild(h);
      content.appendChild(s);
      return s;
    };

    // ---- Cook's Log ----
    function renderLog() {
      const entries = d.log || [];
      const s = section("Cook's Log");
      if (!entries.length) {
        const p = document.createElement('p');
        p.className = 'log-empty';
        p.textContent = 'No entries yet.';
        s.appendChild(p);
        return;
      }
      const list = document.createElement('div');
      list.className = 'log-list';
      entries.forEach(e => {
        const item = document.createElement('div');
        item.className = 'log-entry';
        const date = document.createElement('p');
        date.className = 'log-date';
        date.textContent = esc(e.date);
        const text = document.createElement('p');
        text.className = 'log-text';
        text.textContent = esc(e.text);
        item.appendChild(date);
        item.appendChild(text);
        list.appendChild(item);
      });
      s.appendChild(list);
    }

    // ---- Original photo link ----
    function renderOriginal() {
      if (!d.original) return;
      const s = section('Original');
      const a = document.createElement('a');
      a.className = 'file-item';
      a.href = d.original;
      a.target = '_blank';
      a.rel = 'noopener';
      a.innerHTML =
        '<svg class="file-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' +
        '<div class="file-info"><p class="file-name">Handwritten original</p><p class="file-meta">Photo of the original card / note</p></div>' +
        '<svg class="file-download" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>';
      s.appendChild(a);
    }

    // ---- Idea pages: freeform body + log, no versions ----
    if (d.type === 'idea') {
      const body = section('The idea');
      (d.body || []).forEach(par => {
        const p = document.createElement('p');
        p.textContent = par;
        body.appendChild(p);
      });
      renderLog();
      renderOriginal();
      return;
    }

    // ---- Recipe pages: version switcher ----
    const versions = (d.versions || []).slice().sort((a, b) => (a.version || 0) - (b.version || 0));
    if (!versions.length) { renderLog(); renderOriginal(); return; }
    let currentIdx = versions.length - 1;

    let versionNote = null;
    if (versions.length > 1) {
      const wrap = document.createElement('div');
      wrap.className = 'version-bar';
      const label = document.createElement('span');
      label.className = 'version-label';
      label.textContent = 'Viewing build:';
      const sel = document.createElement('select');
      sel.className = 'version-select';
      sel.setAttribute('aria-label', 'Recipe version');
      versions.forEach((v, i) => {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = 'v' + v.version + (v.date ? ' — ' + v.date : '') + (i === versions.length - 1 ? ' (current)' : '');
        sel.appendChild(opt);
      });
      sel.value = String(currentIdx);
      sel.addEventListener('change', () => { currentIdx = Number(sel.value); renderVersion(); });
      versionNote = document.createElement('span');
      versionNote.className = 'version-note';
      wrap.appendChild(label);
      wrap.appendChild(sel);
      wrap.appendChild(versionNote);
      content.appendChild(wrap);
    }

    const versionHost = document.createElement('div');
    content.appendChild(versionHost);

    function renderVersion() {
      versionHost.innerHTML = '';
      const v = versions[currentIdx];
      const prev = currentIdx > 0 ? versions[currentIdx - 1] : null;
      if (versionNote) {
        versionNote.textContent = !prev ? '' : (currentIdx !== versions.length - 1)
          ? 'Older build — highlights show what changed from v' + prev.version
          : 'Highlights show what changed from v' + prev.version;
      }

      const ing = document.createElement('div');
      ing.className = 'content-section';
      ing.innerHTML = '<h2>Ingredients</h2>';
      const ul = document.createElement('ul');
      ul.className = 'ingredient-list';
      const prevSet = prev ? new Set((prev.ingredients || []).map(s => s.trim().toLowerCase())) : null;
      (v.ingredients || []).forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        if (prevSet && !prevSet.has(item.trim().toLowerCase())) li.classList.add('changed');
        ul.appendChild(li);
      });
      ing.appendChild(ul);
      if (prev) {
        const curSet = new Set((v.ingredients || []).map(s => s.trim().toLowerCase()));
        const removed = (prev.ingredients || []).filter(s => !curSet.has(s.trim().toLowerCase()));
        if (removed.length) {
          const p = document.createElement('p');
          p.className = 'removed-note';
          p.textContent = 'No longer in this build: ' + removed.join('; ');
          ing.appendChild(p);
        }
      }
      versionHost.appendChild(ing);

      const dir = document.createElement('div');
      dir.className = 'content-section';
      dir.innerHTML = '<h2>Directions</h2>';
      const ol = document.createElement('ol');
      ol.className = 'direction-list';
      const prevDirs = prev ? new Set((prev.directions || []).map(s => s.trim().toLowerCase())) : null;
      (v.directions || []).forEach(step => {
        const li = document.createElement('li');
        li.textContent = step;
        if (prevDirs && !prevDirs.has(step.trim().toLowerCase())) li.classList.add('changed');
        ol.appendChild(li);
      });
      dir.appendChild(ol);
      versionHost.appendChild(dir);

      if (v.notes) {
        const n = document.createElement('div');
        n.className = 'content-section';
        n.innerHTML = '<h2>Notes</h2>';
        const p = document.createElement('p');
        p.textContent = v.notes;
        n.appendChild(p);
        versionHost.appendChild(n);
      }
    }

    renderVersion();
    renderLog();
    renderOriginal();
  }

  window.__rerenderRecipe = render;
  render();
})();
