/* Velora Core V4: utilities, safe storage, persisted preferences, icons.
   Load in <head> after velora-tokens.js so preferences apply before first paint (no flash).
   Pure functions (sanitize, format) work in Node for unit tests. */
(function (g) {
  'use strict';
  const V = g.Velora = g.Velora || {};
  const T = V.tokens || { palettes: {}, preferences: {} };
  const hasDOM = typeof document !== 'undefined';

  /* ---------- DOM utilities ---------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  /* h('button.vl-btn', {type:'button', onclick}, 'Label', child) builds real nodes; text is never parsed as HTML. */
  function h(tag, attrs, ...kids) {
    const [name, ...cls] = tag.split('.');
    const el = document.createElement(name || 'div');
    if (cls.length) el.className = cls.join(' ');
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'class') el.className += (el.className ? ' ' : '') + v;
      else if (k === 'style' && typeof v === 'object') Object.entries(v).forEach(([sk, sv]) => { if (sk.startsWith('--')) el.style.setProperty(sk, sv); else el.style[sk] = sv; });
      else if (k === 'dataset') Object.assign(el.dataset, v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
    return el;
  }
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  let uidN = 0;
  const uid = p => (p || 'vl') + '-' + (++uidN).toString(36);
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

  /* ---------- Formatting (fr-FR, figures stay tabular in tables) ---------- */
  const nf = new Intl.NumberFormat('fr-FR');
  const fmt = {
    int: n => nf.format(Math.round(n)),
    dec: (n, d = 1) => new Intl.NumberFormat('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d }).format(n),
    pct: (n, d = 0) => new Intl.NumberFormat('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d }).format(n) + ' %',
    money: n => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Math.round(n)),
    compact: n => Math.abs(n) >= 1e6 ? fmt.dec(n / 1e6, 1) + ' M' : Math.abs(n) >= 1e4 ? fmt.dec(n / 1e3, 1) + ' k' : nf.format(Math.round(n)),
    ms: n => nf.format(Math.round(n)) + ' ms',
    date: d => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
    dateShort: d => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
    time: d => new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    relative(d, now) {
      const s = Math.round(((now || Date.now()) - new Date(d)) / 1000);
      const rtf = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' });
      const abs = Math.abs(s);
      if (abs < 60) return 'à l’instant';
      if (abs < 3600) return rtf.format(-Math.round(s / 60), 'minute');
      if (abs < 86400) return rtf.format(-Math.round(s / 3600), 'hour');
      return rtf.format(-Math.round(s / 86400), 'day');
    }
  };

  /* ---------- Safe storage: never throws, falls back to memory ---------- */
  const memory = new Map();
  function makeStore(prefix, backend) {
    const raw = {
      get(k) { try { return backend ? backend.getItem(k) : memory.get(k) ?? null; } catch (e) { return memory.get(k) ?? null; } },
      set(k, v) { try { if (!backend) throw 0; backend.setItem(k, v); return true; } catch (e) { memory.set(k, v); return false; } },
      del(k) { try { backend && backend.removeItem(k); } catch (e) { /* storage blocked */ } memory.delete(k); }
    };
    return {
      prefix,
      get(key, fallback) { const v = raw.get(prefix + key); if (v == null) return fallback; try { return JSON.parse(v); } catch (e) { return fallback; } },
      set(key, value) { return raw.set(prefix + key, JSON.stringify(value)); },
      remove(key) { raw.del(prefix + key); }
    };
  }
  let backend = null;
  try { backend = g.localStorage || null; } catch (e) { backend = null; }
  const store = makeStore('velora.v4.', backend);

  /* ---------- Event bus ---------- */
  const listeners = {};
  const on = (type, fn) => { (listeners[type] = listeners[type] || new Set()).add(fn); return () => listeners[type].delete(fn); };
  const emit = (type, detail) => { (listeners[type] || []).forEach(fn => { try { fn(detail); } catch (e) { console.error(e); } }); };

  /* ---------- Preferences ---------- */
  const P = T.preferences || {};
  const OPTIONS = {
    palette: ['auto', ...Object.keys(T.palettes || { light: 1, dark: 1, ivory: 1, mist: 1 })],
    density: ['compact', 'comfortable', 'spacious'],
    motion: ['signature', 'subtle', 'reduced'],
    rail: ['collapsed', 'expanded', 'auto'],
    contrast: ['normal', 'more'],
    textScale: (P.textScale && P.textScale.options) || [0.94, 1, 1.07, 1.14]
  };
  const DEFAULTS = {
    palette: 'auto', density: 'comfortable', motion: 'signature', rail: 'collapsed', contrast: 'normal',
    radius: (P.radius && P.radius.default) || 24, alpha: (P.alpha && P.alpha.default) || 0.7,
    blur: P.blur && P.blur.default != null ? P.blur.default : 18, textScale: 1
  };
  const range = (v, spec, fallback, step) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return fallback;
    const c = clamp(n, spec.min, spec.max);
    return step ? Math.round(c / step) * step : c;
  };
  function sanitize(raw) {
    const r = raw && typeof raw === 'object' ? raw : {};
    const pick = (k) => OPTIONS[k].includes(r[k]) ? r[k] : DEFAULTS[k];
    return {
      palette: pick('palette'), density: pick('density'), motion: pick('motion'), rail: pick('rail'), contrast: pick('contrast'),
      textScale: OPTIONS.textScale.includes(Number(r.textScale)) ? Number(r.textScale) : DEFAULTS.textScale,
      radius: range(r.radius, P.radius || { min: 8, max: 32 }, DEFAULTS.radius, 1),
      alpha: +range(r.alpha, P.alpha || { min: .5, max: 1 }, DEFAULTS.alpha, .05).toFixed(2),
      blur: range(r.blur, P.blur || { min: 0, max: 28 }, DEFAULTS.blur, 1)
    };
  }
  const mq = q => (hasDOM && g.matchMedia ? g.matchMedia(q) : { matches: false, addEventListener() {} });
  const mqDark = mq('(prefers-color-scheme: dark)');
  const mqReduce = mq('(prefers-reduced-motion: reduce)');
  const mqContrast = mq('(prefers-contrast: more)');

  let current = sanitize(store.get('prefs', null));
  const resolvePalette = p => p.palette === 'auto' ? (mqDark.matches ? 'dark' : 'light') : p.palette;
  /* The OS "reduce motion" setting always wins over the in-app choice (WCAG 2.3.3). */
  const resolveMotion = p => mqReduce.matches ? 'reduced' : p.motion;

  function apply() {
    if (!hasDOM) return;
    const root = document.documentElement, p = current;
    root.dataset.vlPalette = resolvePalette(p);
    root.dataset.vlDensity = p.density;
    root.dataset.vlMotion = resolveMotion(p);
    root.dataset.vlContrast = p.contrast === 'more' || mqContrast.matches ? 'more' : 'normal';
    root.style.setProperty('--vl-radius', p.radius + 'px');
    root.style.setProperty('--vl-alpha', String(p.alpha));
    root.style.setProperty('--vl-blur', p.blur + 'px');
    root.style.setProperty('--vl-text-scale', String(p.textScale));
    const meta = document.querySelector('meta[name="theme-color"]');
    const pal = (T.palettes || {})[resolvePalette(p)];
    if (meta && pal) meta.setAttribute('content', pal.canvas.base);
    emit('prefs', { prefs: { ...p }, palette: resolvePalette(p), motion: resolveMotion(p) });
  }
  const prefs = {
    OPTIONS, DEFAULTS, sanitize,
    get: () => ({ ...current }),
    palette: () => resolvePalette(current),
    motion: () => resolveMotion(current),
    set(patch) { current = sanitize({ ...current, ...patch }); const saved = store.set('prefs', current); apply(); return saved; },
    reset() { current = sanitize(null); store.set('prefs', current); apply(); },
    /* Duration tokens read from CSS so JS animations obey the same motion level. */
    duration(name) {
      if (!hasDOM) return 0;
      const v = getComputedStyle(document.documentElement).getPropertyValue('--vl-motion-' + name).trim();
      return v.endsWith('ms') ? parseFloat(v) : v.endsWith('s') ? parseFloat(v) * 1000 : parseFloat(v) || 0;
    },
    reduced: () => resolveMotion(current) === 'reduced'
  };
  [mqDark, mqReduce, mqContrast].forEach(m => m.addEventListener && m.addEventListener('change', apply));
  if (hasDOM) {
    g.addEventListener('storage', e => { if (e.key === store.prefix + 'prefs') { current = sanitize(store.get('prefs', null)); apply(); } });
    apply();
  }

  /* ---------- Icons: hand-drawn 24px grid, 1.7 stroke (V3 set, extended). Each maps to one concept. ---------- */
  const P_ = d => `<svg class="vl-i" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${d}</svg>`;
  const ICONS = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>', plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>', check: '<path d="m5 12.5 4.5 4.5L19 7"/>',
    chevR: '<path d="m9 6 6 6-6 6"/>', chevL: '<path d="m15 6-6 6 6 6"/>', chevD: '<path d="m6 9 6 6 6-6"/>', chevU: '<path d="m6 15 6-6 6 6"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    bell: '<path d="M6 9a6 6 0 1 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    inbox: '<path d="M3 13h5l1.5 3h5L16 13h5"/><path d="M5.5 5h13L21 13v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5z"/>',
    moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    sliders: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
    layout: '<rect x="3.5" y="4" width="17" height="16" rx="2.5"/><path d="M3.5 10h17M10 10v10"/>',
    list: '<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r=".8"/><circle cx="4" cy="12" r=".8"/><circle cx="4" cy="18" r=".8"/>',
    board: '<rect x="3.5" y="4" width="5" height="16" rx="1.5"/><rect x="9.5" y="4" width="5" height="11" rx="1.5"/><rect x="15.5" y="4" width="5" height="13" rx="1.5"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6.5 6.5 0 0 1 3.5 5.5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    trend: '<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>', bars: '<path d="M6 20V11M12 20V5M18 20v-7"/>',
    pie: '<path d="M12 3a9 9 0 1 0 9 9h-9z"/><path d="M15 3.5A9 9 0 0 1 20.5 9H15z"/>',
    pulse: '<path d="M3 12h4l2.5-6 4 12 2.5-6H21"/>', clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    ticket: '<path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2.5 2.5 0 0 0 0 5v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3a2.5 2.5 0 0 0 0-5z"/><path d="M14 5v14" stroke-dasharray="2 2.5"/>',
    server: '<rect x="4" y="4" width="16" height="7" rx="2"/><rect x="4" y="13" width="16" height="7" rx="2"/><path d="M8 7.5h.01M8 16.5h.01M12 7.5h4M12 16.5h4"/>',
    shield: '<path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.2 7.5 9.5 4.3-1.3 7.5-4.9 7.5-9.5V6z"/><path d="m9 12 2 2 4-4"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l2.5 2.5M15 8l2 2"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
    building: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1M10 21v-3h4v3"/>',
    laptop: '<rect x="5" y="5" width="14" height="10" rx="1.5"/><path d="M3 19h18l-2-4H5z"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    cal: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    edit: '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/>', trash: '<path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    down: '<path d="M12 3v12m0 0-5-5m5 5 5-5M4 20h16"/>', upload: '<path d="M12 15V3m0 0L7 8m5-5 5 5"/><path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/>',
    filter: '<path d="M4 5h16l-6 7.5V19l-4 1.5v-8z"/>', columns: '<rect x="3.5" y="4" width="17" height="16" rx="2.5"/><path d="M9.5 4v16M14.5 4v16"/>',
    sort: '<path d="M7 4v16m0 0-3-3m3 3 3-3M17 20V4m0 0-3 3m3-3 3 3"/>', dots: '<circle cx="5" cy="12" r=".9"/><circle cx="12" cy="12" r=".9"/><circle cx="19" cy="12" r=".9"/>',
    drag: '<circle cx="9" cy="6" r=".9"/><circle cx="15" cy="6" r=".9"/><circle cx="9" cy="12" r=".9"/><circle cx="15" cy="12" r=".9"/><circle cx="9" cy="18" r=".9"/><circle cx="15" cy="18" r=".9"/>',
    expand: '<path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/>', collapse: '<path d="M4 14h6v6M20 10h-6V4M10 14l-7 7M14 10l7-7"/>',
    resize: '<path d="M20 14v6h-6M20 20l-7-7M10 4H4v6"/>', eye: '<path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z"/><circle cx="12" cy="12" r="3"/>',
    eyeOff: '<path d="M3 3l18 18M10.6 5.1A9.7 9.7 0 0 1 12 5c6 0 9.5 7 9.5 7a16 16 0 0 1-3 3.8M6.2 6.6C3.8 8.3 2.5 12 2.5 12S6 19 12 19c1.6 0 3-.4 4.2-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    history: '<path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1L3.5 8.5"/><path d="M3.5 4v4.5H8M12 8v4l3 2"/>',
    cmd: '<path d="M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3z"/>',
    home: '<path d="M4 11 12 4l8 7v8.5a1.5 1.5 0 0 1-1.5 1.5H15v-6H9v6H5.5A1.5 1.5 0 0 1 4 19.5z"/>',
    book: '<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5zM5 19.5A1.5 1.5 0 0 0 6.5 21H19"/>',
    palette: '<path d="M12 3a9 9 0 0 0 0 18c1.2 0 1.8-.8 1.8-1.7 0-1.3-1.1-1.6-1.1-2.6 0-.9.7-1.6 1.7-1.6H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="14.5" cy="7" r="1"/>',
    railOpen: '<rect x="3.5" y="4" width="17" height="16" rx="2.5"/><path d="M9 4v16M13 10l2 2-2 2"/>',
    railClose: '<rect x="3.5" y="4" width="17" height="16" rx="2.5"/><path d="M9 4v16M15 10l-2 2 2 2"/>',
    auto: '<path d="M5 12a7 7 0 0 1 12-4.9L19 9"/><path d="M19 4v5h-5M19 12a7 7 0 0 1-12 4.9L5 15"/><path d="M5 20v-5h5"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>', undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14.3-4.9L4 8"/><path d="M4 3.5V8h4.5M4 13a8 8 0 0 0 14.3 4.9L20 16"/><path d="M20 20.5V16h-4.5"/>',
    alert: '<path d="M12 4 2.8 19.5h18.4z"/><path d="M12 10v4.5M12 17.2h.01"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.7h.01"/>',
    pause: '<path d="M9 5v14M15 5v14"/>', play: '<path d="M8 5.5v13l10.5-6.5z"/>', link: '<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>', note: '<path d="M5 4h14v11l-5 5H5z"/><path d="M14 20v-5h5M8 9h8M8 13h4"/>',
    keyboard: '<rect x="2.5" y="6" width="19" height="12" rx="2.5"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>',
    receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>', euro: '<path d="M17.5 6.5A6.5 6.5 0 1 0 17.5 17.5M4 10.5h9M4 13.5h9"/>',
    target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".8"/>', globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.7 5.6 3.7 9s-1.2 6.4-3.7 9c-2.5-2.6-3.7-5.6-3.7-9S9.5 5.6 12 3z"/>'
  };
  const icon = name => P_(ICONS[name] || ICONS.dots);

  /* Initials avatar: deterministic warm tint per name, never a generated face (R-23). */
  const AVATAR_TINTS = ['#e9c9b8', '#c9d8cc', '#d8cde6', '#f0dda8', '#cbd9e6', '#ebc7c0', '#d5e3c7', '#e6d3bd'];
  const hash = s => [...String(s)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  const initials = n => String(n).split(/\s+/).filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const avatar = (name, cls) => `<span class="vl-avatar ${cls || ''}" style="background:${AVATAR_TINTS[hash(name) % AVATAR_TINTS.length]}" title="${esc(name)}" aria-hidden="true">${esc(initials(name))}</span>`;
  const avatars = names => `<span class="vl-avatars" role="img" aria-label="${esc(names.join(', '))}">${names.map(n => avatar(n)).join('')}</span>`;

  /* Live region shared by every component for screen-reader announcements. */
  function announce(msg, assertive) {
    if (!hasDOM) return;
    let r = document.getElementById(assertive ? 'vl-live-assertive' : 'vl-live');
    if (!r) {
      r = h('div.vl-sr', { id: assertive ? 'vl-live-assertive' : 'vl-live', 'aria-live': assertive ? 'assertive' : 'polite', 'aria-atomic': 'true' });
      (document.body || document.documentElement).append(r);
    }
    r.textContent = '';
    setTimeout(() => { r.textContent = msg; }, 30);
  }

  Object.assign(V, { $, $$, esc, h, clamp, uid, debounce, fmt, store, makeStore, on, emit, prefs, icon, ICONS, avatar, avatars, initials, hash, announce });
})(typeof window !== 'undefined' ? window : globalThis);
