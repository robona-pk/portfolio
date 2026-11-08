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
  let yt = null, ready = false, loading = false, playing = false, startedAt = 0, pending = false;

  function setState(label) { if (knobState) knobState.textContent = label; }
  function track(name, props) {
    try { if (window.posthog && posthog.capture) posthog.capture(name, props); } catch (e) {}
  }
  function showPlayer(on) { player.hidden = !on; body.classList.toggle('np-open', on); }

  function setPlaying(on) {
    if (on === playing) return;
    playing = on;
    body.classList.toggle('amped', on);
    knob.setAttribute('aria-pressed', on ? 'true' : 'false');
    setState(on ? '11' : 'paused');
    if (on) { startedAt = performance.now(); placeArm(); track('amp_turned_on', { song: SONG }); }
    else track('amp_turned_off', { song: SONG, seconds_listened: Math.round((performance.now() - startedAt) / 1000) });
  }

  function loadYouTube() {
    loading = true; setState('tuning');
    showPlayer(true);
    window.onYouTubeIframeAPIReady = () => {
      yt = new YT.Player(slot, {
        host: 'https://www.youtube-nocookie.com',
        videoId: VIDEO_ID, width: '100%', height: '100%',
        playerVars: { autoplay: 1, playsinline: 1, rel: 0, modestbranding: 1 },
        events: {
          onReady: e => { ready = true; loading = false; if (pending) { pending = false; e.target.playVideo(); } },
          onStateChange: e => {
            if (e.data === 1) setPlaying(true);                     // playing
            else if (e.data === 2 || e.data === 0) setPlaying(false); // paused or ended
          },
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
    if (ready && !playing) { player.classList.add('np-failed'); setState('off'); return; }
    if (ready) return;
    player.classList.add('np-failed');
    setState('off');
  }

  knob.addEventListener('click', () => {
    if (!yt) { pending = true; if (!loading) loadYouTube(); return; }
    showPlayer(true);
    if (!ready) { pending = true; return; }
    playing ? yt.pauseVideo() : yt.playVideo();
  });

  closeBtn && closeBtn.addEventListener('click', () => {
    if (ready && playing) yt.pauseVideo();
    setPlaying(false); setState('off');
    showPlayer(false);
  });

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
    if (!playing) return;
    if (!st) ls.classList.add('is-scrolling');
    clearTimeout(st);
    st = setTimeout(() => { ls.classList.remove('is-scrolling'); st = null; }, 180);
  }, { passive: true });

  /* About portrait flips to the drum kit */
  const flip = document.getElementById('portraitFlip');
  const tag = document.getElementById('portraitTag');
  if (flip) flip.addEventListener('click', () => {
    const on = !flip.classList.contains('is-flipped');
    flip.classList.toggle('is-flipped', on);
    flip.setAttribute('aria-pressed', on ? 'true' : 'false');
    flip.setAttribute('aria-label', on ? 'Flip the photo back to Prerna' : "Flip the photo to see Prerna's drum kit");
    if (tag) tag.textContent = on ? 'DRUMS / 4:4' : 'PM / 05';
    track('portrait_flipped', { side: on ? 'drums' : 'portrait' });
  });

  /* Section dividers become sound waves (pure CSS motion once inserted) */
  document.querySelectorAll('hr.divider').forEach(hr => {
    const w = document.createElement('div');
    w.className = 'wave'; w.setAttribute('aria-hidden', 'true');
    w.innerHTML = '<i></i>';
    hr.after(w);
  });
})();
