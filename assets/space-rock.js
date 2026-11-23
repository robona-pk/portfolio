/* Space rock: the amp knob plays Tame Impala's "Feels Like We Only Go Backwards"
   (official video, YouTube privacy-enhanced player) and the page moves with it.
   Performance rules: nothing runs per frame in JS. All motion is CSS animation on
   transform/opacity only, so scrolling stays smooth. YouTube loads on first click only. */
(() => {
  const body = document.body;
  const knob = document.getElementById('ampKnob');
  const knobState = document.getElementById('ampState');
  const player = document.getElementById('nowPlaying');
  const slot = document.getElementById('videoSlot');
  const closeBtn = document.getElementById('npClose');
  if (!knob || !player || !slot) return;

  const VIDEO_ID = 'wycjnCCgUes'; // Tame Impala - Feels Like We Only Go Backwards (official video)
  const SONG = 'Feels Like We Only Go Backwards';
  let yt = null, ready = false, loading = false, startedAt = 0, pending = false;

  function setState(label) { if (knobState) knobState.textContent = label; }
  function track(name, props) {
    try { if (window.posthog && posthog.capture) posthog.capture(name, props); } catch (e) {}
  }
  // Tag every PostHog event with Friday Mode state so any metric (scroll depth, CTAs,
  // conversions) can be split by it. friday_mode = current state; friday_mode_used =
  // turned on at least once in this visit (session).
  function tagFriday(props) {
    try {
      if (!window.posthog) return;
      if (posthog.register) posthog.register({ friday_mode: props.on ? 'on' : 'off' });
      if (props.used && posthog.register_for_session) posthog.register_for_session({ friday_mode_used: true });
    } catch (e) {}
  }
  let usedThisVisit = false;
  tagFriday({ on: false });

  // Scroll depth milestones (25/50/75/100%), once each per page view, tagged with Friday Mode
  const depthHit = new Set();
  let depthTimer = null;
  function checkDepth() {
    depthTimer = null;
    const max = document.documentElement.scrollHeight - innerHeight;
    if (max <= 0) return;
    const pct = (scrollY / max) * 100;
    [25, 50, 75, 100].forEach(m => {
      if (pct >= m - 0.5 && !depthHit.has(m)) {
        depthHit.add(m);
        track('scroll_depth_reached', { depth: m, friday_mode: modeOn ? 'on' : 'off', friday_mode_used: usedThisVisit });
      }
    });
  }
  addEventListener('scroll', () => { if (!depthTimer) depthTimer = setTimeout(checkDepth, 250); }, { passive: true });
  function showPlayer(on) { player.hidden = !on; body.classList.toggle('np-open', on); if (on) checkWide(); }

  /* Resizable player: drag the corner grip or use arrow keys. YouTube requires a
     player at least 200px tall, so height never drops below that (CSS handles it). */
  const MIN_W = 220, KEY = 'pk-player-width';
  const maxW = () => Math.min(720, innerWidth - 20);
  function setWidth(w, save) {
    w = Math.round(Math.max(MIN_W, Math.min(maxW(), w)));
    player.style.setProperty('--np-w', w + 'px');
    checkWide();
    if (save) { try { localStorage.setItem(KEY, String(w)); } catch (e) {} }
    return w;
  }
  function checkWide() {
    const r = player.getBoundingClientRect();
    body.classList.toggle('np-wide', !player.hidden && r.right > innerWidth - 130);
  }
  try { const saved = +localStorage.getItem(KEY); if (saved) setWidth(saved, false); } catch (e) {}
  const grip = document.getElementById('npResize');
  if (grip) {
    let sx = 0, sy = 0, sw = 0, dragging = false;
    grip.addEventListener('pointerdown', e => {
      dragging = true; sx = e.clientX; sy = e.clientY; sw = player.getBoundingClientRect().width;
      grip.setPointerCapture(e.pointerId); player.classList.add('is-resizing'); e.preventDefault();
    });
    grip.addEventListener('pointermove', e => {
      if (!dragging) return;
      setWidth(sw + (e.clientX - sx) - (e.clientY - sy) * 16 / 9 / 2, false);
    });
    const end = () => {
      if (!dragging) return; dragging = false; player.classList.remove('is-resizing');
      setWidth(player.getBoundingClientRect().width, true);
      track('player_resized', { width: Math.round(player.getBoundingClientRect().width) });
    };
    grip.addEventListener('pointerup', end); grip.addEventListener('pointercancel', end);
    grip.addEventListener('keydown', e => {
      const step = e.shiftKey ? 80 : 30, w = player.getBoundingClientRect().width;
      if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { e.preventDefault(); setWidth(w + step, true); }
      if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { e.preventDefault(); setWidth(w - step, true); }
    });
    grip.addEventListener('dblclick', () => { player.style.removeProperty('--np-w'); try { localStorage.removeItem(KEY); } catch (e) {} checkWide(); });
  }
  addEventListener('resize', () => { if (!player.hidden) { const w = player.getBoundingClientRect().width; if (w > maxW()) setWidth(maxW(), false); checkWide(); } });

  /* Friday Mode is a simple on/off switch.
     On: the video window appears, the song plays, the page goes into its Friday look.
     Off: the song stops, the window disappears, the page goes back to normal. */
  let modeOn = false;
  // source: how the visitor turned the mode on/off — 'direct' (the knob),
  // 'tip' (the one-time hint), 'close' (the player's x). Lets tip -> play be measured.
  function setMode(on, source = 'direct') {
    if (on === modeOn) return;
    tick(); // attribute elapsed time to the state that is ending
    modeOn = on;
    body.classList.toggle('amped', on);
    knob.setAttribute('aria-pressed', on ? 'true' : 'false');
    setState(on ? 'on' : 'off');
    showPlayer(on);
    if (on) {
      startedAt = performance.now(); placeArm();
      usedThisVisit = true; tagFriday({ on: true, used: true });
      armAutoFlip();
      track('amp_turned_on', { song: SONG, source });
      if (!yt) { pending = true; if (!loading) loadYouTube(); }
      else if (ready) yt.playVideo();
      else pending = true;
    } else {
      pending = false;
      if (ready) yt.pauseVideo();
      tagFriday({ on: false });
      autoFlipArmed = false; clearTimeout(autoFlipTimer);
      setFlip(false, 'friday_mode');
      track('amp_turned_off', { song: SONG, source, seconds_listened: Math.round((performance.now() - startedAt) / 1000) });
    }
  }

  function loadYouTube() {
    loading = true;
    window.onYouTubeIframeAPIReady = () => {
      yt = new YT.Player(slot, {
        host: 'https://www.youtube-nocookie.com',
        videoId: VIDEO_ID, width: '100%', height: '100%',
        playerVars: { autoplay: 1, playsinline: 1, rel: 0, modestbranding: 1, loop: 1, playlist: VIDEO_ID },
        events: {
          onReady: e => { ready = true; loading = false; if (pending && modeOn) { pending = false; e.target.playVideo(); } },
          onError: fail
        }
      });
    };
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api'; s.async = true;
    s.onerror = fail;
    document.head.appendChild(s);
    setTimeout(() => { if (!ready) fail(); }, 10000);
  }

  function fail() {
    loading = false;
    player.classList.add('np-failed'); // shows the "Watch on YouTube" link; Friday look stays on
  }

  knob.addEventListener('click', () => {
    setMode(!modeOn, 'direct');
    if (!body.classList.contains('amp-used')) {
      body.classList.add('amp-used');
      try { localStorage.setItem('pk-friday-used', '1'); } catch (e) {}
    }
  });

  /* Discoverability: the knob pings until first use (remembered per visitor) */
  let usedBefore = false;
  try { usedBefore = localStorage.getItem('pk-friday-used') === '1'; } catch (e) {}
  if (usedBefore) body.classList.add('amp-used');
  closeBtn && closeBtn.addEventListener('click', () => setMode(false, 'close'));

  /* One-time hint under the knob. Quiet text, no sound until the visitor taps.
     Shown once per browser to people who have never used Friday Mode.
     Funnel: friday_tip_shown -> friday_tip_clicked -> amp_turned_on (source = tip).
     Add ?fridayhint=1 to the URL to force it for testing. */
  const hint = document.getElementById('ampHint');
  const hintGo = document.getElementById('ampHintGo');
  const hintX = document.getElementById('ampHintX');
  if (hint && hintGo && hintX) {
    let forced = false, seen = false;
    try { forced = new URLSearchParams(location.search).get('fridayhint') === '1'; } catch (e) {}
    try { seen = localStorage.getItem('pk-friday-hint') === '1'; } catch (e) {}
    let hintOpen = false, hintTimer = null;
    const placeHint = () => { hint.style.left = knob.offsetLeft + 'px'; };
    const closeHint = method => {
      if (!hintOpen) return;
      hintOpen = false; clearTimeout(hintTimer);
      hint.classList.remove('is-shown');
      setTimeout(() => { hint.hidden = true; }, 350);
      if (method) track('friday_tip_dismissed', { method });
    };
    if (forced || (!usedBefore && !seen)) {
      setTimeout(() => {
        if (modeOn) return; // already discovered it
        placeHint(); hint.hidden = false;
        requestAnimationFrame(() => hint.classList.add('is-shown'));
        hintOpen = true;
        try { localStorage.setItem('pk-friday-hint', '1'); } catch (e) {}
        track('friday_tip_shown', { forced });
        hintTimer = setTimeout(() => closeHint('timeout'), 12000);
      }, 2500);
    }
    hintGo.addEventListener('click', () => {
      track('friday_tip_clicked', {});
      closeHint(null);
      setMode(true, 'tip');
      if (!body.classList.contains('amp-used')) {
        body.classList.add('amp-used');
        try { localStorage.setItem('pk-friday-used', '1'); } catch (e) {}
      }
    });
    hintX.addEventListener('click', () => closeHint('close'));
    knob.addEventListener('click', () => closeHint('knob'));
    addEventListener('scroll', () => { if (hintOpen && scrollY > 600) closeHint('scroll'); }, { passive: true });
    addEventListener('resize', () => { if (hintOpen) placeHint(); });
  }

  /* Engagement time split by Friday Mode state.
     Counts only time the tab is visible and the visitor is engaged: they interacted
     in the last 60s, or the song is playing. Sent as deltas in engagement_time when
     the tab is hidden or the page closes, so sum(seconds_mode_on) vs
     sum(seconds_mode_off) answers "time spent in each mode" directly. */
  const IDLE_MS = 60000;
  let lastInput = performance.now(), lastTick = performance.now();
  let secOn = 0, secOff = 0;
  ['pointerdown', 'keydown', 'scroll', 'touchstart', 'wheel'].forEach(t =>
    addEventListener(t, () => { lastInput = performance.now(); }, { passive: true }));
  function tick() {
    const now = performance.now(), dt = (now - lastTick) / 1000;
    lastTick = now;
    if (document.visibilityState !== 'visible') return;
    if (!modeOn && now - lastInput > IDLE_MS) return;
    if (modeOn) secOn += dt; else secOff += dt;
  }
  setInterval(tick, 1000);
  function flushEngagement(reason) {
    tick();
    const on = Math.round(secOn), off = Math.round(secOff);
    if (on + off < 1) return;
    secOn = 0; secOff = 0;
    try {
      if (window.posthog && posthog.capture) posthog.capture('engagement_time', {
        seconds_mode_on: on, seconds_mode_off: off, reason,
        friday_mode: modeOn ? 'on' : 'off', friday_mode_used: usedThisVisit
      }, { transport: 'sendBeacon' });
    } catch (e) {}
  }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushEngagement('hidden');
    else lastTick = performance.now();
  });
  addEventListener('pagehide', () => flushEngagement('pagehide'));

  /* Tonearm that drops onto the eclipse record when the music plays */
  const hero = document.getElementById('hero');
  const disc = document.querySelector('.eclipse-disc');
  const NS = 'http://www.w3.org/2000/svg';
  const arm = document.createElementNS(NS, 'svg');
  arm.setAttribute('class', 'tonearm'); arm.setAttribute('aria-hidden', 'true');
  const armLine = document.createElementNS(NS, 'line');
  const armBase = document.createElementNS(NS, 'circle'); armBase.setAttribute('class', 'arm-base'); armBase.setAttribute('r', '7');
  const armHead = document.createElementNS(NS, 'rect'); armHead.setAttribute('class', 'arm-head');
  armHead.setAttribute('width', '14'); armHead.setAttribute('height', '7'); armHead.setAttribute('rx', '1.5');
  arm.append(armLine, armBase, armHead);
  if (hero && disc) hero.appendChild(arm);
  function placeArm() {
    if (!hero || !disc) return;
    const h = hero.getBoundingClientRect(), d = disc.getBoundingClientRect();
    const r = d.width / 2, cx = d.left - h.left + r, cy = d.top - h.top + r;
    const L = Math.max(120, Math.min(260, h.width * .17));
    const nx = Math.min(cx + r * .42, h.width - L * .82 - 24);
    const dx = Math.min(Math.abs(nx - cx), r * .95);
    const ny = cy - Math.sqrt(r * r - dx * dx) + 6;
    const px = nx + L * .82, py = ny - L * .57;
    arm.setAttribute('width', h.width); arm.setAttribute('height', h.height);
    arm.setAttribute('viewBox', '0 0 ' + h.width + ' ' + h.height);
    armLine.setAttribute('x1', px); armLine.setAttribute('y1', py);
    armLine.setAttribute('x2', nx); armLine.setAttribute('y2', ny);
    armBase.setAttribute('cx', px); armBase.setAttribute('cy', py);
    const ang = Math.atan2(ny - py, nx - px) * 180 / Math.PI;
    armHead.setAttribute('x', nx - 7); armHead.setAttribute('y', ny - 3.5);
    armHead.setAttribute('transform', 'rotate(' + ang + ' ' + nx + ' ' + ny + ')');
    arm.style.transformOrigin = px + 'px ' + py + 'px';
  }
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(placeArm, 150); });
  setTimeout(placeArm, 2600);

  /* Colour-wash layer: two gradient palettes; CSS fades one over the other (opacity only) */
  const ls = document.createElement('div');
  ls.id = 'lightshow'; ls.setAttribute('aria-hidden', 'true');
  ls.innerHTML = '<i></i>';
  body.prepend(ls);
  // Pause the colour wash while the visitor is actively scrolling, resume when they stop
  let st;
  addEventListener('scroll', () => {
    if (!modeOn) return;
    if (!st) ls.classList.add('is-scrolling');
    clearTimeout(st);
    st = setTimeout(() => { ls.classList.remove('is-scrolling'); st = null; }, 180);
  }, { passive: true });

  /* About portrait flips to the drum kit: by click, or automatically with Friday Mode */
  const flip = document.getElementById('portraitFlip');
  const tag = document.getElementById('portraitTag');
  function setFlip(on, trigger) {
    if (!flip || flip.classList.contains('is-flipped') === on) return;
    flip.classList.toggle('is-flipped', on);
    flip.setAttribute('aria-pressed', on ? 'true' : 'false');
    flip.setAttribute('aria-label', on ? 'Flip the photo back to Prerna' : "Flip the photo to see Prerna's drum kit");
    if (tag) tag.textContent = on ? 'DRUMS / 4:4' : 'PM / 05';
    const hint = document.getElementById('pfHint');
    if (hint) hint.textContent = on ? '\u21BA flip back' : '\u21BB flip';
    // trigger: 'click' = a person flipped it; 'friday_mode' = automatic flip with Friday Mode
    track('portrait_flipped', { side: on ? 'drums' : 'portrait', trigger });
  }
  if (flip) flip.addEventListener('click', () => setFlip(!flip.classList.contains('is-flipped'), 'click'));

  // With Friday Mode on, flip to the drums when the visitor reaches the photo,
  // so they see it happen. Once per Friday Mode activation.
  let autoFlipArmed = false, autoFlipTimer = null, photoVisible = false;
  function tryAutoFlip() {
    if (!autoFlipArmed || !photoVisible) return;
    autoFlipArmed = false;
    autoFlipTimer = setTimeout(() => { if (modeOn) setFlip(true, 'friday_mode'); }, 450);
  }
  function armAutoFlip() { autoFlipArmed = true; tryAutoFlip(); }
  if (flip && 'IntersectionObserver' in window) {
    new IntersectionObserver(es => es.forEach(e => {
      photoVisible = e.isIntersecting;
      if (photoVisible) tryAutoFlip(); else clearTimeout(autoFlipTimer);
    }), { threshold: 0.5 }).observe(flip);
  }

  /* Section dividers become sound waves (pure CSS motion once inserted) */
  document.querySelectorAll('hr.divider').forEach(hr => {
    const w = document.createElement('div');
    w.className = 'wave'; w.setAttribute('aria-hidden', 'true');
    w.innerHTML = '<i></i>';
    hr.after(w);
  });
})();
