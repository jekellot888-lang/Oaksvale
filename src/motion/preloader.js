import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';

const SESSION_KEY = 'osa-intro';

// Resolves when the hero intro should start: slightly before the curtain finishes lifting.
export function playPreloader() {
  const root = document.querySelector('[data-preloader]');
  if (!root || document.documentElement.classList.contains('seen')) {
    root?.remove();
    return Promise.resolve();
  }

  try {
    sessionStorage.setItem(SESSION_KEY, '1');
  } catch {
    /* private mode: the intro simply plays again next visit */
  }

  const word = root.querySelector('[data-preloader-word]');
  const rule = root.querySelector('[data-preloader-rule]');
  const sub = root.querySelector('[data-preloader-sub]');
  const split = new SplitText(word, { type: 'chars', mask: 'chars' });

  return new Promise((resolve) => {
    gsap
      .timeline({ onComplete: () => root.remove() })
      .from(split.chars, { yPercent: 110, duration: 0.9, ease: 'expo.out', stagger: 0.03 })
      .from(rule, { scaleX: 0, duration: 0.9, ease: 'expo.inOut' }, 0.15)
      .from(sub, { opacity: 0, duration: 0.5, ease: 'power2.out' }, 0.45)
      .to([word, rule, sub], { opacity: 0, duration: 0.3, ease: 'power2.in' }, 1.15)
      .to(root, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.9, ease: 'expo.inOut' }, 1.25)
      .call(resolve, null, 1.55);
  });
}
