/* Space rock: an original psych-rock groove synthesised live in the browser
   (no audio files, no copyrighted recordings), and the visuals that react to it.
   Audio only starts when a visitor turns the amp knob. */
(() => {
  const root = document.documentElement;
  const body = document.body;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const knob = document.getElementById('ampKnob');
  const knobState = document.getElementById('ampState');
  const nowPlaying = document.getElementById('nowPlaying');
  if (!knob) return;

  /* ───────── audio engine ───────── */
  const BPM = 96;
  const STEP = 60 / BPM / 4; // sixteenth note
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  // Em9 → Cmaj7 → G6 → D/F#, voiced for a warm pad
  const CHORDS = [[52, 55, 59, 62, 66], [48, 52, 55, 59, 64], [43, 50, 55, 59, 64], [42, 50, 54, 57, 62]];
  const BASS_ROOT = [40, 36, 43, 42];
  const BASS_PAT = [0, null, null, 0, null, null, 12, null, 0, null, 7, null, 10, null, 7, null];

  let ctx, master, analyser, noiseBuf, delayIn, revIn, padBus;
  const hits = []; // [time, weight] of drum hits, drives the visuals
  let playing = false, vol = 11, timer = null, nextTime = 0, stepIdx = 0, startedAt = 0;

  function impulse(sec, decay) {
    const len = Math.floor(ctx.sampleRate * sec);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  function initAudio() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.ratio.value = 4; comp.attack.value = .004; comp.release.value = .22;
    analyser = ctx.createAnalyser(); analyser.fftSize = 1024; analyser.smoothingTimeConstant = .55;
    master.connect(comp); comp.connect(analyser); analyser.connect(ctx.destination);

    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const nd = noiseBuf.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;

    // dotted-eighth tape-ish delay
    delayIn = ctx.createGain();
    const delay = ctx.createDelay(2); delay.delayTime.value = STEP * 3;
    const fb = ctx.createGain(); fb.gain.value = .4;
    const tone = ctx.createBiquadFilter(); tone.type = 'lowpass'; tone.frequency.value = 2000;
    delayIn.connect(delay); delay.connect(tone); tone.connect(fb); fb.connect(delay); tone.connect(master);

    // big spacey reverb
    revIn = ctx.createGain();
    const verb = ctx.createConvolver(); verb.buffer = impulse(3, 2.4);
    const verbOut = ctx.createGain(); verbOut.gain.value = .55;
    revIn.connect(verb); verb.connect(verbOut); verbOut.connect(master);

    // pad bus: slow filter sweep + chorus wobble (the psych part)
    padBus = ctx.createBiquadFilter(); padBus.type = 'lowpass'; padBus.frequency.value = 1000; padBus.Q.value = 7;
    const lfo = ctx.createOscillator(); lfo.frequency.value = .06;
    const lfoAmt = ctx.createGain(); lfoAmt.gain.value = 750;
    lfo.connect(lfoAmt); lfoAmt.connect(padBus.frequency); lfo.start();
    const chorus = ctx.createDelay(.05); chorus.delayTime.value = .014;
    const wob = ctx.createOscillator(); wob.frequency.value = .4;
    const wobAmt = ctx.createGain(); wobAmt.gain.value = .006;
    wob.connect(wobAmt); wobAmt.connect(chorus.delayTime); wob.start();
    const padOut = ctx.createGain(); padOut.gain.value = .5;
    padBus.connect(padOut); padBus.connect(chorus); chorus.connect(padOut);
    padOut.connect(master); padOut.connect(revIn);
    return true;
  }

  function env(g, t, peak, attack, decay) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  }

  function kick(t) {
    hits.push([t, 1]);
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(155, t); o.frequency.exponentialRampToValueAtTime(40, t + .13);
    env(g, t, 1, .002, .42);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + .5);
  }
  function noise(t, dur, type, freq, q, peak) {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain(); env(g, t, peak, .001, dur);
    s.connect(f); f.connect(g); g.connect(master);
    s.start(t, Math.random() * .5); s.stop(t + dur + .05);
    return g;
  }
  function snare(t, v = 1) {
    hits.push([t, .55 * v]);
    const g = noise(t, .2, 'bandpass', 1900, .7, .5 * v); g.connect(revIn);
    const o = ctx.createOscillator(), og = ctx.createGain(); o.type = 'triangle';
    o.frequency.setValueAtTime(230, t); o.frequency.exponentialRampToValueAtTime(165, t + .08);
    env(og, t, .3 * v, .001, .11); o.connect(og); og.connect(master); o.start(t); o.stop(t + .15);
  }
  function hat(t, open, v) { noise(t, open ? .3 : .045, 'highpass', 7800, .6, (open ? .13 : .11) * v); }
  function crash(t) { hits.push([t, 1]); const g = noise(t, 1.6, 'highpass', 4800, .3, .16); g.connect(revIn); }
  function tom(t, f) {
    hits.push([t, .7]);
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(f * 1.7, t); o.frequency.exponentialRampToValueAtTime(f, t + .1);
    env(g, t, .55, .002, .32); o.connect(g); g.connect(master); g.connect(revIn); o.start(t); o.stop(t + .4);
  }
  function bass(t, m, dur) {
    const o = ctx.createOscillator(), sub = ctx.createOscillator(), subG = ctx.createGain();
    const f = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = 'sawtooth'; o.frequency.value = mtof(m);
    sub.type = 'sine'; sub.frequency.value = mtof(m - 12); subG.gain.value = .7;
    f.type = 'lowpass'; f.Q.value = 5;
    f.frequency.setValueAtTime(1300, t); f.frequency.exponentialRampToValueAtTime(240, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(.3, t + .008);
    g.gain.setTargetAtTime(0.0001, t + dur * .75, .05);
    o.connect(f); sub.connect(subG); subG.connect(f); f.connect(g); g.connect(master);
    o.start(t); sub.start(t); o.stop(t + dur + .4); sub.stop(t + dur + .4);
  }
  function pad(t, notes, dur) {
    notes.forEach(m => [-9, 9].forEach(det => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sawtooth'; o.frequency.value = mtof(m); o.detune.value = det;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(.04, t + .7);
      g.gain.setValueAtTime(.04, t + dur - .3);
      g.gain.linearRampToValueAtTime(0, t + dur + .5);
      o.connect(g); g.connect(padBus); o.start(t); o.stop(t + dur + .6);
    }));
  }
  function lead(t, m) {
    const o = ctx.createOscillator(), g = ctx.createGain(), vib = ctx.createOscillator(), vibAmt = ctx.createGain();
    o.type = 'triangle'; o.frequency.value = mtof(m);
    vib.frequency.value = 5.5; vibAmt.gain.value = 6; vib.connect(vibAmt); vibAmt.connect(o.detune);
    env(g, t, .1, .01, .38);
    o.connect(g); g.connect(master); g.connect(delayIn); g.connect(revIn);
    o.start(t); vib.start(t); o.stop(t + .45); vib.stop(t + .45);
  }

  function scheduleStep(i, t) {
    const bar = Math.floor(i / 16) % 8, s = i % 16, ch = bar % 4;
    const fill = ch === 3 && s >= 12;
    if (s === 0) pad(t, CHORDS[ch], STEP * 16);
    if (s === 0 && bar === 0) crash(t);
    if (fill) {
      if (bar === 7) tom(t, [196, 165, 131, 98][s - 12]);
      else snare(t, .4 + (s - 12) * .18);
    } else {
      if (s === 0 || s === 7 || s === 10) kick(t);
      if (s === 4 || s === 12) snare(t);
      if (s % 2 === 0) hat(t, s === 14, s % 4 === 0 ? 1 : .6);
      else if (Math.random() < .22) hat(t, false, .3);
    }
    const off = BASS_PAT[s];
    if (off !== null) bass(t, BASS_ROOT[ch] + off, STEP * (s === 0 ? 2.6 : 1.6));
    if (bar >= 4 && s % 2 === 0 && Math.random() < .55) {
      const n = CHORDS[ch];
      lead(t, n[(s / 2 + bar) % n.length] + 24);
    }
  }

  function tick() {
    while (nextTime < ctx.currentTime + .12) {
      scheduleStep(stepIdx, nextTime);
      nextTime += STEP; stepIdx++;
    }
  }

  const gainFor = v => v <= 0 ? 0 : .06 + .6 * Math.pow(v / 11, 1.6);

  function setVol(v) {
    vol = Math.max(0, Math.min(11, Math.round(v)));
    knob.style.setProperty('--v', playing ? vol : 0);
    if (knobState) knobState.textContent = playing ? (vol === 11 ? '11' : String(vol)) : 'off';
    knob.setAttribute('aria-valuetext', playing ? 'volume ' + vol + ' of 11' : 'off');
    if (ctx && playing) master.gain.setTargetAtTime(gainFor(vol), ctx.currentTime, .12);
  }

  async function turnOn() {
    if (!ctx && !initAudio()) return;
    if (ctx.state === 'suspended') await ctx.resume();
    playing = true; startedAt = performance.now();
    stepIdx = 0; nextTime = ctx.currentTime + .08;
    clearInterval(timer); timer = setInterval(tick, 25);
    if (vol === 0) vol = 11;
    setVol(vol);
    body.classList.add('amped');
    knob.setAttribute('aria-pressed', 'true');
    if (nowPlaying) nowPlaying.hidden = false;
    placeArm();
    track('amp_turned_on', { volume: vol });
    if (!rafOn) loop();
  }

  function turnOff() {
    if (!playing) return;
    playing = false;
    master.gain.setTargetAtTime(0, ctx.currentTime, .15);
    const c = ctx;
    setTimeout(() => { if (!playing) { clearInterval(timer); c.suspend(); } }, 700);
    setVol(vol);
    body.classList.remove('amped');
    knob.setAttribute('aria-pressed', 'false');
    if (nowPlaying) nowPlaying.hidden = true;
    track('amp_turned_off', { seconds_listened: Math.round((performance.now() - startedAt) / 1000), volume: vol });
  }

  function track(name, props) {
    try { if (window.posthog && posthog.capture) posthog.capture(name, props); } catch (e) {}
  }

  /* knob: click toggles; drag up/down, wheel or arrow keys change volume */
  let downY = null, downVol = 0, dragged = false;
  knob.addEventListener('pointerdown', e => {
    downY = e.clientY; downVol = vol; dragged = false;
    knob.setPointerCapture && knob.setPointerCapture(e.pointerId);
  });
  knob.addEventListener('pointermove', e => {
    if (downY === null || !playing) return;
    const dy = downY - e.clientY;
    if (Math.abs(dy) > 5) dragged = true;
    if (dragged) setVol(downVol + dy / 12);
  });
  knob.addEventListener('pointerup', () => { downY = null; });
  knob.addEventListener('click', e => {
    if (dragged) { dragged = false; e.preventDefault(); return; }
    playing ? turnOff() : turnOn();
  });
  knob.addEventListener('wheel', e => {
    if (!playing) return;
    e.preventDefault(); setVol(vol + (e.deltaY < 0 ? 1 : -1));
  }, { passive: false });
  knob.addEventListener('keydown', e => {
    if (!playing) return;
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { e.preventDefault(); setVol(vol + 1); }
    if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { e.preventDefault(); setVol(vol - 1); }
  });
  document.addEventListener('visibilitychange', () => {
    if (!ctx || !playing) return;
    document.hidden ? ctx.suspend() : ctx.resume();
  });
  setVol(vol);

  /* ───────── visuals ───────── */
  // Tonearm that drops onto the eclipse when the music starts
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
    let nx = Math.min(cx + r * .42, h.width - L * .82 - 24);
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
  addEventListener('resize', placeArm);
  setTimeout(placeArm, 2600);

  // Light show layer behind the content
  const lightshow = document.createElement('div');
  lightshow.id = 'lightshow'; lightshow.setAttribute('aria-hidden', 'true');
  document.body.prepend(lightshow);

  // Section dividers become live waveforms
  const waves = [];
  document.querySelectorAll('hr.divider').forEach(hr => {
    const c = document.createElement('canvas');
    c.className = 'wave'; c.setAttribute('aria-hidden', 'true');
    hr.after(c);
    waves.push({ c, g: c.getContext('2d'), visible: false, seed: Math.random() * 10 });
  });
  const waveObs = new IntersectionObserver(es => es.forEach(e => {
    const w = waves.find(x => x.c === e.target); if (w) w.visible = e.isIntersecting;
  }));
  waves.forEach(w => waveObs.observe(w.c));

  function sizeWave(w) {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = w.c.clientWidth, H = w.c.clientHeight;
    if (w.c.width !== Math.round(W * dpr)) { w.c.width = Math.round(W * dpr); w.c.height = Math.round(H * dpr); }
    w.g.setTransform(dpr, 0, 0, dpr, 0, 0);
    return [W, H];
  }

  const freq = new Uint8Array(512);
  const wave = new Uint8Array(1024);
  let bassLvl = 0, level = 0, rafOn = false;
  const eqBars = nowPlaying ? nowPlaying.querySelectorAll('.np-eq i') : [];

  function drawWave(w, t) {
    const [W, H] = sizeWave(w);
    const g = w.g, mid = H / 2;
    g.clearRect(0, 0, W, H);
    const pts = 160;
    const strokes = playing
      ? [['rgba(255,80,170,.45)', -1.5], ['rgba(70,220,255,.4)', 1.5], ['rgba(225,212,255,.9)', 0]]
      : [['rgba(201,178,255,.55)', 0]];
    strokes.forEach(([col, dx]) => {
      const grad = g.createLinearGradient(0, 0, W, 0);
      grad.addColorStop(0, 'rgba(0,0,0,0)'); grad.addColorStop(.18, col);
      grad.addColorStop(.82, col); grad.addColorStop(1, 'rgba(0,0,0,0)');
      g.strokeStyle = grad; g.lineWidth = playing ? 1.4 : 1;
      g.beginPath();
      for (let i = 0; i <= pts; i++) {
        const x = (i / pts) * W;
        const edge = Math.sin((i / pts) * Math.PI);
        let y;
        if (playing) {
          const v = (wave[Math.floor((i / pts) * (wave.length - 1))] - 128) / 128;
          y = mid + v * (H * .42) * edge * (.6 + bassLvl);
        } else {
          y = mid + Math.sin(i * .09 + t * .0012 + w.seed) * Math.sin(i * .021 + t * .0004) * 3 * edge;
        }
        i ? g.lineTo(x + dx, y) : g.moveTo(x + dx, y);
      }
      g.stroke();
    });
  }

  function loop(t = performance.now()) {
    if (playing && analyser) {
      analyser.getByteFrequencyData(freq);
      analyser.getByteTimeDomainData(wave);
      const now = ctx.currentTime;
      while (hits.length && now - hits[0][0] > .6) hits.shift();
      let b = 0;
      for (const [t, w] of hits) if (t <= now) b = Math.max(b, w * Math.exp(-(now - t) * 9));
      bassLvl = b;
      let sum = 0; for (let i = 0; i < wave.length; i += 4) { const v = (wave[i] - 128) / 128; sum += v * v; }
      level = level * .8 + Math.min(1, Math.sqrt(sum / (wave.length / 4)) * 3) * .2;
      eqBars.forEach((bar, k) => {
        const v = freq[2 + k * 9] / 255;
        bar.style.transform = 'scaleY(' + Math.max(.15, v).toFixed(2) + ')';
      });
    } else {
      bassLvl *= .9; level *= .9;
    }
    root.style.setProperty('--bass', bassLvl.toFixed(3));
    root.style.setProperty('--lvl', level.toFixed(3));
    waves.forEach(w => { if (w.visible) drawWave(w, t); });
    if (playing || !reduceMotion || bassLvl > .01) { rafOn = true; requestAnimationFrame(loop); }
    else rafOn = false;
  }
  if (reduceMotion) { waves.forEach(w => drawWave(w, 0)); } else { loop(); }
})();
