import { useLayoutEffect } from "react";
import gsap from "gsap";

// One entrance, triggered by the existing intro-completion state. No changes to
// the overlay's sequence or exit: the real page emerges beneath its final wipe.
export function useWebsiteReveal(content, enabled) {
  useLayoutEffect(() => {
    if (!enabled || !content.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const media = gsap.matchMedia();
    let started = false;
    media.add("(prefers-reduced-motion: no-preference)", () => {
      if (started) return;
      started = true;
      const host = content.current;
      const header = host.querySelector(".hero-layer .site-header");
      const card = host.querySelector(".hero-profile-card");
      if (!header || !card) return;
      const avatar = card.querySelector(".profile-avatar");
      const status = card.querySelectorAll(".availability-pill, .hero-split-flap");
      const heading = card.querySelector("h1");
      const description = card.querySelector(":scope > p");
      const actions = card.querySelector(".hero-actions");
      const buttons = actions?.querySelectorAll("a");
      const collaborators = host.querySelector(".collaborator-scroller");
      const clearProps = "opacity,visibility,transform,clipPath";
      const tl = gsap.timeline({ defaults: { ease: "power4.out", clearProps } });

      tl.addLabel("surface", 0)
        .addLabel("identity", .16)
        .addLabel("type", .28)
        .addLabel("navigation", .55)
        .addLabel("actions", .5);

      tl.fromTo(card, { autoAlpha: 0, y: 22, scale: .985 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 1 }, "surface");
      if (avatar) tl.fromTo(avatar, { autoAlpha: 0, y: 12, scale: .94 },
        { autoAlpha: 1, y: 0, scale: 1, duration: .85 }, "identity");
      if (status.length) tl.fromTo(status, { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, stagger: .055, duration: .7 }, "identity+=0.08");
      if (heading) tl.fromTo(heading, { autoAlpha: 0, y: 22, clipPath: "inset(0% 0% 100% 0%)" },
        { autoAlpha: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)", duration: .85 }, "type");
      if (description) tl.fromTo(description, { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: .75 }, "type+=0.12");
      if (actions) tl.set(actions, { autoAlpha: 1, clearProps: "opacity,visibility" }, 0);
      if (buttons?.length) tl.fromTo(buttons, { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: .7, stagger: .075 }, "actions");
      tl.fromTo(header, { autoAlpha: 0, y: -12 },
        { autoAlpha: 1, y: 0, duration: .7 }, "navigation");
      if (collaborators) tl.fromTo(collaborators, { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, duration: .7 }, "actions+=0.05");
    }, content);
    // Reverting also makes the page immediately visible if reduced motion is
    // enabled mid-entrance, and releases all tweens/listeners on route changes.
    return () => media.revert();
  }, [content, enabled]);
}
