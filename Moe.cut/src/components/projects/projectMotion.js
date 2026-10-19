import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(CustomEase);

export const projectEase = CustomEase.create("projectEditorial", "0.22, 0.82, 0.18, 1");
export const motionProps = "opacity,transform,transformOrigin,clipPath";

// Focus and reduced-motion paths always restore the CSS design immediately.
export function finishProjectMotion(targets) {
  gsap.killTweensOf(targets);
  gsap.set(targets, { clearProps: motionProps });
}
