import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Lenis drives the scroll; GSAP's ticker drives Lenis so ScrollTrigger and smooth scroll share one frame.
export function initSmoothScroll() {
  const lenis = new Lenis({ lerp: 0.1, anchors: true });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  return lenis;
}
