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
  function setMode(on) {
    if (on === modeOn) return;
    modeOn = on;
    body.classList.toggle('amped', on);
    knob.setAttribute('aria-pressed', on ? 'true' : 'false');
    setState(on ? 'on' : 'off');
    showPlayer(on);
    if (on) {
      startedAt = performance.now(); placeArm();
      usedThisVisit = true; tagFriday({ on: true, used: true });
      setFlip(true, 'friday_mode');
      track('amp_turned_on', { song: SONG });
      if (!yt) { pending = true; if (!loading) loadYouTube(); }
      else if (ready) yt.playVideo();
      else pending = true;
    } else {
      pending = false;
      if (ready) yt.pauseVideo();
      tagFriday({ on: false });
      setFlip(false, 'friday_mode');
      track('amp_turned_off', { song: SONG, seconds_listened: Math.round((performance.now() - startedAt) / 1000) });
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
    setMode(!modeOn);
    if (!body.classList.contains('amp-used')) {
      body.classList.add('amp-used');
      try { localStorage.setItem('pk-friday-used', '1'); } catch (e) {}
    }
  });

  /* Discoverability: the knob pings until first use (remembered per visitor) */
  try { if (localStorage.getItem('pk-friday-used') === '1') body.classList.add('amp-used'); } catch (e) {}
  closeBtn && closeBtn.addEventListener('click', () => setMode(false));

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

  /* Section dividers become sound waves (pure CSS motion once inserted) */
  document.querySelectorAll('hr.divider').forEach(hr => {
    const w = document.createElement('div');
    w.className = 'wave'; w.setAttribute('aria-hidden', 'true');
    w.innerHTML = '<i></i>';
    hr.after(w);
  });
})();
