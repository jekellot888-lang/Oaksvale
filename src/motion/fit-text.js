// Sizes [data-fit] text so it spans its parent's content width exactly.
export function initFitText() {
  const els = document.querySelectorAll('[data-fit]');
  if (!els.length) return;

  const fit = () => {
    els.forEach((el) => {
      const parent = el.parentElement;
      const style = getComputedStyle(parent);
      const available = parent.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      el.style.fontSize = '100px';
      const width = el.getBoundingClientRect().width;
      if (width > 0) el.style.fontSize = `${(100 * available) / width}px`;
    });
  };

  let frame = 0;
  const schedule = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(fit);
  };

  const observer = new ResizeObserver(schedule);
  els.forEach((el) => observer.observe(el.parentElement));
  document.fonts.ready.then(fit);
}
