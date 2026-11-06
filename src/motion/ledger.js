import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Practice ledger: ink floods up from the rule on hover; click opens the row's detail.
export function initLedger({ reduceMotion }) {
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  document.querySelectorAll('.ledger__item').forEach((item) => {
    const row = item.querySelector('.ledger__row');
    const flood = item.querySelector('.ledger__flood');
    const body = item.querySelector('.ledger__body');
    const entries = item.querySelectorAll('.ledger__lede, .ledger__list li');

    body.inert = true;

    if (canHover && !reduceMotion) {
      // Colour change is a CSS transition on .is-hot (GSAP can't tween oklch tokens).
      const hover = gsap.timeline({ paused: true }).to(flood, { scaleY: 1, duration: 0.6, ease: 'expo.inOut' });

      row.addEventListener('mouseenter', () => {
        row.classList.add('is-hot');
        hover.timeScale(1).play();
      });
      row.addEventListener('mouseleave', () => {
        row.classList.remove('is-hot');
        hover.timeScale(1.6).reverse();
      });
    }

    row.addEventListener('click', () => {
      const opening = row.getAttribute('aria-expanded') !== 'true';
      row.setAttribute('aria-expanded', String(opening));
      row.dataset.cursorLabel = opening ? 'Close' : 'Open';
      body.inert = !opening;

      if (reduceMotion) {
        gsap.set(body, { height: opening ? 'auto' : 0 });
        ScrollTrigger.refresh();
        return;
      }

      gsap.to(body, {
        height: opening ? 'auto' : 0,
        duration: opening ? 0.7 : 0.45,
        ease: 'expo.inOut',
        overwrite: true,
        onComplete: () => ScrollTrigger.refresh(),
      });

      if (opening) {
        gsap.fromTo(
          entries,
          { y: '0.8em', opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out', stagger: 0.04, delay: 0.2, overwrite: true },
        );
      }
    });
  });
}
