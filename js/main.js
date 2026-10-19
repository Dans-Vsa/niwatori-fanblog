/* Niwatori fan blog · vanilla JS, no deps */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const store = {
    get: (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch { return d; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
  };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- strings used by JS (ID / EN) ---------- */
  const T = {
    lv: { id: ['Aman', 'Separuh', 'Lepas topeng'], en: ['Safe', 'Halfway', 'Mask off'] },
    coverTag: {
      id: ['', '<span>Spoiler ringan · </span><b>lepas topeng</b>', '<span>Spoiler berat · </span><b>lepas topeng</b>'],
      en: ['', '<span>Light spoiler · </span><b>take the mask off</b>', '<span>Heavy spoiler · </span><b>take the mask off</b>'],
    },
    coverAria: { id: 'Buka spoiler ini saja', en: 'Reveal only this spoiler' },
    tw: {
      id: {
        niwa1: ['庭 · niwa', '<b>Halaman</b>, kebun, pekarangan. Tempat seluruh cerita terjadi: halaman sebuah sekolah.'],
        niwa: ['には · ni wa', 'Partikel penanda tempat, kira-kira "di". Bunyinya ikut menambah satu "niwa" lagi, makanya kalimat ini licin di lidah.'],
        niwa2: ['二羽 · niwa', '<b>Dua ekor</b>. 羽 (wa) adalah kata bantu bilangan untuk burung. Dua burung = ni-wa.'],
        niwa3: ['ニワトリ · niwatori', '<b>Ayam</b>. Ditulis katakana di judul, sehingga terlihat seperti label atau nama, bukan sekadar hewan.'],
        ga: ['が · ga', 'Partikel subjek. Yang "ada" adalah ayamnya.'],
        ita: ['いた · ita', 'Bentuk lampau dari いる (iru, "ada"). Bukan "ada dua ayam", tapi <b>"dulu ada dua ayam"</b>.'],
      },
      en: {
        niwa1: ['庭 · niwa', '<b>Garden</b>, yard. Where the whole story happens: a school yard.'],
        niwa: ['には · ni wa', 'A location particle, roughly "in". Its sound adds one more "niwa", which is why the line trips the tongue.'],
        niwa2: ['二羽 · niwa', '<b>Two (birds)</b>. 羽 (wa) is the counter for birds. Two birds = ni-wa.'],
        niwa3: ['ニワトリ · niwatori', '<b>Chicken</b>. Written in katakana in the title, so it reads like a label or a name rather than just an animal.'],
        ga: ['が · ga', 'Subject particle. What "is there" is the chickens.'],
        ita: ['いた · ita', 'Past tense of いる (iru, "to be there"). Not "there are two chickens" but <b>"there were two chickens"</b>.'],
      },
    },
    game: {
      id: {
        ready: 'Siap?', back: 'Ia membelakangi kandang. Makan!', warn: 'Matanya bergetar...', watch: 'IA MELIHAT. Jadilah ayam.',
        winStamp: 'LULUS INSPEKSI', loseStamp: 'KETAHUAN',
        win: 'Kenyang dan tidak ketahuan. Kamu ayam yang meyakinkan.', lose: (n) => `Kamu ketahuan makan roti seperti manusia. Kenyang ${n}%.`,
        again: 'Coba lagi', fake: 'Ia batal menoleh...',
      },
      en: {
        ready: 'Ready?', back: 'Back turned. Eat!', warn: 'Its eye is twitching...', watch: 'IT IS LOOKING. Be a chicken.',
        winStamp: 'INSPECTION PASSED', loseStamp: 'CAUGHT',
        win: 'Full and undetected. A very convincing chicken.', lose: (n) => `You were caught eating bread like a human. ${n}% full.`,
        again: 'Try again', fake: 'False alarm...',
      },
    },
    cluck: ['コケッ!', 'コケコッコー', 'kokok!', 'ピヨ?', 'コッ'],
  };

  /* ---------- language ---------- */
  let lang = store.get('niwa-lang', 'id');
  const originals = new Map();
  function applyLang(l) {
    lang = l === 'en' ? 'en' : 'id';
    document.documentElement.lang = lang;
    const EN = window.NIWA_EN || {};
    $$('[data-i18n]').forEach((el) => {
      if (!originals.has(el)) originals.set(el, el.innerHTML);
      const key = el.dataset.i18n;
      el.innerHTML = lang === 'en' && EN[key] ? EN[key] : originals.get(el);
    });
    $$('.lang button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    if (lang === 'en' && EN._title) document.title = EN._title;
    else document.title = 'Niwa ni wa Niwa Niwatori ga Ita · Jurnal Piket Kandang';
    store.set('niwa-lang', lang);
    renderSpoiler();
    twRefresh();
    gameText();
  }
  $$('.lang button').forEach((b) => b.addEventListener('click', () => applyLang(b.dataset.lang)));

  /* ---------- spoiler filter: the chicken mask ---------- */
  const henHTML = (cls = 'hen--sm') => `<span class="hen ${cls}" aria-hidden="true"><i class="hen__eyes"></i><i class="hen__beak"></i><i class="hen__hole"></i></span>`;
  let level = Number(store.get('niwa-spoiler', -1));
  const gate = $('#gate');

  $$('[data-sp]').forEach((el) => {
    const need = Number(el.dataset.sp);
    const cover = document.createElement('div');
    cover.className = 'sp-cover';
    cover.innerHTML = `<button class="sp-cover__btn" type="button">${henHTML(need === 2 ? 'hen--md' : 'hen--sm')}<span class="sp-cover__tag"></span></button>`;
    if (el.classList.contains('card__secret') || el.closest('.strip')) cover.querySelector('.hen').className = 'hen hen--sm';
    cover.querySelector('button').addEventListener('click', () => {
      el.classList.add('is-lifting');
      setTimeout(() => { el.classList.add('is-unmasked'); el.classList.remove('is-lifting'); renderSpoiler(); }, reduced ? 0 : 420);
    });
    el.appendChild(cover);
  });

  function renderSpoiler() {
    const lv = Math.max(0, level);
    document.body.dataset.spoiler = String(lv);
    $('#spoilerName').textContent = T.lv[lang][lv];
    $$('[data-sp]').forEach((el) => {
      const need = Number(el.dataset.sp);
      const locked = lv < need && !el.classList.contains('is-unmasked');
      el.classList.toggle('is-locked', locked);
      const spoil = $$('.spoil', el);
      spoil.forEach((s) => s.setAttribute('aria-hidden', String(locked)));
      const btn = $('.sp-cover__btn', el);
      btn.setAttribute('aria-label', T.coverAria[lang]);
      $('.sp-cover__tag', el).innerHTML = T.coverTag[lang][need];
    });
    $$('.gate__opt').forEach((o) => o.setAttribute('aria-current', String(Number(o.value) === lv)));
    skyUpdate();
  }
  function setLevel(n) {
    level = Math.min(2, Math.max(0, n));
    store.set('niwa-spoiler', level);
    if (level < 2) $$('[data-sp].is-unmasked').forEach((el) => { if (Number(el.dataset.sp) > level) el.classList.remove('is-unmasked'); });
    renderSpoiler();
  }
  $('#spoilerBtn').addEventListener('click', () => gate.showModal());
  gate.addEventListener('close', () => {
    if (gate.returnValue !== '' && gate.returnValue !== undefined) setLevel(Number(gate.returnValue));
    else if (level < 0) setLevel(0);
  });
  gate.addEventListener('click', (e) => { if (e.target === gate) gate.close(); });

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const sibs = $$('.reveal:not(.is-in)', en.target.parentElement);
      en.target.style.setProperty('--d', `${Math.min(sibs.indexOf(en.target), 5) * 70}ms`);
      en.target.classList.add('is-in');
      io.unobserve(en.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  $$('.reveal').forEach((el) => io.observe(el));

  /* ---------- nav highlight ---------- */
  const navLinks = $$('.nav a');
  const navIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) navLinks.forEach((a) => a.classList.toggle('is-active', a.hash === `#${en.target.id}`));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  navLinks.forEach((a) => { const s = $(a.hash); if (s) navIO.observe(s); });

  /* ---------- hero chickens: eyes follow, cluck on click ---------- */
  const liveHens = $$('.hen--live');
  const allEyesHens = () => $$('.hen').filter((h) => h.offsetParent !== null && h.getBoundingClientRect().top < innerHeight);
  let raf = 0, px = 0, py = 0;
  addEventListener('pointermove', (e) => {
    px = e.clientX; py = e.clientY;
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      allEyesHens().slice(0, 12).forEach((h) => {
        const r = h.getBoundingClientRect();
        const dx = px - (r.left + r.width / 2), dy = py - (r.top + r.height / 2);
        const d = Math.hypot(dx, dy) || 1, m = r.width * 0.05;
        h.style.setProperty('--ex', `${(dx / d) * m}px`);
        h.style.setProperty('--ey', `${(dy / d) * m}px`);
      });
    });
  }, { passive: true });

  const layer = $('.cluck-layer');
  function cluck(x, y) {
    const s = document.createElement('span');
    s.className = 'cluck';
    s.textContent = T.cluck[Math.floor(Math.random() * T.cluck.length)];
    s.style.left = `${x}px`; s.style.top = `${y}px`;
    s.style.setProperty('--r', `${Math.random() * 24 - 12}deg`);
    layer.appendChild(s);
    setTimeout(() => s.remove(), 1000);
  }
  liveHens.forEach((h) => h.addEventListener('click', () => {
    const r = h.getBoundingClientRect();
    cluck(r.left + r.width / 2, r.top);
    h.classList.remove('is-peck'); void h.offsetWidth; h.classList.add('is-peck');
    setTimeout(() => h.classList.remove('is-peck'), 360);
  }));
  $('.brand .hen').addEventListener('mouseenter', (e) => { const r = e.currentTarget.getBoundingClientRect(); cluck(r.left + 14, r.bottom + 30); });

  /* ---------- tongue twister ---------- */
  const tws = $$('.tw');
  let twKey = null;
  function twRefresh() {
    if (!twKey) return;
    const [lab, def] = T.tw[lang][twKey];
    $('#twLabel').textContent = lab;
    $('#twDef').innerHTML = def;
  }
  tws.forEach((b) => b.addEventListener('click', () => {
    twKey = b.dataset.k;
    tws.forEach((t) => t.classList.toggle('is-on', t === b));
    twRefresh();
  }));
  let speed = 1, saying = false;
  $('#twSay').addEventListener('click', () => {
    if (saying) return;
    saying = true;
    const step = 520 / speed;
    tws.forEach((t, i) => {
      setTimeout(() => {
        tws.forEach((x) => x.classList.toggle('is-say', x === t));
        if (i === tws.length - 1) setTimeout(() => { t.classList.remove('is-say'); saying = false; }, step);
      }, i * step);
    });
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance('にわにはにわにわとりがいた');
      u.lang = 'ja-JP'; u.rate = Math.min(0.7 + speed * 0.35, 2.4);
      const v = speechSynthesis.getVoices().find((x) => x.lang && x.lang.startsWith('ja'));
      if (v) { u.voice = v; speechSynthesis.cancel(); speechSynthesis.speak(u); }
    }
    speed = speed >= 5 ? 1 : speed + 1;
    $('#twX').textContent = `×${speed}`;
  });

  /* ---------- journal sky: day -> dusk -> night ---------- */
  const jurnal = $('#jurnal');
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, t) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`; };
  function skyUpdate() {
    if (!jurnal) return;
    const r = jurnal.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * 0.6 - r.top) / r.height));
    const night = Math.max(0, level) >= 2;
    const stops = night
      ? [[0, '#fffaf0'], [0.45, '#fff0e2'], [0.62, '#ffc9b8'], [0.74, '#6b4fa8'], [0.86, '#0a1a1a'], [1, '#0a1a1a']]
      : [[0, '#fffaf0'], [0.5, '#fff0e2'], [0.8, '#ffe0d2'], [1, '#ffd3c4']];
    let i = 0; while (i < stops.length - 2 && p > stops[i + 1][0]) i++;
    const [p0, c0] = stops[i], [p1, c1] = stops[i + 1];
    jurnal.style.setProperty('--sky', mix(c0, c1, (p - p0) / (p1 - p0 || 1)));
  }
  addEventListener('scroll', () => requestAnimationFrame(skyUpdate), { passive: true });

  /* ---------- mini game: inspeksi kandang ---------- */
  const game = $('#game');
  const G = { running: false, eating: false, score: 0, phase: 'idle', timer: 0, tick: 0 };
  const best = () => Number(store.get('niwa-best', 0));
  $('#gBest').textContent = best();
  const gStatus = $('#gStatus'), gEat = $('#gEat'), gStart = $('#gStart'), gResult = $('#gResult');
  function gameText() {
    if (G.phase === 'idle') gStatus.textContent = T.game[lang].ready;
    else if (G.running) gStatus.textContent = T.game[lang][G.phase];
  }
  function setPhase(p) {
    G.phase = p;
    game.dataset.state = p;
    gStatus.textContent = T.game[lang][p] || '';
  }
  const rand = (a, b) => a + Math.random() * (b - a);
  function schedule() {
    clearTimeout(G.timer);
    if (!G.running) return;
    const hard = G.score / 100;
    if (G.phase === 'back') {
      G.timer = setTimeout(() => { setPhase('warn'); schedule(); }, rand(900, 2600 - hard * 900));
    } else if (G.phase === 'warn') {
      const fake = Math.random() < 0.18;
      G.timer = setTimeout(() => {
        if (fake) { setPhase('back'); gStatus.textContent = T.game[lang].fake; schedule(); return; }
        setPhase('watch');
        if (G.eating) return caught();
        schedule();
      }, rand(620, 760) - hard * 260);
    } else if (G.phase === 'watch') {
      G.timer = setTimeout(() => { setPhase('back'); schedule(); }, rand(900, 1900));
    }
  }
  function startGame() {
    G.running = true; G.score = 0; G.eating = false;
    gResult.hidden = true; gEat.disabled = false; gStart.disabled = true;
    $('#gBar').style.width = '0%'; $('#gScore').textContent = '0';
    setPhase('back'); schedule();
    clearInterval(G.tick);
    G.tick = setInterval(() => {
      if (!G.running || !G.eating) return;
      if (G.phase === 'watch') return caught();
      G.score = Math.min(100, G.score + 2);
      $('#gBar').style.width = `${G.score}%`;
      $('#gScore').textContent = G.score;
      if (G.score >= 100) end(true);
    }, 100);
    gEat.focus({ preventScroll: true });
  }
  function caught() { end(false); }
  function end(win) {
    G.running = false; G.eating = false;
    clearTimeout(G.timer); clearInterval(G.tick);
    game.classList.remove('is-eating');
    game.dataset.state = win ? 'win' : 'caught';
    gEat.disabled = true; gStart.disabled = false;
    if (G.score > best()) { store.set('niwa-best', G.score); $('#gBest').textContent = G.score; }
    const s = T.game[lang];
    $('#gStamp').textContent = win ? s.winStamp : s.loseStamp;
    $('#gMsg').textContent = win ? s.win : s.lose(G.score);
    let again = $('.btn', gResult);
    if (!again) { again = document.createElement('button'); again.className = 'btn btn--ink'; again.addEventListener('click', startGame); gResult.appendChild(again); }
    again.textContent = s.again;
    gResult.hidden = false;
    gStatus.textContent = win ? '' : s.watch;
    again.focus({ preventScroll: true });
    if (!win) { const r = $('#gHen').getBoundingClientRect(); cluck(r.left + r.width / 2, r.top); }
  }
  function eat(on) {
    if (!G.running) return;
    G.eating = on;
    game.classList.toggle('is-eating', on);
    if (on && G.phase === 'watch') caught();
  }
  gStart.addEventListener('click', startGame);
  gEat.addEventListener('pointerdown', (e) => { e.preventDefault(); gEat.setPointerCapture(e.pointerId); eat(true); });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((t) => gEat.addEventListener(t, () => eat(false)));
  gEat.addEventListener('contextmenu', (e) => e.preventDefault());
  addEventListener('keydown', (e) => {
    if (e.code !== 'Space' || !G.running) return;
    e.preventDefault();
    if (!e.repeat) eat(true);
  });
  addEventListener('keyup', (e) => { if (e.code === 'Space' && G.running) { e.preventDefault(); eat(false); } });
  addEventListener('blur', () => eat(false));

  /* ---------- PV (lazy YouTube) ---------- */
  $('#pvBtn').addEventListener('click', (e) => {
    const b = e.currentTarget;
    const f = document.createElement('iframe');
    f.src = `https://www.youtube-nocookie.com/embed/${b.dataset.yt}?autoplay=1&rel=0`;
    f.title = 'PV 庭には二羽ニワトリがいた。';
    f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    f.allowFullscreen = true;
    b.replaceWith(f);
  });

  /* ---------- character cards: lift the mask on click ---------- */
  $$('.card--hen').forEach((c) => {
    const t = () => c.classList.toggle('is-peek');
    c.addEventListener('click', (e) => { if (!e.target.closest('.sp-cover')) t(); });
    c.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target === c) { e.preventDefault(); t(); } });
  });

  /* ---------- boot ---------- */
  applyLang(lang);
  if (level < 0) {
    if (typeof gate.showModal === 'function') setTimeout(() => gate.showModal(), 900);
    else setLevel(0);
  }
})();
