/* Recipe Box in-browser editing.
   Adds an edit bar to recipe/idea pages. With a GitHub fine-grained token saved
   (localStorage, this browser only), "Add log entry" and "New version" forms commit
   the updated RECIPE_DATA block straight back to the repo via the GitHub Contents API.
   The live site refreshes when GitHub Pages rebuilds (usually under a minute or two).

   Token setup (one time): github.com → Settings → Developer settings →
   Fine-grained personal access tokens → Generate new token →
   Repository access: Only select repositories → project-portfolio →
   Permissions → Contents: Read and write. Paste it into "Enable editing" below. */
(function () {
  const OWNER = 'Asbatty';
  const REPO = 'project-portfolio';
  const BRANCH = 'main';
  const TOKEN_KEY = 'recipeBoxToken';

  const d = window.RECIPE_DATA;
  if (!d) return;

  // repo path of this page, e.g. "recipes/sample-pancakes.html"
  const fileName = decodeURIComponent(location.pathname.split('/').pop() || '');
  if (!fileName.endsWith('.html')) return;
  const REPO_PATH = 'recipes/' + fileName;

  const enc = new TextEncoder();
  const dec = new TextDecoder();
  const toB64 = (str) => {
    const bytes = enc.encode(str);
    let bin = '';
    bytes.forEach(b => { bin += String.fromCharCode(b); });
    return btoa(bin);
  };
  const fromB64 = (b64) => {
    const bin = atob(b64.replace(/\n/g, ''));
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return dec.decode(bytes);
  };
  const today = () => {
    const t = new Date();
    return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
  };

  // ---- UI scaffolding ----
  const host = document.createElement('div');
  host.className = 'admin-bar';
  host.id = 'admin-bar';
  document.getElementById('rp-content').insertAdjacentElement('afterend', host);

  function getToken() { try { return localStorage.getItem(TOKEN_KEY) || ''; } catch (e) { return ''; } }
  function setToken(t) { try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch (e) {} }

  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function status(msg, isError) {
    let s = host.querySelector('.admin-status');
    if (!s) { s = el('p', 'admin-status'); host.appendChild(s); }
    s.textContent = msg;
    s.classList.toggle('error', !!isError);
  }

  function renderBar() {
    host.innerHTML = '';
    const row = el('div', 'admin-row');
    host.appendChild(row);

    if (!getToken()) {
      const btn = el('button', 'btn admin-btn', '✎ Enable editing');
      btn.type = 'button';
      btn.addEventListener('click', () => showTokenForm());
      row.appendChild(btn);
      return;
    }

    const logBtn = el('button', 'btn admin-btn', '+ Add log entry');
    logBtn.type = 'button';
    logBtn.addEventListener('click', () => showLogForm());
    row.appendChild(logBtn);

    const photoBtn = el('button', 'btn admin-btn', d.image ? '⟳ Replace photo' : '+ Add photo');
    photoBtn.type = 'button';
    photoBtn.addEventListener('click', () => showPhotoForm());
    row.appendChild(photoBtn);

    if (d.type !== 'idea') {
      const verBtn = el('button', 'btn admin-btn', '+ New version');
      verBtn.type = 'button';
      verBtn.addEventListener('click', () => showVersionForm());
      row.appendChild(verBtn);
    }

    const out = el('button', 'btn admin-btn admin-quiet', 'Disable editing');
    out.type = 'button';
    out.addEventListener('click', () => { setToken(''); renderBar(); });
    row.appendChild(out);
  }

  function formWrap(title) {
    let f = host.querySelector('.admin-form');
    if (f) f.remove();
    f = el('div', 'admin-form');
    f.appendChild(el('p', 'admin-form-title', title));
    host.appendChild(f);
    return f;
  }

  function showTokenForm() {
    const f = formWrap('Paste your GitHub token (stored only in this browser)');
    const input = el('input', 'recipe-search');
    input.type = 'password';
    input.placeholder = 'github_pat_…';
    const hint = el('p', 'admin-hint');
    hint.innerHTML = 'Create one at GitHub → Settings → Developer settings → ' +
      '<a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener" style="text-decoration:underline">Fine-grained tokens</a>. ' +
      'Repository access: only <b>' + REPO + '</b>. Permissions: Contents → Read and write.';
    const save = el('button', 'btn btn-solid admin-btn', 'Save');
    save.type = 'button';
    save.addEventListener('click', () => {
      if (!input.value.trim()) return;
      setToken(input.value.trim());
      renderBar();
      status('Editing enabled on this browser.');
    });
    f.appendChild(input); f.appendChild(hint); f.appendChild(save);
    input.focus();
  }

  function showLogForm() {
    const f = formWrap('New Cook’s Log entry');
    const date = el('input', 'recipe-search');
    date.value = today();
    date.setAttribute('aria-label', 'Date');
    const text = el('textarea', 'recipe-search admin-textarea');
    text.placeholder = 'e.g. Tried it with brown butter — better.';
    text.rows = 3;
    const save = el('button', 'btn btn-solid admin-btn', 'Save to site');
    save.type = 'button';
    save.addEventListener('click', () => {
      if (!text.value.trim()) return;
      d.log = d.log || [];
      d.log.push({ date: date.value.trim() || today(), text: text.value.trim() });
      commit('Add log entry: ' + d.title, save, f);
    });
    f.appendChild(date); f.appendChild(text); f.appendChild(save);
    text.focus();
  }

  function showVersionForm() {
    const versions = d.versions || [];
    const last = versions[versions.length - 1] || { version: 0, ingredients: [], directions: [], notes: '' };
    const f = formWrap('New version (v' + (Number(last.version || 0) + 1) + ') — edit below, one item per line');

    f.appendChild(el('p', 'admin-hint', 'Ingredients'));
    const ing = el('textarea', 'recipe-search admin-textarea');
    ing.rows = Math.max(6, (last.ingredients || []).length + 1);
    ing.value = (last.ingredients || []).join('\n');
    f.appendChild(ing);

    f.appendChild(el('p', 'admin-hint', 'Directions'));
    const dir = el('textarea', 'recipe-search admin-textarea');
    dir.rows = Math.max(5, (last.directions || []).length + 1);
    dir.value = (last.directions || []).join('\n');
    f.appendChild(dir);

    f.appendChild(el('p', 'admin-hint', 'Notes — what changed and why'));
    const notes = el('textarea', 'recipe-search admin-textarea');
    notes.rows = 2;
    notes.value = '';
    f.appendChild(notes);

    const save = el('button', 'btn btn-solid admin-btn', 'Save new version');
    save.type = 'button';
    save.addEventListener('click', () => {
      const lines = (v) => v.split('\n').map(s => s.trim()).filter(Boolean);
      const next = {
        version: Number(last.version || 0) + 1,
        date: today().slice(0, 7),
        ingredients: lines(ing.value),
        directions: lines(dir.value),
        notes: notes.value.trim()
      };
      if (!next.ingredients.length || !next.directions.length) { status('Ingredients and directions can’t be empty.', true); return; }
      d.versions = versions.concat([next]);
      commit('New version v' + next.version + ': ' + d.title, save, f);
    });
    f.appendChild(save);
  }

  // ---- Photo upload ----
  const SLUG = fileName.replace(/\.html$/, '');
  const PHOTO_PATH = 'recipes/photos/' + SLUG + '.jpg';
  const PHOTO_REL = 'photos/' + SLUG + '.jpg';

  // Shrink client-side so the repo stays small and the API stays happy.
  function shrink(file, maxEdge) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        let { width: w, height: h } = img;
        const longest = Math.max(w, h);
        if (longest > maxEdge) { const s = maxEdge / longest; w = Math.round(w * s); h = Math.round(h * s); }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        canvas.toBlob(b => b ? resolve(b) : reject(new Error('Could not process that image.')), 'image/jpeg', 0.85);
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('That file could not be read as an image.')); };
      img.src = url;
    });
  }

  function blobToB64(blob) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result).split(',')[1]);
      r.onerror = () => reject(new Error('Could not encode the image.'));
      r.readAsDataURL(blob);
    });
  }

  function showPhotoForm() {
    const f = formWrap(d.image ? 'Replace the photo' : 'Add a photo');
    f.appendChild(el('p', 'admin-hint',
      'Shown at the top of this page and as its thumbnail on the Recipe Box index. ' +
      'Resized to 1600px and saved to the repo automatically.'));
    const input = el('input', 'recipe-search');
    input.type = 'file';
    input.accept = 'image/*';
    const preview = el('div', 'admin-preview');
    preview.hidden = true;
    const prevImg = document.createElement('img');
    preview.appendChild(prevImg);
    let blob = null;

    input.addEventListener('change', async () => {
      const file = input.files && input.files[0];
      if (!file) return;
      try {
        status('Processing image…');
        blob = await shrink(file, 1600);
        prevImg.src = URL.createObjectURL(blob);
        preview.hidden = false;
        status('Ready — ' + Math.round(blob.size / 1024) + ' KB after resizing.');
      } catch (err) { status(err.message, true); }
    });

    const save = el('button', 'btn btn-solid admin-btn', 'Save photo');
    save.type = 'button';
    save.addEventListener('click', async () => {
      if (!blob) { status('Choose an image first.', true); return; }
      save.disabled = true;
      try {
        const b64 = await blobToB64(blob);
        await commitPhoto(b64);
        d.image = PHOTO_REL;
        await commit('Add photo: ' + d.title, save, f, true);
        await updateIndexThumb();
        status('Saved ✓ — photo, recipe page, and index card all committed.');
      } catch (err) {
        status(err.message || String(err), true);
        save.disabled = false;
      }
    });
    f.appendChild(input); f.appendChild(preview); f.appendChild(save);
  }

  function ghHeaders() {
    return {
      'Authorization': 'Bearer ' + getToken(),
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };
  }
  const apiFor = (p) => 'https://api.github.com/repos/' + OWNER + '/' + REPO + '/contents/' + p;

  async function shaOf(path) {
    const r = await fetch(apiFor(path) + '?ref=' + BRANCH, { headers: ghHeaders() });
    if (r.status === 404) return null;
    if (!r.ok) throw new Error('GitHub read failed for ' + path + ' (HTTP ' + r.status + ').');
    return (await r.json()).sha;
  }

  async function commitPhoto(b64) {
    status('Uploading photo…');
    const sha = await shaOf(PHOTO_PATH);
    const body = { message: 'Photo for ' + d.title + ' (web upload)', content: b64, branch: BRANCH };
    if (sha) body.sha = sha;
    const r = await fetch(apiFor(PHOTO_PATH), { method: 'PUT', headers: ghHeaders(), body: JSON.stringify(body) });
    if (!r.ok) {
      const e = await r.json().catch(() => ({}));
      throw new Error('Photo upload failed (HTTP ' + r.status + '): ' + (e.message || ''));
    }
  }

  // Add/replace the thumbnail on this recipe's card in recipes/index.html
  async function updateIndexThumb() {
    status('Updating the index card…');
    const path = 'recipes/index.html';
    const r = await fetch(apiFor(path) + '?ref=' + BRANCH, { headers: ghHeaders() });
    if (!r.ok) throw new Error('Could not read the index (HTTP ' + r.status + ').');
    const file = await r.json();
    const src = fromB64(file.content);
    const esc = SLUG.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp('<a class="project-card recipe-card" href="' + esc + '\\.html"[\\s\\S]*?<div class="card-body">');
    const found = src.match(re);
    if (!found) throw new Error('Could not find this recipe’s card in the index.');
    let block = found[0];
    block = /data-thumb="[^"]*"/.test(block)
      ? block.replace(/data-thumb="[^"]*"/, 'data-thumb="' + PHOTO_REL + '"')
      : block.replace(/(href="[^"]*")/, '$1\n             data-thumb="' + PHOTO_REL + '"');
    block = /<div class="card-thumb">/.test(block)
      ? block.replace(/(<div class="card-thumb">\s*<img src=")[^"]*(")/, '$1' + PHOTO_REL + '$2')
      : block.replace(/<div class="card-body">/,
          '<div class="card-thumb"><img src="' + PHOTO_REL + '" alt="" loading="lazy" /></div>\n            <div class="card-body">');
    const updated = src.replace(re, () => block);
    const put = await fetch(apiFor(path), {
      method: 'PUT', headers: ghHeaders(),
      body: JSON.stringify({
        message: 'Thumbnail for ' + d.title + ' (web upload)',
        content: toB64(updated), sha: file.sha, branch: BRANCH })
    });
    if (!put.ok) {
      const e = await put.json().catch(() => ({}));
      throw new Error('Index update failed (HTTP ' + put.status + '): ' + (e.message || ''));
    }
  }

  // ---- GitHub commit ----
  async function commit(message, btn, form, quiet) {
    const token = getToken();
    btn.disabled = true;
    status(quiet ? 'Saving the recipe page…' : 'Saving to GitHub…');
    const api = 'https://api.github.com/repos/' + OWNER + '/' + REPO + '/contents/' + REPO_PATH;
    const headers = {
      'Authorization': 'Bearer ' + token,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };
    try {
      const getResp = await fetch(api + '?ref=' + BRANCH, { headers });
      if (getResp.status === 401 || getResp.status === 403) throw new Error('Token rejected — check it has Contents read/write on ' + REPO + '.');
      if (!getResp.ok) throw new Error('Could not load page file from GitHub (HTTP ' + getResp.status + ').');
      const file = await getResp.json();
      const src = fromB64(file.content);

      const re = /window\.RECIPE_DATA\s*=\s*[\s\S]*?;\s*\n(\s*<\/script>)/;
      if (!re.test(src)) throw new Error('Could not find the RECIPE_DATA block in the page file.');
      const updated = src.replace(re, 'window.RECIPE_DATA = ' + JSON.stringify(window.RECIPE_DATA, null, 2) + ';\n$1');

      const putResp = await fetch(api, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          message: message + ' (web edit)',
          content: toB64(updated),
          sha: file.sha,
          branch: BRANCH
        })
      });
      if (!putResp.ok) {
        const err = await putResp.json().catch(() => ({}));
        throw new Error('GitHub rejected the save (HTTP ' + putResp.status + '): ' + (err.message || ''));
      }
      if (quiet) return;
      if (form) form.remove();
      if (window.__rerenderRecipe) window.__rerenderRecipe();
      renderBar();
      status('Saved ✓ — committed to GitHub. The live site updates in a minute or two.');
    } catch (err) {
      if (quiet) throw err;
      status(err.message || String(err), true);
      btn.disabled = false;
    }
  }

  renderBar();
})();
