import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Several things can put the header over a dark surface (hero panel, night sections, open nav).
// The header is "night" while any of them is active.
const sources = new Set();

export function setHeaderNight(source, isNight) {
  if (isNight) sources.add(source);
  else sources.delete(source);
  document.documentElement.dataset.headerTheme = sources.size ? 'night' : 'paper';
}

export function initHeaderTheme() {
  // Step out of the way while reading down; come back on any upward scroll.
  const header = document.querySelector('[data-header]');
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      const navOpen = document.querySelector('[data-nav-toggle]')?.getAttribute('aria-expanded') === 'true';
      header.classList.toggle('is-tucked', !navOpen && self.direction === 1 && self.scroll() > window.innerHeight * 0.4);
    },
  });

  document.querySelectorAll('[data-theme="night"]').forEach((section, i) => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 40px',
      end: 'bottom 40px',
      onToggle: (self) => setHeaderNight(`section-${i}`, self.isActive),
    });
  });
}
