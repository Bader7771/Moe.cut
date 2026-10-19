import { useLayoutEffect } from "react";
import gsap from "gsap";
import { finishProjectMotion, motionProps, projectEase } from "./projectMotion";

function observeReveals(scope, selector, delay = 0) {
  if (!scope || !window.IntersectionObserver || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
  const media = gsap.matchMedia();
  let started = false;
  media.add("(prefers-reduced-motion: no-preference)", context => {
    if (started) return;
    started = true;
    const nodes = [...scope.querySelectorAll(selector)];
    if (!nodes.length) return;
    const revealed = new WeakSet();
    let remaining = nodes.length;
    const parts = node => [node, ...node.querySelectorAll('.project-image-reveal, .project-number, .project-card-copy > *, h2, p')];
    nodes.forEach(node => {
      if (node.matches('.projects-heading')) {
        gsap.set(node.querySelector('p'), { opacity: 0, y: 8 });
        gsap.set(node.querySelector('h2'), { opacity: 0, y: 22, clipPath: 'inset(0% 0% 100% 0%)' });
      } else {
        const narrow = window.matchMedia('(max-width: 600px)').matches;
        const mask = narrow ? 'inset(100% 0% 0% 0% round 8px)' : node.dataset.side === 'right'
          ? 'inset(0% 100% 0% 0% round 8px)' : 'inset(0% 0% 0% 100% round 8px)';
        gsap.set(node, { opacity: 0, y: 20 });
        gsap.set(node.querySelector('.project-image-reveal'), { clipPath: mask, scale: 1.06, transformOrigin: '50% 60%' });
        gsap.set(node.querySelector('.project-number'), { opacity: 0, y: -6 });
        gsap.set(node.querySelectorAll('.project-card-copy > *'), { opacity: 0, y: 12 });
      }
    });

    const reveal = (node, stagger, immediate = false) => {
      if (revealed.has(node)) {
        if (immediate) context.add(() => {
          finishProjectMotion(parts(node));
        });
        return;
      }
      revealed.add(node);
      observer.unobserve(node);
      context.add(() => {
        if (immediate) { finishProjectMotion(parts(node)); return; }
        const tl = gsap.timeline({ delay: delay + stagger, defaults: { ease: projectEase, clearProps: motionProps } });
        if (node.matches('.projects-heading')) {
          tl.to(node.querySelector('p'), { opacity: 1, y: 0, duration: .5 }, 0)
            .to(node.querySelector('h2'), { opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0%)', duration: .9 }, .08);
        } else {
          tl.to(node, { opacity: 1, y: 0, duration: .8 }, 0)
            .to(node.querySelector('.project-image-reveal'), { clipPath: 'inset(0% 0% 0% 0% round 8px)', scale: 1, duration: 1.05 }, .06)
            .to(node.querySelector('.project-number'), { opacity: 1, y: 0, duration: .45 }, .16)
            .to(node.querySelectorAll('.project-card-copy > *'), { opacity: 1, y: 0, stagger: .065, duration: .62 }, .3);
        }
      });
      if (--remaining === 0) {
        observer.disconnect();
      }
    };
    const observer = new IntersectionObserver(entries => {
      entries.filter(entry => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left)
        .forEach((entry, index) => reveal(entry.target, Math.min(index * .08, .16)));
    }, { threshold: .08, rootMargin: "0px 0px -24px 0px" });
    // Keep offscreen buttons in the tab order. Keyboard navigation reveals a
    // focused card immediately rather than making the user wait for its fade.
    const onFocus = event => {
      const node = event.target.closest(selector);
      if (node && nodes.includes(node)) reveal(node, 0, true);
    };
    scope.addEventListener("focusin", onFocus);
    nodes.forEach(node => observer.observe(node));
    return () => {
      observer.disconnect();
      scope.removeEventListener("focusin", onFocus);
    };
  }, scope);
  return () => media.revert();
}

export function useProjectsReveal(section, projects) {
  useLayoutEffect(() => observeReveals(section.current, ".projects-heading"), [section]);
  useLayoutEffect(() => observeReveals(section.current, ".project-grid-item", .08), [section, projects]);
}
