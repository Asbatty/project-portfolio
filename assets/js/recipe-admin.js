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

  // ---- GitHub commit ----
  async function commit(message, btn, form) {
    const token = getToken();
    btn.disabled = true;
    status('Saving to GitHub…');
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
      if (form) form.remove();
      if (window.__rerenderRecipe) window.__rerenderRecipe();
      renderBar();
      status('Saved ✓ — committed to GitHub. The live site updates in a minute or two.');
    } catch (err) {
      status(err.message || String(err), true);
      btn.disabled = false;
    }
  }

  renderBar();
})();
