/* Velora Motion V4: interruptible animations on the Web Animations API.
   Rules: animate transform/opacity first, blur stays local and brief, every animation can be
   interrupted by the next user action, nothing ever blocks input. Durations come from tokens. */
(function (g) {
  'use strict';
  const V = g.Velora;
  const D = name => V.prefs.duration(name);
  const reduced = () => V.prefs.reduced();
  const css = name => getComputedStyle(document.documentElement).getPropertyValue('--vl-' + name).trim();
  const ease = name => css('ease-' + name) || 'ease';
  const easeOutQuart = t => 1 - Math.pow(1 - t, 4);
  const easeExpo = t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

  /* Keyed animation: starting "key" on an element cancels the previous one with that key. */
  function play(el, frames, opts, key) {
    if (!el || !el.animate) return null;
    key = key || 'main';
    el._vlAnims = el._vlAnims || {};
    if (el._vlAnims[key]) el._vlAnims[key].cancel();
    const duration = typeof opts.duration === 'string' ? D(opts.duration) : opts.duration;
    if (reduced() || duration <= 1) {
      const last = frames[frames.length - 1];
      if (opts.fill === 'forwards' || opts.fill === 'both') Object.assign(el.style, last);
      return null;
    }
    const a = el.animate(frames, { ...opts, duration });
    el._vlAnims[key] = a;
    a.addEventListener('finish', () => { if (el._vlAnims[key] === a) delete el._vlAnims[key]; });
    return a;
  }
  const finished = a => a ? a.finished.catch(() => {}) : Promise.resolve();

  /* rAF tween for things CSS cannot animate (numbers, SVG paths). Returns a cancel function. */
  function tween(duration, easing, fn, done) {
    if (reduced() || duration <= 1) { fn(1); done && done(); return () => {}; }
    const t0 = performance.now(); let id;
    const step = now => { const k = Math.min(1, (now - t0) / duration); fn(easing(k)); if (k < 1) id = requestAnimationFrame(step); else if (done) done(); };
    id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }

  /* Count figures from their current value (or from 38 % of the target on first entry, V3 grammar). */
  function countTo(el, to, format, from) {
    if (!el) return;
    const f = from != null ? from : (el._vlValue != null ? el._vlValue : to * .38);
    if (el._vlStop) el._vlStop();
    el.classList.add('vl-counting');
    el._vlStop = tween(D('count'), easeExpo, k => { const v = f + (to - f) * k; el._vlValue = v; el.textContent = format(v); },
      () => { el._vlValue = to; el.textContent = format(to); el.classList.remove('vl-counting'); });
  }

  /* FLIP: measure, mutate, play the inverse. Measuring mid-flight uses the visual position, so a
     reorder during a reorder continues smoothly instead of jumping. */
  function flip(els, mutate, opts) {
    const list = Array.from(els || []);
    const first = new Map(list.map(e => [e, e.getBoundingClientRect()]));
    mutate();
    if (reduced()) return;
    const dur = (opts && opts.duration) || 'layout';
    list.forEach(e => {
      if (!e.isConnected) return;
      const a = first.get(e), b = e.getBoundingClientRect();
      const dx = a.left - b.left, dy = a.top - b.top;
      if (Math.abs(dx) < .5 && Math.abs(dy) < .5) return;
      play(e, [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: dur, easing: 'cubic-bezier(.2,.9,.3,1)' }, 'flip');
    });
  }

  /* Progressive appearance in reading order, capped at 900 ms so long pages never feel slow.
     Elements are interactive from the first frame: the animation never gates input. */
  function reveal(root, selector) {
    const items = Array.from((root || document).querySelectorAll(selector || '[data-vl-reveal]'));
    if (reduced()) return;
    const step = D('stagger'), dur = D('enter');
    const subtle = V.prefs.motion() === 'subtle';
    items.forEach((el, i) => {
      const from = subtle ? { opacity: 0, transform: 'translateY(6px)' } : { opacity: 0, transform: 'translateY(16px) scale(.985)', filter: 'blur(5px) saturate(.25) brightness(1.12)' };
      const to = subtle ? { opacity: 1, transform: 'none' } : { opacity: 1, transform: 'none', filter: 'none' };
      play(el, [from, to], { duration: dur, delay: Math.min(i * step, 900), easing: ease('out'), fill: 'backwards' }, 'reveal');
    });
  }

  /* Split a title into letters (screen readers get the plain text through aria-label). */
  function letters(el) {
    if (!el || el.dataset.vlLetters) return;
    const text = el.textContent;
    el.dataset.vlLetters = '1';
    el.setAttribute('aria-label', text);
    el.textContent = '';
    const wrap = document.createElement('span');
    wrap.setAttribute('aria-hidden', 'true');
    [...text].forEach((c, i) => {
      const s = document.createElement('span');
      s.className = 'vl-chr';
      s.textContent = c;
      wrap.append(s);
      if (!reduced()) play(s, [{ opacity: 0, filter: 'blur(7px)', transform: 'translateY(.3em)' }, { opacity: 1, filter: 'none', transform: 'none' }], { duration: 700, delay: i * 22, easing: ease('out'), fill: 'backwards' }, 'chr');
    });
    el.append(wrap);
  }

  /* Views: leave fast, arrive in a cascade. */
  function viewOut(el) {
    return finished(play(el, [{ opacity: 1, filter: 'none', transform: 'none' }, { opacity: 0, filter: `blur(${css('motion-blur') || '10px'})`, transform: 'scale(.988)' }], { duration: 'exit', easing: ease('out'), fill: 'forwards' }, 'view'));
  }
  function viewIn(el) {
    if (el._vlAnims && el._vlAnims.view) el._vlAnims.view.cancel();
    el.style.opacity = ''; el.style.filter = ''; el.style.transform = '';
    reveal(el);
    el.querySelectorAll('[data-vl-letters-in]').forEach(letters);
  }

  /* Shared-element morph: a source (card, widget, row) grows into a panel that keeps its colour,
     then its details resolve. Close plays the inverse to wherever the source is now. */
  const rect = el => { const r = el.getBoundingClientRect(); return { left: r.left, top: r.top, width: r.width, height: r.height }; };
  const px = r => ({ left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
  function radiusOf(el) { return getComputedStyle(el).borderTopLeftRadius || '18px'; }
  function visible(el) {
    if (!el || !el.isConnected) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
  }
  function morphOpen(source, panel, opts) {
    opts = opts || {};
    const to = rect(panel);
    const content = panel.querySelector('[data-vl-morph-content]') || panel.firstElementChild;
    if (!visible(source) || reduced()) {
      const a = play(panel, [{ opacity: 0, transform: 'scale(.97)' }, { opacity: 1, transform: 'none' }], { duration: 'enter', easing: ease('out') }, 'morph');
      if (content) reveal(content, '[data-vl-morph-reveal]');
      return finished(a);
    }
    const from = rect(source);
    const fromBg = opts.fromColor || getComputedStyle(source).backgroundColor;
    const toBg = opts.toColor || getComputedStyle(panel).backgroundColor;
    panel.style.position = 'fixed';
    if (content) {
      content.style.width = to.width + 'px';
      play(content, [{ opacity: 0 }, { opacity: 0, offset: .25 }, { opacity: 1 }], { duration: 'morph', easing: 'linear' }, 'morph-content');
      reveal(content, '[data-vl-morph-reveal]');
    }
    source.style.visibility = 'hidden';
    const a = play(panel, [
      { ...px(from), borderRadius: radiusOf(source), backgroundColor: fromBg, boxShadow: 'none' },
      { ...px(to), borderRadius: radiusOf(panel), backgroundColor: toBg }
    ], { duration: 'morph', easing: ease('sheet') }, 'morph');
    const done = () => { source.style.visibility = ''; };
    if (a) a.finished.then(done, done); else done();
    return finished(a);
  }
  function morphClose(source, panel) {
    if (!visible(source) || reduced()) {
      return finished(play(panel, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.97)' }], { duration: 'exit', easing: ease('out'), fill: 'forwards' }, 'morph'));
    }
    const from = rect(panel), to = rect(source);
    const content = panel.querySelector('[data-vl-morph-content]') || panel.firstElementChild;
    if (content) play(content, [{ opacity: 1 }, { opacity: 0, offset: .35 }, { opacity: 0 }], { duration: 'morphBack', fill: 'forwards' }, 'morph-content');
    source.style.visibility = 'hidden';
    const a = play(panel, [
      { ...px(from), borderRadius: radiusOf(panel), backgroundColor: getComputedStyle(panel).backgroundColor },
      { ...px(to), borderRadius: radiusOf(source), backgroundColor: getComputedStyle(source).backgroundColor }
    ], { duration: 'morphBack', easing: ease('sheet'), fill: 'forwards' }, 'morph');
    const done = () => { source.style.visibility = ''; };
    if (a) a.finished.then(done, done); else done();
    return finished(a);
  }

  /* Swap loading content for real content with a short cross-fade (keeps layout, no jump). */
  function swap(container, fill) {
    fill(container);
    play(container, [{ opacity: .35 }, { opacity: 1 }], { duration: 'fast', easing: ease('out') }, 'swap');
  }
  function flash(el, cls) {
    if (!el) return;
    const c = cls || 'vl-flash';
    el.classList.remove(c); void el.offsetWidth; el.classList.add(c);
    setTimeout(() => el.classList.remove(c), 1500);
  }

  /* Shared drag engine (kanban cards, dashboard widgets).
     Pointer: drag after 5px. Touch: long press (280 ms) so scrolling stays free.
     The ghost follows with a lerp (0.32/frame) and tilts with horizontal speed, capped by the tilt token. */
  function drag(handleEl, opts) {
    const itemEl = opts.item || handleEl;
    let start = null, timer = null, state = null;
    const HOLD = 280, THRESHOLD = 5;
    function begin(e) {
      const r = itemEl.getBoundingClientRect();
      const ghost = itemEl.cloneNode(true);
      ghost.removeAttribute('id');
      ghost.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
      ghost.classList.add('vl-drag-ghost');
      ghost.setAttribute('aria-hidden', 'true');
      Object.assign(ghost.style, { width: r.width + 'px', height: r.height + 'px', transform: `translate(${r.left}px, ${r.top}px)` });
      document.body.append(ghost);
      document.body.classList.add('vl-dragging');
      state = { ghost, ox: start.x - r.left, oy: start.y - r.top, x: r.left, y: r.top, tx: r.left, ty: r.top, vx: 0, px: start.x, py: start.y, raf: 0, lift: parseFloat(css('motion-lift')) || 1.04, tilt: parseFloat(css('motion-tilt')) || 0 };
      opts.onStart && opts.onStart({ ghost, x: start.x, y: start.y });
      const loop = () => {
        const s = state; if (!s) return;
        const nx = s.x + (s.tx - s.x) * (reduced() ? 1 : .32), ny = s.y + (s.ty - s.y) * (reduced() ? 1 : .32);
        s.vx = s.vx * .8 + (nx - s.x) * .2;
        s.x = nx; s.y = ny;
        const rot = Math.max(-s.tilt, Math.min(s.tilt, s.vx * .6));
        s.ghost.style.transform = `translate(${s.x}px, ${s.y}px) rotate(${rot}deg) scale(${s.lift})`;
        if (opts.autoScroll) opts.autoScroll(s.px, s.py);
        s.raf = requestAnimationFrame(loop);
      };
      state.raf = requestAnimationFrame(loop);
    }
    function move(e) {
      if (!start) return;
      if (!state) {
        if (start.touch) { if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > 10) cancel(); return; }
        if (Math.hypot(e.clientX - start.x, e.clientY - start.y) < THRESHOLD) return;
        begin(e);
      }
      e.preventDefault();
      state.px = e.clientX; state.py = e.clientY;
      state.tx = e.clientX - state.ox; state.ty = e.clientY - state.oy;
      opts.onMove && opts.onMove({ x: e.clientX, y: e.clientY, ghost: state.ghost });
    }
    function end(e) {
      clearTimeout(timer);
      removeEventListener('pointermove', move); removeEventListener('pointerup', end); removeEventListener('pointercancel', end);
      if (!state) { start = null; return; }
      const s = state; state = null; start = null;
      cancelAnimationFrame(s.raf);
      document.body.classList.remove('vl-dragging');
      itemEl._vlJustDragged = true; setTimeout(() => { itemEl._vlJustDragged = false; }, 60);
      const target = opts.onDrop ? opts.onDrop({ x: e.clientX, y: e.clientY, cancelled: e.type === 'pointercancel' }) : null;
      const land = target && target.isConnected ? target.getBoundingClientRect() : null;
      if (land && !reduced()) {
        const a = s.ghost.animate([{ transform: s.ghost.style.transform }, { transform: `translate(${land.left}px, ${land.top}px) rotate(0deg) scale(1)`, width: land.width + 'px', height: land.height + 'px' }], { duration: 380, easing: ease('drop'), fill: 'forwards' });
        a.finished.then(() => s.ghost.remove(), () => s.ghost.remove());
      } else s.ghost.remove();
      opts.onEnd && opts.onEnd();
    }
    function cancel() { clearTimeout(timer); start = null; removeEventListener('pointermove', move); removeEventListener('pointerup', end); removeEventListener('pointercancel', end); }
    handleEl.addEventListener('pointerdown', e => {
      if (e.button !== 0 || (opts.ignore && e.target.closest(opts.ignore))) return;
      start = { x: e.clientX, y: e.clientY, touch: e.pointerType === 'touch' };
      addEventListener('pointermove', move, { passive: false }); addEventListener('pointerup', end); addEventListener('pointercancel', end);
      if (start.touch) timer = setTimeout(() => { if (start) { begin(e); navigator.vibrate && navigator.vibrate(8); } }, HOLD);
    });
    handleEl.addEventListener('touchmove', e => { if (state) e.preventDefault(); }, { passive: false });
    handleEl.addEventListener('click', e => { if (itemEl._vlJustDragged) { e.stopPropagation(); e.preventDefault(); } }, true);
    return { get active() { return !!state; } };
  }

  V.motion = { play, finished, tween, countTo, flip, reveal, letters, viewOut, viewIn, morphOpen, morphClose, swap, flash, drag, ease, easeOutQuart, easeExpo, duration: D, reduced };
})(window);
