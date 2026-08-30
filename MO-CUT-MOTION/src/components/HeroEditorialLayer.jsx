import { useEffect, useRef } from "react";
import keyboard from "../assets/hero/keyboard.webp";
import mouse from "../assets/hero/mouse.webp";
import designSheet from "../assets/hero/design-sheet.webp";
import plant from "../assets/hero/plant.webp";
import referenceBook from "../assets/hero/reference-book.webp";
import cinemaCamera from "../assets/hero/cinema-camera.webp";
import studioHeadphones from "../assets/hero/studio-headphones.webp";
import cinemaSlate from "../assets/hero/cinema-slate.webp";
import lensReel from "../assets/hero/lens-reel.webp";
import editPanel from "../assets/hero/edit-panel.webp";

const objects = [
  {
    id: "keyboard",
    number: "01",
    label: "CUT KEYS",
    src: keyboard,
    className: "hero-object-keyboard",
    depth: 1.25,
  },
  {
    id: "mouse",
    number: "02",
    label: "DRAG LOOP",
    src: mouse,
    className: "hero-object-mouse",
    depth: 0.9,
  },
  {
    id: "sheet",
    number: "03",
    label: "FRAME GRID",
    src: designSheet,
    className: "hero-object-sheet",
    depth: 0.7,
  },
  {
    id: "plant",
    number: "04",
    label: "STUDIO AIR",
    src: plant,
    className: "hero-object-plant",
    depth: 0.5,
  },
  {
    id: "book",
    number: "05",
    label: "REFERENCE",
    src: referenceBook,
    className: "hero-object-book",
    depth: 0.65,
  },
];

const productionAssets = [
  {
    id: "camera",
    src: cinemaCamera,
    label: "FRAME 024 / 24 FPS",
    className: "hero-production-camera",
    depth: 0.48,
  },
  {
    id: "slate",
    src: cinemaSlate,
    label: "POST / MOTION",
    className: "hero-production-slate",
    depth: 0.42,
  },
  {
    id: "headphones",
    src: studioHeadphones,
    label: "SOUND DESIGN",
    className: "hero-production-headphones",
    depth: 0.72,
  },
  {
    id: "lens-reel",
    src: lensReel,
    label: "FILM / MOTION",
    className: "hero-production-lens",
    depth: 0.6,
  },
  {
    id: "edit-panel",
    src: editPanel,
    label: "CUT / COLOR / SOUND",
    className: "hero-production-panel",
    depth: 0.68,
  },
];

export default function HeroEditorialLayer() {
  const layer = useRef(null);

  useEffect(() => {
    const node = layer.current;
    if (!node) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let frame = 0;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const update = () => {
      frame = 0;
      pointer.x += (pointer.tx - pointer.x) * 0.08;
      pointer.y += (pointer.ty - pointer.y) * 0.08;
      node.style.setProperty("--hero-parallax-x", pointer.x.toFixed(3));
      node.style.setProperty("--hero-parallax-y", pointer.y.toFixed(3));
      if (
        Math.abs(pointer.tx - pointer.x) > 0.002 ||
        Math.abs(pointer.ty - pointer.y) > 0.002
      ) {
        frame = requestAnimationFrame(update);
      }
    };
    const move = (event) => {
      pointer.tx = (event.clientX / innerWidth - 0.5) * 2;
      pointer.ty = (event.clientY / innerHeight - 0.5) * 2;
      if (!frame) frame = requestAnimationFrame(update);
    };

    addEventListener("pointermove", move, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("pointermove", move);
    };
  }, []);

  return (
    <div ref={layer} className="hero-editorial-layer">
      <div className="hero-grid-backdrop" aria-hidden="true" />
      <div className="hero-title-stack">
        <p>VIDEO EDITING STUDIO</p>
        <h1>
          <span>TIMELINE</span>
          <span>/ STUDIO</span>
        </h1>
        <em>CUTS / COLOR / SOUND</em>
      </div>
      <p className="hero-side-note hero-side-note-left">
        CUTS / COLOR / SOUND
      </p>
      <p className="hero-side-note hero-side-note-right">
        STORIES STILL MOVING
      </p>
      <div className="hero-production-field" aria-hidden="true">
        {productionAssets.map((asset) => (
          <figure
            className={`hero-production-asset ${asset.className}`}
            key={asset.id}
            style={{ "--depth": asset.depth }}
          >
            <img src={asset.src} alt="" draggable="false" />
            <figcaption>{asset.label}</figcaption>
          </figure>
        ))}
      </div>
      <div className="hero-object-field" aria-hidden="true">
        {objects.map((object) => (
          <figure
            className={`hero-object ${object.className}`}
            key={object.id}
            style={{ "--depth": object.depth }}
          >
            <span className="hero-marker">
              <i>{object.number}</i>
              <b>{object.label}</b>
            </span>
            <img src={object.src} alt="" draggable="false" />
          </figure>
        ))}
      </div>
    </div>
  );
}
