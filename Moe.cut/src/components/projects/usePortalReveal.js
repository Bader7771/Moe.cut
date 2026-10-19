import { useLayoutEffect } from "react";
import gsap from "gsap";
import { finishProjectMotion, motionProps, projectEase } from "./projectMotion";

export function usePortalReveal(dialog) {
  useLayoutEffect(() => {
    const root = dialog.current?.closest('.project-portal');
    if (!root || !window.IntersectionObserver || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const media = gsap.matchMedia();
    let started = false;
    media.add('(prefers-reduced-motion: no-preference)', context => {
      if (started) return;
      started = true;
      const heading = root.querySelector('.project-portal-header h2');
      const metadata = root.querySelectorAll('.project-portal-metadata > div');
      const image = root.querySelector('.project-portal-media');
      const tl = gsap.timeline({ defaults: { ease: projectEase, clearProps: motionProps } });
      tl.fromTo(heading, { opacity: 0, y: 18, clipPath: 'inset(0% 0% 100% 0%)' },
        { opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0%)', duration: .7 }, .04);
      if (metadata.length) tl.fromTo(metadata, { opacity: 0, y: 8 }, { opacity: 1, y: 0, stagger: .045, duration: .55 }, .16);
      tl.fromTo(image, { opacity: 0, y: 18, clipPath: 'inset(8% 0% 0% 0% round 12px)' },
        { opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0% round 12px)', duration: .85 }, .12);

      const nodes = [...root.querySelectorAll('.project-portal-about, .project-portal-actions, .project-portal-wordmark')];
      const shown = new WeakSet();
      // Observe the footer, since a fully clipped wordmark has no visible
      // intersection until its reveal begins.
      const targets = new Map(nodes.map(node => [node.matches('.project-portal-wordmark') ? node.parentElement : node, node]));
      const trigger = node => node.matches('.project-portal-wordmark') ? node.parentElement : node;
      nodes.forEach(node => gsap.set(node, node.matches('.project-portal-wordmark')
        ? { opacity: 0, y: 28, clipPath: 'inset(0% 0% 100% 0%)' } : { opacity: 0, y: 12 }));
      const reveal = (node, immediate = false) => context.add(() => {
        if (immediate) { shown.add(node); observer.unobserve(trigger(node)); finishProjectMotion([node]); return; }
        if (shown.has(node)) return;
        shown.add(node);
        observer.unobserve(trigger(node));
        gsap.to(node, { opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0%)', duration: node.matches('.project-portal-wordmark') ? 1 : .65, ease: projectEase, clearProps: motionProps });
      });
      const observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) reveal(targets.get(entry.target));
      }), { root, threshold: .08 });
      targets.forEach((node, target) => observer.observe(target));
      const onFocus = event => {
        const node = event.target.closest('.project-portal-actions');
        if (node) reveal(node, true);
      };
      root.addEventListener('focusin', onFocus);
      return () => { observer.disconnect(); root.removeEventListener('focusin', onFocus); };
    }, root);
    return () => media.revert();
  }, [dialog]);
}
