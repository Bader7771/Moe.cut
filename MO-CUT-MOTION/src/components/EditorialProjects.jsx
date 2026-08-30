import { useEffect, useRef } from "react";
import { transitionEditorialTracks } from "../data/transitionEditorial";

const clamp = (value) => Math.max(0, Math.min(1, value));
const trackNames = ["one", "two", "three"];

export default function EditorialProjects() {
  const wrapper = useRef(null);
  const stage = useRef(null);

  useEffect(() => {
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    const update = () => {
      frame = 0;
      const section = wrapper.current;
      const page = stage.current;
      if (!section || !page) return;
      const rect = section.getBoundingClientRect();
      const progress = clamp((innerHeight - rect.top) / (innerHeight + rect.height));
      const eased = progress * progress * (3 - 2 * progress);
      const offsets = innerWidth <= 700 ? [16, -20, 14] : [22, -28, 20];

      offsets.forEach((distance, index) => {
        page.style.setProperty(`--track-${index + 1}-x`, `${reducedMotion ? 0 : distance * (1 - eased * 2)}vw`);
        page.style.setProperty(`--track-${index + 1}-y`, "0px");
        page.style.setProperty(`--track-${index + 1}-o`, "1");
        page.style.setProperty(`--track-${index + 1}-clip`, "0%");
      });
      page.querySelectorAll(".inline-editorial-media").forEach((media, index) => {
        const reveal = reducedMotion ? 1 : clamp((progress - index * 0.015) / 0.3);
        media.style.setProperty("--inline-reveal", reveal);
        media.style.setProperty("--inline-clip", `${(1 - reveal) * 100}%`);
        media.style.setProperty("--inline-scale", 0.92 + reveal * 0.08);
        media.style.setProperty("--inline-drift", `${reducedMotion ? 0 : (eased - 0.5) * (index % 2 ? -14 : 14)}px`);
      });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    update();
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <section ref={wrapper} className="editorial-scroll marquee-only" aria-label="MO-CUT-MOTION disciplines">
      <div ref={stage} className="editorial marquee-only-stage">
        <div className="editorial-type-stage" aria-hidden="true">
          {transitionEditorialTracks.slice(0, 3).map((track, trackIndex) => (
            <div className={`editorial-track track-${trackIndex + 1} track-${trackNames[trackIndex]}`} key={trackIndex}>
              <div className="type-track-inner">
                {track.map((item, itemIndex) => item.type === "text" ? (
                  <span key={`${item.value}-${itemIndex}`}>{item.value}</span>
                ) : (
                  <span className={`inline-editorial-media${item.mobile ? "" : " mobile-hide"}`} key={item.id} style={{ "--inline-ratio": item.ratio, "--inline-position": item.position, "--inline-height": `${item.displayHeight}em` }}>
                    <img src={item.src} alt={item.alt} loading="lazy" width={item.width} height={item.height} />
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
