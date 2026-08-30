import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { transitionEditorialTracks } from "../data/transitionEditorial";
import "./EditorialTypeStage.css";

gsap.registerPlugin(ScrollTrigger);

function EditorialRow({ items, rowIndex, setRef }) {
  return (
    <div
      ref={setRef}
      className={`editorial-type-row kinetic-type-row kinetic-row-${rowIndex + 1} ${rowIndex % 2 === 0 ? "row-left" : "row-right"}`}
      aria-hidden="true"
    >
      {[...items, ...items].map((item, itemIndex) =>
        item.type === "image" ? (
          <span
            className="inline-editorial-img kinetic-inline-media"
            style={{ "--media-ratio": item.ratio }}
            key={`${item.id}-${itemIndex}`}
          >
            <img
              src={item.src}
              alt=""
              width={item.width}
              height={item.height}
              loading={item.eager ? "eager" : "lazy"}
              style={{ objectPosition: item.position }}
            />
          </span>
        ) : (
          <span className="editorial-text kinetic-editorial-text" key={`${item.value}-${itemIndex}`}>
            {item.value}
          </span>
        ),
      )}
    </div>
  );
}

export default function EditorialTypeStage() {
  const containerRef = useRef(null);
  const rowsRef = useRef([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const ctx = gsap.context(() => {
      const rows = rowsRef.current.filter(Boolean);
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "+=130%",
          scrub: 1,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      const distances = [-30, 25, -25, 30];
      rows.forEach((row, index) => {
        timeline.to(
          row,
          {
            xPercent: distances[index],
            ease: "none",
          },
          0,
        );
      });

      return () => timeline.scrollTrigger?.kill();
    }, container);

    // Recalculate the generated pin-spacer after every page layer mounts.
    ScrollTrigger.refresh();

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="editorial-type-stage kinetic-editorial-stage"
      aria-labelledby="kinetic-stage-title"
    >
      <h2 id="kinetic-stage-title" className="kinetic-stage-title">
        Moving-image disciplines
      </h2>
      <div className="kinetic-stage-meta" aria-hidden="true">
        <span>MO/CUT — MOTION PRACTICE</span>
        <span>SCROLL TO ADVANCE</span>
      </div>
      <div className="editorial-stage-viewport kinetic-stage-viewport">
        {transitionEditorialTracks.map((items, rowIndex) => (
          <EditorialRow
            items={items}
            rowIndex={rowIndex}
            setRef={(node) => {
              rowsRef.current[rowIndex] = node;
            }}
            key={`editorial-row-${rowIndex + 1}`}
          />
        ))}
      </div>
      <div className="kinetic-stage-footer" aria-hidden="true">
        <span>ART DIRECTION / EDITING / SOUND</span>
        <span>01—04</span>
      </div>
    </section>
  );
}
