import { gsap } from 'gsap';

// A brass dot trails the pointer and opens into a label over [data-cursor-label] targets.
export function initCursor({ reduceMotion }) {
  const cursor = document.querySelector('[data-cursor]');
  const text = cursor?.querySelector('[data-cursor-text]');
  if (!cursor || reduceMotion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  document.documentElement.classList.add('has-cursor');
  gsap.set(cursor, { opacity: 0 });

  const xTo = gsap.quickTo(cursor, 'x', { duration: 0.45, ease: 'power3.out' });
  const yTo = gsap.quickTo(cursor, 'y', { duration: 0.45, ease: 'power3.out' });
  let lastX = 0;
  let lastY = 0;
  let shown = false;

  function update() {
    const target = document.elementFromPoint(lastX, lastY)?.closest('[data-cursor-label]');
    cursor.dataset.state = target ? 'active' : '';
    if (target) text.textContent = target.dataset.cursorLabel;
  }

  window.addEventListener(
    'pointermove',
    (e) => {
      lastX = e.clientX;
      lastY = e.clientY;
      xTo(lastX);
      yTo(lastY);
      if (!shown) {
        shown = true;
        gsap.set(cursor, { x: lastX, y: lastY });
        gsap.to(cursor, { opacity: 1, duration: 0.3 });
      }
      update();
    },
    { passive: true },
  );

  // Content moves under a still pointer while scrolling, so re-check the target.
  window.addEventListener('scroll', () => shown && requestAnimationFrame(update), { passive: true });
  document.documentElement.addEventListener('pointerleave', () => {
    shown = false;
    gsap.to(cursor, { opacity: 0, duration: 0.2 });
  });
}
