(() => {
  'use strict';

  const demo = document.querySelector('.lead-demo');
  if (!demo || !('IntersectionObserver' in window)) return;
  const toggle = demo.querySelector('[data-demo-toggle]');
  const label = toggle?.querySelector('[data-demo-toggle-label]');
  const replay = demo.querySelector('[data-demo-replay]');
  if (!label || !replay) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const durations = [2800, 3000, 1000];
  let step = 1;
  let remaining = durations[0];
  let deadline = 0;
  let timer = null;
  let inView = false;
  let userPaused = false;
  let finished = reducedMotion.matches;

  function stopTimer() {
    if (timer === null) return;
    clearTimeout(timer);
    remaining = Math.max(0, deadline - performance.now());
    timer = null;
  }

  function advance() {
    timer = null;
    if (!document.hidden && inView && !userPaused && !reducedMotion.matches) {
      if (step === durations.length) finished = true;
      else {
        step += 1;
        remaining = durations[step - 1];
      }
    }
    sync();
  }

  function sync() {
    if (reducedMotion.matches) finished = true;
    const playing = !finished && !userPaused && inView && !document.hidden;
    if (playing && timer === null) {
      deadline = performance.now() + remaining;
      timer = setTimeout(advance, remaining);
    } else if (!playing) {
      stopTimer();
    }

    demo.dataset.step = String(finished ? durations.length : step);
    demo.dataset.state = finished ? 'finished' : userPaused ? 'paused' : playing ? 'playing' : 'waiting';
    const moveFocusToReplay = finished && document.activeElement === toggle && !reducedMotion.matches;
    toggle.hidden = finished;
    replay.hidden = !finished || reducedMotion.matches;
    const action = userPaused ? 'Resume' : 'Pause';
    label.textContent = action;
    toggle.setAttribute('aria-label', action + ' example');
    if (moveFocusToReplay) replay.focus({preventScroll: true});
  }

  toggle.addEventListener('click', () => {
    if (finished) return;
    userPaused = !userPaused;
    sync();
  });
  replay.addEventListener('click', () => {
    if (reducedMotion.matches) return;
    const restoreFocus = document.activeElement === replay;
    stopTimer();
    step = 1;
    remaining = durations[0];
    userPaused = false;
    finished = false;
    sync();
    if (restoreFocus) toggle.focus({preventScroll: true});
  });

  const header = document.querySelector('.header');
  let observer;
  function observeVisibility() {
    const headerHeight = header?.offsetHeight || 0;
    const available = Math.max(1, document.documentElement.clientHeight - headerHeight);
    const threshold = Math.min(.5, .45 * available / Math.max(1, demo.offsetHeight));
    const rootMargin = (0 - headerHeight) + 'px 0px 0px 0px';
    if (observer?.rootMargin === rootMargin && Math.abs(observer.thresholds[0] - threshold) < .0001) return;

    observer?.disconnect();
    observer = new IntersectionObserver((entries, source) => {
      if (source !== observer) return;
      const entry = entries[entries.length - 1];
      inView = entry.isIntersecting && entry.intersectionRatio >= source.thresholds[0];
      sync();
    }, {rootMargin, threshold});
    observer.observe(demo);
  }

  observeVisibility();
  window.addEventListener('resize', observeVisibility);
  if ('ResizeObserver' in window) {
    const sizeObserver = new ResizeObserver(observeVisibility);
    sizeObserver.observe(demo);
    if (header) sizeObserver.observe(header);
  }
  document.addEventListener('visibilitychange', sync);
  reducedMotion.addEventListener('change', sync);
  demo.dataset.enhanced = 'true';
  sync();
})();
