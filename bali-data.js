/* ================================================================
   BALI ARQUITETURA — CAMADA DE DADOS (bali-data.js)
   ================================================================
   Gerencia todos os dados do site via localStorage.
   As páginas públicas carregam daqui primeiro; se não houver
   dados salvos, fazem fallback para projetos-data.js (estático).
   ================================================================ */

const BALI_KEYS = {
  hero:       'bali_hero_image',
  portfolio:  'bali_portfolio_images',
  projetos:   'bali_projetos',
  hasData:    'bali_has_admin_data',
};

/* ── Helpers ───────────────────────────────────────────────── */
function _get(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
}
function _set(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); return true; }
  catch (e) { console.warn('bali-data: erro ao salvar', key, e); return false; }
}
function _remove(key) {
  try { localStorage.removeItem(key); } catch {}
}

const BALI_REMOTE_ENDPOINT = '/api/bali-data';
let _baliRemoteData = null;

function _remotePayloadFromCache() {
  return {
    hero: _get(BALI_KEYS.hero),
    portfolio: _get(BALI_KEYS.portfolio),
    projetos: _get(BALI_KEYS.projetos)
  };
}

function _applyRemoteData(data) {
  if (!data || typeof data !== 'object') return;
  _baliRemoteData = data;

  if ('hero' in data) {
    if (data.hero) _set(BALI_KEYS.hero, data.hero);
    else _remove(BALI_KEYS.hero);
  }
  if ('portfolio' in data) {
    if (data.portfolio && data.portfolio.length) _set(BALI_KEYS.portfolio, data.portfolio);
    else _remove(BALI_KEYS.portfolio);
  }
  if ('projetos' in data) {
    if (data.projetos && data.projetos.length) {
      _set(BALI_KEYS.hasData, true);
      _set(BALI_KEYS.projetos, data.projetos);
    }
  }
}

function _baliFetchWithTimeout(url, options, timeout) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout || 1200);
  return fetch(url, Object.assign({}, options || {}, { signal: controller.signal }))
    .finally(() => clearTimeout(timer));
}

const BaliData = {
  ready: Promise.resolve().then(() => {
    if (!window.fetch || location.protocol === 'file:') return _remotePayloadFromCache();
    return _baliFetchWithTimeout(BALI_REMOTE_ENDPOINT, { headers: { 'Accept': 'application/json' } }, 1500)
      .then(resp => resp.ok ? resp.json() : null)
      .then(data => {
        _applyRemoteData(data);
        return data || _remotePayloadFromCache();
      })
      .catch(() => _remotePayloadFromCache());
  }),
  save(key, value) {
    if (!window.fetch || location.protocol === 'file:') return Promise.resolve(false);
    const headers = { 'Content-Type': 'application/json' };
    if (typeof BaliAuth !== 'undefined' && BaliAuth.password()) {
      headers['x-bali-admin-password'] = BaliAuth.password();
    }
    return fetch(BALI_REMOTE_ENDPOINT, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ key: key, value: value })
    })
      .then(resp => {
        if (!resp.ok) throw new Error('Erro ao salvar no Neon');
        return true;
      })
      .catch(err => {
        console.warn('bali-data: Neon indisponível', err);
        return false;
      });
  },
  remove(key) {
    if (!window.fetch || location.protocol === 'file:') return Promise.resolve(false);
    const headers = {};
    if (typeof BaliAuth !== 'undefined' && BaliAuth.password()) {
      headers['x-bali-admin-password'] = BaliAuth.password();
    }
    return fetch(BALI_REMOTE_ENDPOINT + '?key=' + encodeURIComponent(key), {
      method: 'DELETE',
      headers: headers
    })
      .then(resp => {
        if (!resp.ok) throw new Error('Erro ao remover no Neon');
        return true;
      })
      .catch(err => {
        console.warn('bali-data: Neon indisponível', err);
        return false;
      });
  }
};

/* ── Hero Image ────────────────────────────────────────────── */
const BaliHero = {
  get()        { return _get(BALI_KEYS.hero); },           // base64 string ou null
  set(base64)  { const ok = _set(BALI_KEYS.hero, base64); if (ok) BaliData.save('hero', base64); return ok; },
  remove()     { _remove(BALI_KEYS.hero); BaliData.remove('hero'); },
  hasCustom()  { return !!_get(BALI_KEYS.hero); },
};

