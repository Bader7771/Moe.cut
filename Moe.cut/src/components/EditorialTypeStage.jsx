import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { transitionEditorialTracks } from "../data/transitionEditorial";
import "./EditorialTypeStage.css";

gsap.registerPlugin(ScrollTrigger);

function EditorialRow({ items, rowIndex, setRef }) {
  return (
    <div
      ref={setRef}
      className={`editorial-type-row kinetic-type-row kinetic-row-${rowIndex + 1} ${
        rowIndex % 2 === 0 ? "row-left" : "row-right"
      }`}
      aria-hidden="true"
    >
      {items.map((item, itemIndex) =>
        item.type === "image" ? (
          <span
            className="inline-editorial-img kinetic-inline-media"
            style={{
              "--media-ratio": item.ratio,
              "--inline-height": `${item.displayHeight}em`,
            }}
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
          <span
            className="editorial-text kinetic-editorial-text"
            key={`${item.value}-${itemIndex}`}
          >
            {item.value}
          </span>
        ),
      )}
    </div>
  );
}

export default function EditorialTypeStage() {
  const wrapperRef = useRef(null);
  const containerRef = useRef(null);
  const rowsRef = useRef([]);

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const container = containerRef.current;

    if (!wrapper || !container) {
      return undefined;
    }

    const ctx = gsap.context(() => {
      const rows = rowsRef.current.filter(Boolean);
      const stageContent = container.querySelector(
        ".kinetic-stage-viewport",
      );

      if (!rows.length || !stageContent) {
        return;
      }

      /*
       * The outer section is intentionally only slightly taller
       * than the viewport.
       *
       * This gives the horizontal animation real scroll distance
       * without leaving a giant dead/empty period after the text
       * has disappeared.
       */
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      /*
       * Keep the existing horizontal editorial movement.
       * Each row moves in the opposite direction from its neighbor.
       */
      const distances = [-30, 25, -25, 30];

      rows.forEach((row, index) => {
        timeline.to(
          row,
          {
            xPercent: distances[index] ?? 0,
            duration: 1,
            ease: "none",
          },
          0,
        );
      });

      /*
       * Fade only at the very end of the sequence.
       *
       * Do not leave a large amount of invisible white space
       * after autoAlpha reaches zero.
       */
      timeline.to(
        stageContent,
        {
          autoAlpha: 0,
          duration: 0.1,
          ease: "power1.out",
        },
        0.9,
      );

      return () => {
        timeline.kill();
      };
    }, wrapper);

    const refresh = () => {
      ScrollTrigger.refresh();
    };

    requestAnimationFrame(refresh);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={wrapperRef}
      className="editorial-type-scroll"
      aria-labelledby="kinetic-stage-title"
    >
      <div
        ref={containerRef}
        className="editorial-type-stage kinetic-editorial-stage"
      >
        <h2 id="kinetic-stage-title" className="kinetic-stage-title">
          Moving-image disciplines
        </h2>

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
      </div>
    </section>
  );
}