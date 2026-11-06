import '@fontsource/instrument-serif/400.css';
import '@fontsource-variable/hanken-grotesk/index.css';
import './styles/tokens.css';
import './styles/main.css';
import './styles/practice.css';
import './styles/contact.css';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';

import { initSmoothScroll } from './motion/smooth-scroll.js';
import { playPreloader } from './motion/preloader.js';
import { initHero } from './motion/hero.js';
import { initSubpage } from './motion/subpage.js';
import { initTransitions, liftCurtain } from './motion/transitions.js';
import { initNav } from './motion/nav.js';
import { initLedger } from './motion/ledger.js';
import { initReveals } from './motion/reveals.js';
import { initCursor } from './motion/cursor.js';
import { initCharRoll } from './motion/char-roll.js';
import { initFitText } from './motion/fit-text.js';
import { initHeaderTheme } from './motion/header-theme.js';
import { initContactForm } from './forms/contact-form.js';

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasHero = Boolean(document.querySelector('[data-hero]'));

document.querySelectorAll('[data-year]').forEach((el) => {
  el.textContent = String(new Date().getFullYear());
});

initCharRoll();
initFitText();

const lenis = reduceMotion ? null : initSmoothScroll();

initTransitions({ reduceMotion });
initHeaderTheme();
initNav({ lenis, reduceMotion });
initLedger({ reduceMotion });
initCursor({ reduceMotion });
initContactForm({ lenis, reduceMotion });

document.fonts.ready.then(async () => {
  if (reduceMotion) {
    if (hasHero) initHero({ reduceMotion });
    return;
  }

  if (hasHero) lenis?.stop();
  const hero = hasHero ? initHero({ onSettled: () => lenis?.start() }) : null;
  const subpage = initSubpage();
  initReveals();

  await liftCurtain();
  await playPreloader();
  hero?.intro.play();
  subpage?.intro.play();
});
