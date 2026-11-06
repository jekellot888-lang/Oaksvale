import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { setHeaderNight } from './header-theme.js';

// The navy panel covers the whole stage and is clipped to an arch measured from .hero__window.
// Intro: the arch rises from its sill. Scroll: the arch opens to full bleed and the words part.
export function initHero({ onSettled, reduceMotion = false }) {
  const hero = document.querySelector('[data-hero]');
  const stage = hero.querySelector('.hero__stage');
  const win = hero.querySelector('[data-hero-window]');
  const panel = hero.querySelector('[data-hero-panel]');
  const scales = hero.querySelector('[data-hero-scales]');
  const copy = hero.querySelector('[data-hero-copy]');
  const foot = hero.querySelector('[data-hero-foot]');
  const [wordTop, wordBottom] = hero.querySelectorAll('[data-hero-word]');

  const measure = () => {
    const s = stage.getBoundingClientRect();
    const w = win.getBoundingClientRect();
    const top = w.top - s.top;
    const left = w.left - s.left;
    return {
      top,
      left,
      right: s.width - (left + w.width),
      bottom: s.height - (top + w.height),
      height: w.height,
      radius: w.width / 2,
    };
  };

  const archClip = () => {
    const m = measure();
    return `inset(${m.top}px ${m.right}px ${m.bottom}px ${m.left}px round ${m.radius}px ${m.radius}px 0px 0px)`;
  };

  const sillClip = () => {
    const m = measure();
    return `inset(${m.top + m.height}px ${m.right}px ${m.bottom}px ${m.left}px round ${m.radius}px ${m.radius}px 0px 0px)`;
  };

  const fullClip = 'inset(0px 0px 0px 0px round 0px 0px 0px 0px)';

  const placeScales = () => {
    const m = measure();
    scales.style.setProperty('--scales-y', `${m.top + m.height * 0.58}px`);
  };
  placeScales();
  ScrollTrigger.addEventListener('refreshInit', placeScales);

  gsap.set(scales, { xPercent: -50, yPercent: -50, x: 0, y: 0 });

  if (reduceMotion) {
    const settle = () => gsap.set(panel, { clipPath: archClip() });
    settle();
    window.addEventListener('resize', settle);
    return { intro: null };
  }

  gsap.set(copy, { y: 24 });

  const split = new SplitText([wordTop, wordBottom], { type: 'chars', mask: 'chars' });
  const strokes = scales.querySelectorAll('path');

  const intro = gsap
    .timeline({ paused: true })
    .from(split.chars, { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: 0.03 })
    .fromTo(panel, { clipPath: sillClip }, { clipPath: archClip, duration: 1.2, ease: 'expo.inOut' }, 0.1)
    .from(strokes, { drawSVG: '50% 50%', duration: 1.3, ease: 'power2.inOut', stagger: 0.05 }, 0.55)
    .from(foot, { opacity: 0, y: 12, duration: 0.8, ease: 'power3.out' }, 0.8)
    .call(() => {
      createScrollScene();
      onSettled?.();
    }, null, 1.3);

  function createScrollScene() {
    gsap
      .timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          invalidateOnRefresh: true,
        },
      })
      .fromTo(panel, { clipPath: archClip }, { clipPath: fullClip, duration: 1 }, 0)
      .to(wordTop, { yPercent: -70, opacity: 0, duration: 0.55 }, 0)
      .to(wordBottom, { yPercent: 70, opacity: 0, duration: 0.55 }, 0)
      .to(foot, { opacity: 0, duration: 0.25 }, 0)
      .to(scales, { scale: 2.4, opacity: 0.1, duration: 0.8 }, 0.15)
      .to(copy, { opacity: 1, y: 0, duration: 0.35 }, 0.7)
      .to({}, { duration: 0.35 });

    ScrollTrigger.create({
      trigger: hero,
      start: () => `top+=${hero.offsetHeight * 0.28} top`,
      end: 'bottom 40px',
      onToggle: (self) => setHeaderNight('hero', self.isActive),
    });
  }

  return { intro };
}
