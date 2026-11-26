(() => {
  'use strict';
  const canvas = document.querySelector('.hero-field canvas');
  const ctx = canvas?.getContext('2d');
  if (!ctx) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const duration = 4600;
  let width = 0;
  let height = 0;
  let elapsed = reducedMotion.matches ? duration : 0;
  let frame = 0;
  let lastPaint = 0;
  let visible = false;

  function paint(progress) {
    ctx.clearRect(0, 0, width, height);
    const compact = width < 680;
    const settling = (1 - progress) ** 2;
    const centre = width * .5;
    const horizon = height * (compact ? .849 : .791);
    const tau = 2 * Math.PI;
    const groups = compact ? 10 : 17;
    const strands = compact ? 4 : 6;

    // Each narrow band fans out towards the edge. The central reading area stays open.
    for (const side of [-1, 1]) {
      const span = side * width * .525;
      for (let group = 0; group < groups; group++) {
        for (let strand = 0; strand < strands; strand++) {
          const depth = (group + strand / strands * .7) / (groups - .25);
          const fold = Math.sin(group * 1.65 + side * .6);
          const endpoint = height * (-.32 + 1.48 * depth + .04 * Math.sin(depth * tau * 2));
          const bend = height * (.075 * fold + settling * .095 * Math.sin(group * .86 + side));
          ctx.beginPath();
          ctx.moveTo(centre + side * 2, horizon);
          ctx.bezierCurveTo(
            centre + span * .26, horizon + (depth - .45) * height * .16 + bend * .35,
            centre + span * .56, horizon + (endpoint - horizon) * .28 + bend,
            centre + span, endpoint
          );
          const brightEdge = strand === strands - 1;
          ctx.strokeStyle = brightEdge ? 'rgba(255,255,255,.78)' :
            group % 4 === 1 ? 'rgba(132,146,206,.25)' : 'rgba(109,162,221,.26)';
          ctx.lineWidth = brightEdge ? 2.4 : strand === 0 ? 1.6 : .8;
          ctx.stroke();
        }
      }
    }

    // The lower family bends through the same focal point, then opens towards the reader.
    const count = compact ? 88 : 170;
    for (let i = 0; i <= count; i++) {
      const u = i / count * 2 - 1;
      const fan = u + .052 * Math.sin(3 * Math.PI * u);
      const bend = Math.sin(u * 6.4 + .46) * (1 - .28 * Math.abs(u));
      ctx.beginPath();
      ctx.moveTo(centre + u * 4, horizon);
      ctx.bezierCurveTo(
        centre + width * (.19 * u + .052 * bend),
        horizon + height * (.042 + .051 * Math.cos(u * 4.5) + settling * .03),
        centre + width * (.36 * fan - .09 * bend + settling * .04),
        height * (1.025 + .13 * Math.sin(u * 6 + .4)),
        centre + width * .79 * fan, height * 1.07
      );
      ctx.lineWidth = i % 7 === 0 ? 2.5 : .9;
      ctx.strokeStyle = i % 7 === 0 ? 'rgba(255,255,255,.86)' :
        i % 13 < 6 ? 'rgba(110,142,211,.40)' : 'rgba(142,157,211,.32)';
      ctx.stroke();
    }

    // A soft horizon blends the two families where the paths meet.
    ctx.save();
    ctx.translate(centre, horizon);
    ctx.scale(width * .16, height * .11);
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    glow.addColorStop(0, 'rgba(248,252,255,.95)');
    glow.addColorStop(.4, 'rgba(248,252,255,.60)');
    glow.addColorStop(1, 'rgba(248,252,255,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(-1, -1, 2, 2);
    ctx.restore();
  }

  function tick(time) {
    frame = 0;
    if (lastPaint === 0 || time - lastPaint >= 32) {
      if (lastPaint) elapsed = Math.min(duration, elapsed + time - lastPaint);
      lastPaint = time;
      paint(elapsed / duration);
    }
    if (elapsed < duration) frame = requestAnimationFrame(tick);
  }

  function sync() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    lastPaint = 0;
    if (reducedMotion.matches) elapsed = duration;
    paint(elapsed / duration);
    if (visible && !document.hidden && elapsed < duration) frame = requestAnimationFrame(tick);
  }

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 1.75);
    width = bounds.width;
    height = bounds.height;
    canvas.width = Math.max(1, Math.round(width * ratio));
    canvas.height = Math.max(1, Math.round(height * ratio));
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    if (width && height) sync();
  }

  resize();
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas.parentElement);
  else window.addEventListener('resize', resize);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    }).observe(canvas);
  } else {
    elapsed = duration;
    sync();
  }
  reducedMotion.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
})();
