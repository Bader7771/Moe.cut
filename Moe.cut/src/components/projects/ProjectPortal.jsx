import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./ProjectPortal.css";

const CLOSE_DURATION = 180;

export default function ProjectPortal({ project, onClose }) {
  const dialog = useRef(null);
  const closeButton = useRef(null);
  const closeTimer = useRef(0);
  const closingRef = useRef(false);
  const [closing, setClosing] = useState(false);

  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    closeTimer.current = window.setTimeout(onClose, CLOSE_DURATION);
  }, [onClose]);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;
    const previousRootOverflow = root.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyPosition = body.style.position;
    const previousBodyTop = body.style.top;
    const previousBodyWidth = body.style.width;
    const opener = document.activeElement;
    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    closeButton.current?.focus({ preventScroll: true });

    const handleKeyDown = (event) => {
      if (event.key === "Escape") requestClose();
      if (event.key !== "Tab") return;
      const focusable = [...(dialog.current?.querySelectorAll('button:not(:disabled), a[href], video[controls], input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])') || [])];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(closeTimer.current);
      window.removeEventListener("keydown", handleKeyDown);
      root.style.overflow = previousRootOverflow;
      body.style.overflow = previousBodyOverflow;
      body.style.position = previousBodyPosition;
      body.style.top = previousBodyTop;
      body.style.width = previousBodyWidth;
      window.scrollTo(0, scrollY);
      opener?.focus?.({ preventScroll: true });
    };
  }, [requestClose]);

  return createPortal(
    <div
      className={`project-portal${closing ? " is-closing" : ""}`}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
    >
      <article
        ref={dialog}
        className="project-portal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-portal-title"
        aria-describedby={project.description ? "project-portal-description" : undefined}
      >
        <button ref={closeButton} className="project-portal-close" type="button" onClick={requestClose} aria-label={`Close ${project.title} project preview`}>✕</button>
        <div className="project-portal-content">
          <header className="project-portal-header">
            <h2 id="project-portal-title">{project.title}</h2>
          </header>
          <figure className="project-portal-media">
            <img src={project.image} alt={project.alt || project.title} style={{ objectPosition: project.position }} />
          </figure>
          {project.description && <p id="project-portal-description" className="project-portal-description">{project.description}</p>}
          <footer className="project-portal-footer">
            <p className="project-portal-wordmark" aria-hidden="true">{project.title}</p>
          </footer>
        </div>
      </article>
    </div>,
    document.body
  );
}
