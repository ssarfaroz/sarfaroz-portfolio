// Sarfaroz Oripov portfolio. Vanilla JS, no dependencies. Everything degrades to a readable static page.
(() => {
  const d = document, root = d.documentElement;
  const ru = root.lang === 'ru';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, el = d) => el.querySelector(s);
  const $$ = (s, el = d) => [...el.querySelectorAll(s)];
  const EMAIL = 'sarfaroz9955@gmail.com';
  const MAIL = `mailto:${EMAIL}?subject=${encodeURIComponent(ru ? 'Новый проект' : 'New project')}`;
  const WA = 'https://wa.me/15155202245';
  const mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  const T = ru ? {
    pause: 'Пауза', resume: 'Дальше', hired: 'Доступ разрешён. Открываю почту…', none: 'Ничего не нашлось. Попробуйте «help».',
    work: 'Перейти к работам', cases: 'Перейти к кейсам', services: 'Услуги и цены', contact: 'Контакты', wa: 'Написать в WhatsApp',
    mail: 'Написать на почту', cv: 'Резюме (PDF, на английском)', lang: 'English version', theme: 'Сменить тему', num: 'ru-RU'
  } : {
    pause: 'Pause', resume: 'Resume', hired: 'Permission granted. Opening email…', none: 'No matches. Try "help".',
    work: 'Go to selected work', cases: 'Go to case notes', services: 'Services and prices', contact: 'Contact', wa: 'Chat on WhatsApp',
    mail: 'Email me', cv: 'Open résumé (PDF)', lang: 'Русская версия', theme: 'Switch colour theme', num: 'en-US'
  };
  const nf = new Intl.NumberFormat(T.num);

  // Keyboard hint matches the platform.
  if (!mac) $$('kbd').forEach(k => { if (k.textContent === '⌘K') k.textContent = 'Ctrl K'; });

  const secFmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

  // Name decodes from the other alphabet (Cyrillic <-> Latin). Mono font keeps the width steady.
  const POOL = 'АБВГДЖЗИКЛМНПРСТФХЦЧШЭЮЯABDEFGHJKLMNPQRSTUVWXYZ0123456789';
  $$('[data-decode]').forEach(el => {
    if (reduce) return;
    const to = el.textContent, from = el.dataset.from || to, n = to.length, D = 900, t0 = performance.now();
    const at = [...to].map((_, i) => 140 + (i / n) * (D - 360) + Math.random() * 220);
    const frame = now => {
      const t = now - t0;
      el.textContent = [...to].map((c, i) => c === ' ' ? ' ' : t >= at[i] ? c : t < 140 ? (from[i] || c) : POOL[(Math.random() * POOL.length) | 0]).join('');
      if (t < D + 260) requestAnimationFrame(frame); else el.textContent = to;
    };
    requestAnimationFrame(frame);
  });

  // Build log: lines type in once (about 4 s), with Pause and Replay.
  const log = $('[data-log]');
  if (log) {
    const items = $$('li', log), spans = items.map(li => $('span', li)), texts = spans.map(s => s.textContent);
    const pauseBtn = $('[data-log-pause]'), replayBtn = $('[data-log-replay]');
    const stamp = () => { const now = Date.now(); items.forEach((li, k) => { $('time', li).textContent = secFmt.format(new Date(now - (items.length - k) * 1100)); }); };
    let timer = 0, paused = false, idx = 0, ch = 0;
    const step = () => {
      if (paused || idx >= items.length) return;
      const li = items[idx];
      if (ch === 0) { li.classList.remove('pending'); li.classList.add('typing'); }
      ch = Math.min(texts[idx].length, ch + 2);
      spans[idx].textContent = texts[idx].slice(0, ch);
      if (ch >= texts[idx].length) { li.classList.remove('typing'); idx++; ch = 0; timer = setTimeout(step, 340); }
      else timer = setTimeout(step, 16);
    };
    const play = () => {
      clearTimeout(timer); idx = 0; ch = 0; paused = false; stamp();
      if (pauseBtn) pauseBtn.textContent = T.pause;
      items.forEach((li, k) => { li.classList.add('pending'); li.classList.remove('typing'); spans[k].textContent = ''; });
      timer = setTimeout(step, 420);
    };
    pauseBtn && pauseBtn.addEventListener('click', () => { paused = !paused; pauseBtn.textContent = paused ? T.resume : T.pause; if (!paused) step(); });
    replayBtn && replayBtn.addEventListener('click', play);
    if (reduce) stamp(); else play();
  }

  // Reveal blocks as they enter the viewport.
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  $$('[data-reveal]').forEach(el => io.observe(el));

  // Count-up numbers.
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    cio.unobserve(e.target);
    const el = e.target, to = +el.dataset.count, t0 = performance.now(), D = 1200;
    const f = now => { const p = Math.min(1, (now - t0) / D); el.textContent = nf.format(Math.round(to * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  }), { threshold: .6 });
  if (!reduce) $$('[data-count]').forEach(el => cio.observe(el));

  // Project index: a preview card trails the cursor on desktop.
  const prev = $('.preview'), pimg = prev && $('img', prev), index = $('[data-index]');
  if (index && prev && fine) {
    let x = 0, y = 0, tx = 0, ty = 0, raf = 0, on = false;
    const k = reduce ? 1 : .2;
    const loop = () => {
      x += (tx - x) * k; y += (ty - y) * k;
      prev.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      raf = (on || Math.abs(tx - x) + Math.abs(ty - y) > .5) ? requestAnimationFrame(loop) : 0;
    };
    const aim = e => { tx = Math.min(innerWidth - 372, e.clientX + 28); ty = Math.max(56, Math.min(innerHeight - 236, e.clientY - 110)); };
    index.addEventListener('pointermove', e => { aim(e); if (!raf) raf = requestAnimationFrame(loop); });
    $$('.row[data-preview]', index).forEach(r => {
      r.addEventListener('pointerenter', e => { pimg.src = r.dataset.preview; if (!on) { aim(e); x = tx; y = ty; } on = true; prev.classList.add('on'); if (!raf) raf = requestAnimationFrame(loop); });
      r.addEventListener('pointerleave', () => { on = false; prev.classList.remove('on'); });
    });
  }

  // Magnetic call-to-action buttons (fine pointers, motion allowed).
  if (fine && !reduce) $$('[data-magnetic]').forEach(b => {
    b.addEventListener('pointermove', e => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${((e.clientX - r.left) / r.width - .5) * 12}px, ${((e.clientY - r.top) / r.height - .5) * 10}px)`;
    });
    b.addEventListener('pointerleave', () => { b.style.transform = ''; });
  });

  // Hunk call demo: the conversation plays once when it scrolls into view (about 5 s).
  const call = $('[data-call]');
  if (call) {
    const lines = $$('.call-lines li', call), timerEl = $('[data-call-timer]', call);
    let ts = [], iv = 0;
    const run = () => {
      ts.forEach(clearTimeout); clearInterval(iv); ts = [];
      lines.forEach(l => l.classList.add('pending'));
      call.classList.add('live');
      const t0 = Date.now();
      iv = setInterval(() => { timerEl.textContent = `00:${String(((Date.now() - t0) / 1000) | 0).padStart(2, '0')}`; }, 250);
      lines.forEach((l, i) => ts.push(setTimeout(() => l.classList.remove('pending'), 450 + i * 950)));
      ts.push(setTimeout(() => { call.classList.remove('live'); clearInterval(iv); }, 450 + lines.length * 950));
    };
    if (reduce) timerEl.textContent = '00:41';
    else {
      lines.forEach(l => l.classList.add('pending'));
      const o = new IntersectionObserver(es => { if (es[0].isIntersecting) { run(); o.disconnect(); } }, { threshold: .45 });
      o.observe(call);
    }
    const rb = $('[data-call-replay]', call);
    rb && rb.addEventListener('click', () => { if (reduce) return; run(); });
  }

  // Theme toggle.
  const themeMeta = $('meta[name="theme-color"]');
  const toggleTheme = () => {
    const night = root.dataset.theme !== 'night';
    if (night) root.dataset.theme = 'night'; else delete root.dataset.theme;
    try { night ? localStorage.setItem('theme', 'night') : localStorage.removeItem('theme'); } catch (e) { /* storage blocked */ }
    if (themeMeta) themeMeta.content = night ? '#0F0F0E' : '#F2F0EB';
  };
  $$('[data-theme-toggle]').forEach(b => b.addEventListener('click', toggleTheme));

  // Toast (used by the command-menu easter egg).
  const toastEl = $('.toast');
  let toastT = 0;
  const toast = msg => { if (!toastEl) return; toastEl.textContent = msg; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('on'), 1900); };

  // Command menu (Ctrl/⌘K or "/").
  const dlg = $('dialog.cmdk');
  if (dlg && dlg.showModal) {
    const input = $('input', dlg), list = $('ul', dlg);
    const resumeHref = ru ? '../resume.pdf' : 'resume.pdf';
    const go = id => () => { dlg.close(); const el = d.getElementById(id); el && el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); };
    const ext = url => () => { dlg.close(); window.open(url, '_blank', 'noopener'); };
    const CMDS = [
      { label: T.work, hint: '01', run: go('work') },
      { label: T.cases, hint: '02', run: go('cases') },
      { label: T.services, hint: '03', run: go('services') },
      { label: T.contact, hint: '06', run: go('contact') },
      { label: T.wa, hint: 'wa', run: ext(WA) },
      { label: T.mail, hint: '@', run: () => { dlg.close(); location.href = MAIL; } },
      { label: T.cv, hint: 'pdf', run: ext(resumeHref) },
      { label: 'GitHub', hint: '↗', run: ext('https://github.com/ssarfaroz') },
      { label: 'LinkedIn', hint: '↗', run: ext('https://www.linkedin.com/in/sarfaroz9955/') },
      { label: T.lang, hint: ru ? 'en' : 'ru', run: () => { location.href = ru ? '../' : 'ru/'; } },
      { label: T.theme, hint: '◐', run: () => { toggleTheme(); dlg.close(); } }
    ];
    const SECRET = { label: 'sudo hire sarfaroz', hint: 'root', run: () => { dlg.close(); toast(T.hired); setTimeout(() => { location.href = MAIL; }, 900); } };
    let sel = 0, shown = [];
    const mark = () => {
      $$('li', list).forEach((li, i) => li.setAttribute('aria-selected', String(i === sel)));
      if (shown.length) { input.setAttribute('aria-activedescendant', 'cmd-' + sel); const li = $$('li', list)[sel]; li && li.scrollIntoView({ block: 'nearest' }); }
    };
    const render = () => {
      const q = input.value.trim().toLowerCase();
      shown = q === 'help' ? CMDS.slice() : CMDS.filter(c => c.label.toLowerCase().includes(q));
      if (q.startsWith('sudo') || q.startsWith('hire')) shown.unshift(SECRET);
      sel = Math.min(sel, Math.max(0, shown.length - 1));
      list.textContent = '';
      shown.forEach((c, i) => {
        const li = d.createElement('li'), a = d.createElement('span'), b = d.createElement('span');
        li.id = 'cmd-' + i; li.setAttribute('role', 'option');
        a.textContent = c.label; b.textContent = c.hint; b.className = 'k';
        li.append(a, b);
        li.addEventListener('click', () => c.run());
        li.addEventListener('pointermove', () => { if (sel !== i) { sel = i; mark(); } });
        list.append(li);
      });
      if (!shown.length) { const li = d.createElement('li'); li.textContent = T.none; list.append(li); input.removeAttribute('aria-activedescendant'); }
      mark();
    };
    const openCmd = () => { if (dlg.open) return; input.value = ''; sel = 0; render(); dlg.showModal(); input.focus(); };
    input.addEventListener('input', () => { sel = 0; render(); });
    input.addEventListener('keydown', e => {
      if (!shown.length) return;
      if (e.key === 'ArrowDown') { sel = (sel + 1) % shown.length; mark(); e.preventDefault(); }
      else if (e.key === 'ArrowUp') { sel = (sel - 1 + shown.length) % shown.length; mark(); e.preventDefault(); }
      else if (e.key === 'Enter') { e.preventDefault(); shown[sel].run(); }
    });
    dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
    d.addEventListener('keydown', e => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); dlg.open ? dlg.close() : openCmd(); }
      else if (e.key === '/' && !dlg.open && !/^(INPUT|TEXTAREA|SELECT)$/.test(d.activeElement.tagName)) { e.preventDefault(); openCmd(); }
    });
    $$('[data-cmdk-open]').forEach(b => b.addEventListener('click', openCmd));
  }

  console.log('%c SO %c Sarfaroz Oripov · full-stack developer\nReading the source? Press ' + (mac ? '⌘K' : 'Ctrl K') + ' and type "sudo hire sarfaroz".\n' + EMAIL,
    'background:#FF4F00;color:#111;font:16px Georgia;padding:4px 6px', 'font:12px monospace');
})();
