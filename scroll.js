(() => {
  'use strict';
  const html = document.documentElement;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const header = document.querySelector('.header');
  const chapters = [...document.querySelectorAll('#rdti, #approach, .closing')];
  const budgetStage = document.querySelector('#rdti .panel-stage');
  const delivery = document.querySelector('#approach');
  if (!delivery || !budgetStage) return;
  const intro = delivery.querySelector('.delivery-intro');
  const steps = [...delivery.querySelectorAll('.delivery-step')];
  let pending = false;

  function clamp(value) {
    return Math.max(0, Math.min(1, value));
  }

  function setValue(element, property, value, unit = '') {
    const text = value.toFixed(unit === 'px' ? 1 : 3) + unit;
    if (element.style.getPropertyValue(property) !== text) element.style.setProperty(property, text);
  }

  function draw() {
    pending = false;
    if (preference.matches) return;
    const height = html.clientHeight;
    if (!height) return;
    const scroll = window.scrollY;
    const maxScroll = html.scrollHeight - height;
    const navHeight = header.offsetHeight;
    const compact = html.clientWidth <= 760 || height <= 560;
    const chapterTops = chapters.map(el => el.getBoundingClientRect().top);
    const budgetTop = budgetStage.getBoundingClientRect().top;
    const cardTops = steps.map(el => el.getBoundingClientRect().top);
    const cardHeights = steps.map(el => el.offsetHeight);
    const introHeight = intro.offsetHeight;

    // Finish even short chapters when the reader reaches the end of the document.
    function arrival(top, finishAt) {
      const start = scroll + top - height;
      const finish = Math.min(maxScroll, scroll + top - height * finishAt);
      return finish > start ? 1 - clamp((scroll - start) / (finish - start)) : 0;
    }

    chapters.forEach((el, i) => setValue(el, '--arrival', arrival(chapterTops[i], .29)));
    setValue(budgetStage, '--entry', arrival(budgetTop, .29));

    const peek = compact ? 12 : 20;
    const deckFits = Math.max(...cardHeights) + navHeight + 12 + peek * (steps.length - 1) < height;
    delivery.classList.toggle('deck-enabled', deckFits);
    setValue(delivery, '--intro-pin', Math.min(navHeight + 12, height - introHeight - 12), 'px');
    steps.forEach((step, i) => {
      setValue(step, '--step-entry', arrival(cardTops[i], .55));
      const next = cardTops[i + 1];
      const overlap = next === undefined ? 0 : cardTops[i] + cardHeights[i] - next;
      setValue(step, '--covered', deckFits ? clamp(overlap / Math.max(cardHeights[i] - peek, 1)) : 0);
    });
  }

  function schedule() {
    if (pending || preference.matches) return;
    pending = true;
    requestAnimationFrame(draw);
  }

  function applyPreference() {
    html.classList.toggle('scroll-sequence', !preference.matches);
    if (preference.matches) html.classList.remove('hero-headline-in');
    draw();
  }

  preference.addEventListener('change', applyPreference);
  window.addEventListener('scroll', schedule, {passive: true});
  window.addEventListener('resize', schedule);
  window.addEventListener('pageshow', schedule);
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(schedule);
    [document.body, ...chapters, budgetStage, ...steps].forEach(el => observer.observe(el));
  }
  applyPreference();

  if (!preference.matches && !location.hash && window.scrollY < 5) {
    html.classList.add('hero-headline-in');
    window.setTimeout(() => html.classList.remove('hero-headline-in'), 650);
  }
})();
