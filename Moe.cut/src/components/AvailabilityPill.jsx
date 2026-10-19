import { useEffect, useState } from "react";

const messages = [
  "Available for Work",
  "Open to Collaborations",
  "Let's Build Something",
  "Available for New Projects",
];

export default function AvailabilityPill({ visible = true }) {
  const [active, setActive] = useState(0);

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
    <div className="availability-pill" role="img" aria-label="Available for work and new collaborations">
      <span className="availability-dot" aria-hidden="true" />
      {/* Reserve space for every message and keep decorative updates quiet for screen readers. */}
      <span className="availability-messages" aria-hidden="true">
        {messages.map((message, index) => (
          <span key={message} data-active={active === index}>{message}</span>
        ))}
      </span>
    </div>
  );
}