/* ── Portfolio Images (home slideshow) ─────────────────────── */
// Array de objetos: [{ src: 'base64 ou path', alt: 'texto' }, ...]
const BaliPortfolio = {
  get() {
    const saved = _get(BALI_KEYS.portfolio);
    if (!saved || !saved.length) return null;  // null = usar estáticos
    return saved
      .map(item => typeof item === 'string' ? { src: item, alt: '' } : item)
      .filter(item => item && item.src);
  },
  set(arr)     { const ok = _set(BALI_KEYS.portfolio, arr); if (ok) BaliData.save('portfolio', arr); return ok; },
  remove()     { _remove(BALI_KEYS.portfolio); BaliData.remove('portfolio'); },
  hasCustom()  { const d = _get(BALI_KEYS.portfolio); return !!(d && d.length); },
};

/* ── Projetos ──────────────────────────────────────────────── */
const BaliProjetos = {
  /* Retorna array de projetos: admin primeiro, fallback PROJETOS estático */
  getAll() {
    const saved = _get(BALI_KEYS.projetos);
    if (saved && saved.length) return saved;
    if (typeof PROJETOS !== 'undefined') return PROJETOS;   // fallback estático
    return [];
  },
  /* Retorna projeto por id */
  getById(id) {
    return this.getAll().find(p => p.id === id) || null;
  },
  /* Salva array completo */
  setAll(arr)  { _set(BALI_KEYS.hasData, true); const ok = _set(BALI_KEYS.projetos, arr); if (ok) BaliData.save('projetos', arr); return ok; },
  /* Adiciona ou atualiza projeto */
  upsert(projeto) {
    const list  = this.getAll();
    const idx   = list.findIndex(p => p.id === projeto.id);
    if (idx >= 0) list[idx] = projeto; else list.push(projeto);
    return this.setAll(list);
  },
  /* Remove projeto por id */
  remove(id) {
    const list = this.getAll().filter(p => p.id !== id);
    return this.setAll(list);
  },
  hasCustom() {
    const d = _get(BALI_KEYS.projetos);
    return !!(d && d.length);
  },
};

/* ── Admin Auth ────────────────────────────────────────────── */
const BaliAuth = {
  // Senha codificada em btoa (verificável no console: btoa('bali2026') = 'YmFsaTIwMjY=')
  // Para trocar a senha: substitua 'YmFsaTIwMjY=' por btoa('sua-nova-senha')
  PASS_B64: 'YmFsaTIwMjY=',  // = btoa('bali2026')
  check(senha)  { try { return btoa(senha) === this.PASS_B64; } catch { return false; } },
  login(senha)  { sessionStorage.setItem('bali_admin', '1'); if (senha) sessionStorage.setItem('bali_admin_pass', senha); },
  logout()      { sessionStorage.removeItem('bali_admin'); sessionStorage.removeItem('bali_admin_pass'); },
  isLogged()    { return sessionStorage.getItem('bali_admin') === '1'; },
  password()    { return sessionStorage.getItem('bali_admin_pass') || ''; },
};

/* ── Utilitário: lê arquivo como base64 ───────────────────── */
function baliReadFile(file, options) {
  options = Object.assign({
    maxWidth: 1600,
    maxHeight: 1200,
    quality: 0.82,
    type: 'image/jpeg'
  }, options || {});

  return new Promise((resolve, reject) => {
    if (!file || !file.type || !file.type.startsWith('image/')) {
      reject(new Error('Arquivo inválido'));
      return;
    }

    const reader = new FileReader();
    reader.onload  = e => {
      const original = e.target.result;

      if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
        resolve(original);
        return;
      }

      const img = new Image();
      img.onload = () => {
        const sourceW = img.naturalWidth || img.width;
        const sourceH = img.naturalHeight || img.height;
        if (!sourceW || !sourceH) {
          resolve(original);
          return;
        }

        const scale = Math.min(1, options.maxWidth / sourceW, options.maxHeight / sourceH);
        const width = Math.max(1, Math.round(sourceW * scale));
        const height = Math.max(1, Math.round(sourceH * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(original);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        try {
          resolve(canvas.toDataURL(options.type, options.quality));
        } catch (err) {
          resolve(original);
        }
      };
      img.onerror = () => resolve(original);
      img.src = original;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ── Utilitário: gera ID slug a partir do nome ────────────── */
function baliSlug(str) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
