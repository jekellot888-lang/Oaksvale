import { gsap } from 'gsap';
import { setHeaderNight } from './header-theme.js';

export function initNav({ lenis, reduceMotion }) {
  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');
  if (!toggle || !nav) return;

  const links = nav.querySelectorAll('[data-nav-link]');
  const aside = nav.querySelector('[data-nav-aside]');
  let isOpen = false;
  let tween;

  function open() {
    isOpen = true;
    nav.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    setHeaderNight('nav', true);
    lenis?.stop();
    tween?.kill();

    if (reduceMotion) {
      links[0]?.focus();
      return;
    }

    tween = gsap
      .timeline()
      .fromTo(nav, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'expo.inOut' })
      .fromTo(links, { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.05 }, 0.3)
      .fromTo(aside, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0.55)
      .call(() => links[0]?.focus(), null, 0.35);
  }

  function close({ restoreFocus = true } = {}) {
    if (!isOpen) return Promise.resolve();
    isOpen = false;
    toggle.setAttribute('aria-expanded', 'false');
    tween?.kill();

    const finish = () => {
      nav.hidden = true;
      setHeaderNight('nav', false);
      lenis?.start();
      if (restoreFocus) toggle.focus();
    };

    if (reduceMotion) {
      finish();
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      tween = gsap.to(nav, {
        clipPath: 'inset(0% 0% 100% 0%)',
        duration: 0.6,
        ease: 'expo.inOut',
        onComplete: () => {
          finish();
          resolve();
        },
      });
    });
  }

  toggle.addEventListener('click', () => (isOpen ? close() : open()));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) close();
  });

  links.forEach((link) => {
    link.addEventListener('click', async (e) => {
      // On sub-pages links point at "/#section"; the page transition handles those.
      if (!link.getAttribute('href').startsWith('#')) return;
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      await close({ restoreFocus: false });
      if (!target) return;
      if (lenis) lenis.scrollTo(target, { duration: 1.4 });
      else target.scrollIntoView();
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });
}
