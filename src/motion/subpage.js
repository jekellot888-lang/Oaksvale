import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

// Practice and profile pages: the arch rises from its sill with the letter or initials inside
// (the homepage hero's motif at a smaller scale), the title lines lift, then each numbered rule
// draws in as it is reached.
export function initSubpage() {
  const page = document.querySelector('[data-subpage]');
  if (!page) return null;

  const arch = page.querySelector('[data-p-arch]');
  const letter = page.querySelector('[data-p-letter]');
  const portrait = page.querySelector('[data-p-portrait]');
  const title = page.querySelector('[data-p-title]');
  const meta = page.querySelector('[data-p-meta]');
  const intro = page.querySelector('[data-p-intro]');

  const split = new SplitText(title, { type: 'lines', mask: 'lines' });

  const tl = gsap
    .timeline({ paused: true })
    .fromTo(arch, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'expo.inOut' })
    .from(letter || portrait, letter
      ? { yPercent: 40, opacity: 0, duration: 1.1, ease: 'expo.out' }
      : { scale: 1.15, duration: 1.6, ease: 'expo.out' }, letter ? 0.5 : 0.2)
    .from(meta, { opacity: 0, duration: 0.6, ease: 'power2.out' }, 0.3)
    .from(split.lines, { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: 0.08 }, 0.35)
    .from(intro, { opacity: 0, y: 16, duration: 0.9, ease: 'expo.out' }, 0.6);

  // The letter drifts slower than the page. A portrait stays put.
  if (letter) gsap.to(letter, {
    yPercent: 18,
    ease: 'none',
    scrollTrigger: { trigger: arch, start: 'top top', end: 'bottom top', scrub: true },
  });

  page.querySelectorAll('[data-p-service]').forEach((item) => {
    const rule = item.querySelector('.p-services__rule');
    const text = item.querySelectorAll('.p-services__num, .p-services__text');
    gsap
      .timeline({ scrollTrigger: { trigger: item, start: 'top 92%', once: true } })
      .from(rule, { scaleX: 0, duration: 1, ease: 'expo.inOut' })
      .from(text, { yPercent: 60, opacity: 0, duration: 0.8, ease: 'expo.out', stagger: 0.05 }, 0.25);
  });

  ScrollTrigger.refresh();
  return { intro: tl };
}
