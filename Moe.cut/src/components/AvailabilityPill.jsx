import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";

import { prepareOathAudio } from "./green-lantern/oathAudio";

const GreenLanternPortal = lazy(() => import("./green-lantern/GreenLanternPortal"));

const messages = [
  "Available for Work",
  "Open to Collaborations",
  "Let's Build Something",
  "Available for New Projects",
];

export default function AvailabilityPill({ visible = true }) {
  const [active, setActive] = useState(0);
  const [origin, setOrigin] = useState(null);
  const trigger = useRef(null);
  const audio = useRef(null);
  const [portalActive, setPortalActive] = useState(false);
  const dockPortal = useCallback(() => setPortalActive(false), []);
  const closePortal = useCallback(() => { setOrigin(null); setPortalActive(false); }, []);
  const activate = () => {
    audio.current?.stop();
    audio.current = prepareOathAudio();
    setPortalActive(true);
    const rect = trigger.current.getBoundingClientRect();
    setOrigin({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
  };

  useEffect(() => () => audio.current?.stop(), []);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer;
    const update = () => {
      clearInterval(timer);
      if (visible && !motion.matches) {
        timer = setInterval(() => setActive(index => (index + 1) % messages.length), 5000);
      }
    };
    update();
    motion.addEventListener("change", update);
    return () => {
      clearInterval(timer);
      motion.removeEventListener("change", update);
    };
  }, [visible]);

  return (
    <>
    <div className="availability-pill" role="group" aria-label="Available for work and new collaborations">
      <button ref={trigger} type="button" className="availability-dot" data-charging={portalActive} aria-label="Activate Green Lantern power ring" aria-haspopup="dialog" aria-expanded={portalActive} onClick={activate} />
      {/* Reserve space for every message and keep decorative updates quiet for screen readers. */}
      <span className="availability-messages" aria-hidden="true">
        {messages.map((message, index) => (
          <span key={message} data-active={active === index}>{message}</span>
        ))}
      </span>
    </div>
    {origin && <Suspense fallback={null}><GreenLanternPortal origin={origin} trigger={trigger} audio={audio} onDock={dockPortal} onClose={closePortal} /></Suspense>}
    </>
  );
}
