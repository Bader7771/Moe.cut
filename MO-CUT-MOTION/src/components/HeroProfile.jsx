import { useRef, useState } from "react";
import profileImage from "../assets/editorial/frame-03.jpg";
import portraitOne from "../assets/projects/project-03.webp";
import portraitTwo from "../assets/editorial/frame-02.jpg";
import portraitThree from "../assets/editorial/frame-01.jpg";

const collaborators = [
  { initials: "MRND", name: "Mrnd.clothing", count: "70.2K followers", logo: true },
  { initials: "FM", name: "Facts.in.minutees", count: "1,09M subscribers", avatar: profileImage },
  { initials: "BE", name: "Barry_empire", count: "32.9K followers", avatar: portraitTwo },
  { initials: "SF", name: "sea.fdol", count: "135K followers", avatar: portraitOne },
  { initials: "AC", name: "ayoubcopywriter", count: "50K followers", avatar: portraitThree },
  { initials: "LA", name: "lassakri", count: "1.1M", avatar: profileImage },
];

function VerifiedIcon() {
  return (
    <svg className="verified-icon" viewBox="0 0 20 20" aria-label="Verified">
      <path d="M10 1.7 12 3l2.4-.1.7 2.3 2 1.3-.8 2.3.8 2.3-2 1.3-.7 2.3-2.4-.1-2 1.3-2-1.3-2.4.1-.7-2.3-2-1.3.8-2.3-.8-2.3 2-1.3.7-2.3L8 3l2-1.3Z" />
      <path className="verified-check" d="m6.8 10 2 2 4.5-4.6" />
    </svg>
  );
}

function CollaboratorSet({ hidden = false }) {
  return (
    <div className="collaborator-set" aria-hidden={hidden || undefined}>
      {collaborators.map((client) => (
        <article className="collaborator-badge" key={client.name}>
          <span className={`client-avatar${client.logo ? " client-logo" : ""}`} aria-hidden="true">
            {client.avatar ? <img src={client.avatar} alt="" /> : `[${client.initials}]`}
          </span>
          <span className="client-copy">
            <span className="client-name">{client.name}<VerifiedIcon /></span>
            <span className="client-count">{client.count}</span>
          </span>
        </article>
      ))}
    </div>
  );
}

export default function HeroProfile() {
  const scroller = useRef(null);
  const drag = useRef({ active: false, x: 0, left: 0 });
  const [dragging, setDragging] = useState(false);

  const onPointerDown = (event) => {
    const node = scroller.current;
    if (!node) return;
    drag.current = { active: true, x: event.clientX, left: node.scrollLeft };
    setDragging(true);
    node.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event) => {
    if (!drag.current.active || !scroller.current) return;
    scroller.current.scrollLeft = drag.current.left - (event.clientX - drag.current.x);
  };

  const stopDragging = (event) => {
    drag.current.active = false;
    setDragging(false);
    if (scroller.current?.hasPointerCapture(event.pointerId)) {
      scroller.current.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div className="hero-foreground">
      <div className="hero-profile-card">
        <img className="profile-avatar" src={profileImage} alt="MO-CUT-MOTION creative director" />
        <div className="availability-pill">
          <span className="availability-dot" aria-hidden="true" />
          August · 1 project opening
        </div>
        <h1>MO-CUT-MOTION</h1>
        <p>Creative direction and video editing built to be remembered.</p>
        <div className="hero-actions">
          <a className="hero-button hero-button-secondary" href="#projects">
            <span aria-hidden="true">↓</span> See selected work
          </a>
          <a className="hero-button hero-button-primary" href="mailto:hello@mo-cut-motion.com">
            <span>Request availability</span>
          </a>
        </div>
      </div>

      <div
        ref={scroller}
        className={`collaborator-scroller${dragging ? " is-dragging" : ""}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        aria-label="Selected clients and collaborators"
      >
        <div className="collaborator-track">
          <CollaboratorSet />
          <CollaboratorSet hidden />
        </div>
      </div>

      <div id="projects" className="hero-projects-heading">
        <h2>Projects</h2>
        <span aria-hidden="true" />
      </div>
    </div>
  );
}
