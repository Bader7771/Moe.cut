import { useLayoutEffect } from 'react';
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(CustomEase);
const ease = CustomEase.create('gameboyUnfold', '.2, .78, .18, 1');
const clearProps = 'opacity,transform,transformOrigin,clipPath';

export function useGameboyReveal(section, ready) {
  useLayoutEffect(() => {
    const root = section.current;
    if (!root || !ready || !window.IntersectionObserver) return undefined;
    const media = gsap.matchMedia();
    let started = false;
    media.add('(prefers-reduced-motion: no-preference)', context => {
      if (started) return;
      started = true;
      const heading = root.querySelector('.gameboy-section-heading');
      const title = heading.querySelector('h2');
      const caption = heading.querySelector('p');
      const choices = root.querySelector('.gameboy-top-pills');
      const device = root.querySelector('.gameboy-wrapper');
      const screen = root.querySelector('.screen-enclosure');
      const controls = root.querySelector('.console-controls');
      const targets = [title, caption, choices, device, screen, controls];
      const revealed = new Set();
      const finished = new Set();
      const timelines = [];

      gsap.set(title, { y: 24, opacity: 0, clipPath: 'inset(0% 0% 100% 0%)' });
      gsap.set([caption, choices], { y: 10, opacity: 0 });
      gsap.set(device, { y: 36, scale: .965, rotationX: 7, rotationY: -5, rotationZ: -1.1,
        transformPerspective: 1100, transformOrigin: '50% 35%', opacity: .55 });
      gsap.set(screen, { clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)' });
      gsap.set(controls, { opacity: .4, y: 8 });

      const reveal = target => context.add(() => {
        if (revealed.has(target)) return;
        revealed.add(target);
        observer.unobserve(target);
        const tl = gsap.timeline({ defaults: { ease, clearProps }, onComplete: () => {
          finished.add(target);
          if (finished.size === 2) { settled = true; removeInteraction(); }
        } });
        timelines.push(tl);
        if (target === heading) {
          tl.to(caption, { opacity: 1, y: 0, duration: .45 }, 0)
            .to(title, { opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0%)', duration: .85 }, .05)
            .to(choices, { opacity: 1, y: 0, duration: .6 }, .22);
        } else {
          tl.to(device, { y: 0, scale: 1, rotationX: 0, rotationY: 0, rotationZ: 0, opacity: 1, duration: 1.05 }, 0)
            .to(screen, { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', duration: .85 }, .08)
            .to(controls, { opacity: 1, y: 0, duration: .5 }, .42);
        }
      });
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => { if (entry.isIntersecting) reveal(entry.target); });
      }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });
      observer.observe(heading);
      observer.observe(device);

      // Freeze a pointer's hit area until its click is delivered. Keyboard
      // focus can settle immediately, before the user presses an action key.
      let settled = false;
      let pointerDown = false;
      let releaseFrame = 0;
      const removeInteraction = () => {
        root.removeEventListener('pointerdown', onPointerDown, true);
        root.removeEventListener('focusin', onFocus);
        root.removeEventListener('click', settle);
        window.removeEventListener('pointerup', onRelease);
        window.removeEventListener('pointercancel', onRelease);
        cancelAnimationFrame(releaseFrame);
      };
      const settle = () => {
        if (settled) return;
        settled = true;
        context.add(() => {
          observer.disconnect();
          revealed.add(heading);
          revealed.add(device);
          gsap.killTweensOf(targets);
          gsap.set(targets, { clearProps });
        });
        removeInteraction();
      };
      const onRelease = () => { releaseFrame = requestAnimationFrame(settle); };
      const onPointerDown = () => {
        pointerDown = true;
        timelines.forEach(timeline => timeline.pause());
        window.addEventListener('pointerup', onRelease, { once: true });
        window.addEventListener('pointercancel', onRelease, { once: true });
      };
      const onFocus = () => { if (!pointerDown) settle(); };
      root.addEventListener('pointerdown', onPointerDown, true);
      root.addEventListener('focusin', onFocus);
      root.addEventListener('click', settle);
      return () => {
        observer.disconnect();
        removeInteraction();
      };
    }, root);
    return () => media.revert();
  }, [section, ready]);
}
