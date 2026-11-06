import { gsap } from 'gsap';

const KEY = 'osa-curtain';
const covered = 'inset(0% 0% 0% 0%)';

// Page-to-page: a night curtain rises over the page, the browser navigates, and the next page
// lifts it away. The head script adds .curtain-in so the new page paints already covered.
export function initTransitions({ reduceMotion }) {
  const curtain = document.querySelector('[data-curtain]');
  if (!curtain || reduceMotion) return;

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (link.target && link.target !== '_self') return;

    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || !/^https?:$/.test(url.protocol)) return;
    if (url.pathname === location.pathname) return; // same-page anchors stay with Lenis

    e.preventDefault();
    try {
      sessionStorage.setItem(KEY, '1');
    } catch {
      /* no storage: the next page simply appears without the lift */
    }
    gsap.fromTo(
      curtain,
      { clipPath: 'inset(100% 0% 0% 0%)' },
      { clipPath: covered, duration: 0.6, ease: 'expo.inOut', onComplete: () => location.assign(url.href) },
    );
  });

  // Back/forward cache restores the covered page; uncover it.
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) gsap.set(curtain, { clipPath: 'inset(0% 0% 100% 0%)' });
  });
}

// Resolves once the incoming page is visible enough for its intro to start.
export function liftCurtain() {
  const root = document.documentElement;
  const curtain = document.querySelector('[data-curtain]');
  if (!curtain || !root.classList.contains('curtain-in')) return Promise.resolve();

  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }

  return new Promise((resolve) => {
    gsap
      .timeline({ onComplete: () => root.classList.remove('curtain-in') })
      .fromTo(curtain, { clipPath: covered }, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.8, ease: 'expo.inOut' })
      .call(resolve, null, 0.35);
  });
}
