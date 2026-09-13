import { useEffect, useRef, useState } from "react";
import profileImage from "../assets/editorial/frame-03.jpg";
import { useVisibility } from "../performance/useVisibility";
import CollaboratorImage from "./CollaboratorImage";
import AvailabilityPill from "./AvailabilityPill";
import AnimatedAvailabilityButton from "./AnimatedAvailabilityButton";

function VerifiedIcon() {
  return (
    <svg className="verified-icon" viewBox="0 0 20 20" aria-label="Verified">
      <path d="M10 1.7 12 3l2.4-.1.7 2.3 2 1.3-.8 2.3.8 2.3-2 1.3-.7 2.3-2.4-.1-2 1.3-2-1.3-2.4.1-.7-2.3-2-1.3.8-2.3-.8-2.3 2-1.3.7-2.3L8 3l2-1.3Z" />
      <path className="verified-check" d="m6.8 10 2 2 4.5-4.6" />
    </svg>
  );
}

function CollaboratorSet({ collaborators, hidden = false }) {
  return (
    <div className="collaborator-set" aria-hidden={hidden || undefined}>
      {collaborators.map((client) => (
        <article className="collaborator-badge" key={client._id}>
          <span className="client-avatar" aria-hidden="true">
            <CollaboratorImage src={client.image} name={client.name} />
          </span>
          <span className="client-copy">
            <span className="client-name">{client.name}<VerifiedIcon /></span>
            <span className="client-count">{client.followers}</span>
          </span>
        </article>
      ))}
    </div>
  );
}

export default function HeroProfile() {
  const hero = useRef(null);
  const visible = useVisibility(hero);
  const scroller = useRef(null);
  const drag = useRef({ active: false, x: 0, left: 0 });
  const [dragging, setDragging] = useState(false);

  const [collaborators, setCollaborators] = useState([]);

  useEffect(() => {
    if (!visible) return undefined;
    const controller = new AbortController();
    let pending = false;
    const refresh = async () => {
      if (pending || document.hidden) return;
      pending = true;
      try {
        const response = await fetch('/api/collaborators', { signal: controller.signal, cache: 'no-store' });
        if (!response.ok) return;
        const data = await response.json();
        if (Array.isArray(data)) setCollaborators(data.filter(c => c && typeof c._id === 'string' && typeof c.name === 'string' && c.name.trim() && typeof c.image === 'string' && c.image && typeof c.followers === 'string' && c.followers.trim()));
      } catch { /* Keep the last loaded set during temporary network outages. */ }
      finally { pending = false; }
    };
    const onStorage = event => { if (event.key === 'collaboratorsUpdatedAt') refresh(); };
    refresh();
    const timer = setInterval(refresh, 30000);
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', onStorage);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      controller.abort();
      clearInterval(timer);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', onStorage);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [visible]);

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
    <div ref={hero} className="hero-foreground">
      <div className="hero-profile-card">
        <img className="profile-avatar" src={profileImage} alt="Moe.cut creative director" />
        <AvailabilityPill />
        <h1>Moe.cut</h1>
        <p>Creative direction and video editing built to be remembered.</p>
        <div className="hero-actions">
          <a className="hero-button hero-button-secondary" href="#projects">
            <span aria-hidden="true">↓</span> See selected work
          </a>
          <AnimatedAvailabilityButton />
        </div>
      </div>

      {collaborators.length > 0 && <div
        ref={scroller}
        className={`collaborator-scroller${dragging ? " is-dragging" : ""}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        aria-label="Selected clients and collaborators"
      >
        <div className="collaborator-track">
          <CollaboratorSet collaborators={collaborators} />
          <CollaboratorSet collaborators={collaborators} hidden />
        </div>
      </div>}

    </div>
  );
}
