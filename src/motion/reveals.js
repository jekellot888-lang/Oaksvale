import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

export function initReveals() {
  // Headings: lines rise out of a mask, once.
  document.querySelectorAll('[data-reveal]').forEach((el) => {
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.lines, {
          yPercent: 110,
          duration: 1.2,
          ease: 'expo.out',
          stagger: 0.08,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        }),
    });
  });

  // Statements: words light up as they are read.
  document.querySelectorAll('[data-lit]').forEach((el) => {
    const split = new SplitText(el, { type: 'words' });
    gsap.fromTo(
      split.words,
      { opacity: 0.16 },
      {
        opacity: 1,
        ease: 'none',
        stagger: 0.1,
        scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 55%', scrub: true },
      },
    );
  });

  // Lists and cards: rise in small batches as they enter.
  const staggered = gsap.utils.toArray('[data-stagger]');
  gsap.set(staggered, { opacity: 0, y: 24 });
  ScrollTrigger.batch(staggered, {
    start: 'top 90%',
    once: true,
    onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.07 }),
  });

  // Gentle scrubbed parallax.
  document.querySelectorAll('[data-parallax]').forEach((el) => {
    const speed = parseFloat(el.dataset.speed || '10');
    gsap.fromTo(
      el,
      { yPercent: -speed },
      {
        yPercent: speed,
        ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1 },
      },
    );
  });

  // Uganda–Kenya line draws as the section passes.
  const line = document.querySelector('[data-region-line]');
  if (line) {
    gsap
      .timeline({ scrollTrigger: { trigger: line, start: 'top 85%', end: 'bottom 45%', scrub: 1 } })
      .from(line.querySelectorAll('.region__node'), { scale: 0.4, opacity: 0, transformOrigin: '50% 50%', stagger: 0.6, duration: 0.3 }, 0)
      .from(line.querySelector('.region__path'), { drawSVG: 0, duration: 1, ease: 'none' }, 0.1)
      .from(line.querySelectorAll('text'), { opacity: 0, stagger: 0.6, duration: 0.3 }, 0.1);
  }
}
