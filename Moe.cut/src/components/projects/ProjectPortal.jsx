import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./ProjectPortal.css";
import { usePortalReveal } from "./usePortalReveal";

const CLOSE_DURATION = 180;

function mediaLink(value) {
  if (!value) return null;
  try {
    const url = new URL(value, window.location.origin);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}

export default function ProjectPortal({ project, onClose }) {
  const dialog = useRef(null);
  const closeButton = useRef(null);
  const closeTimer = useRef(0);
  const closingRef = useRef(false);
  const [closing, setClosing] = useState(false);
  const metadata = [['Category', project.category], ['Client', project.client], ['Year', project.year]].filter(([, value]) => value);
  const projectUrl = mediaLink(project.url);
  const videoUrl = mediaLink(project.video);
  usePortalReveal(dialog);

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
        if (event.target === event.currentTarget || event.target === dialog.current) requestClose();
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
        <div className="project-portal-content">
          <div className="project-portal-toolbar">
            <button ref={closeButton} className="project-portal-close" type="button" onClick={requestClose} aria-label={`Close ${project.title} project preview`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m10 5-7 7 7 7M3 12h18" /></svg>
              Back to projects
            </button>
          </div>
          <header className="project-portal-header">
            <p className="project-portal-label">Selected work{project.projectId || project.id ? ` / ${project.projectId || project.id}` : ''}</p>
            <h2 id="project-portal-title">{project.title}</h2>
            {metadata.length > 0 && <dl className="project-portal-metadata">
              {metadata.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
            </dl>}
          </header>
          <figure className="project-portal-media">
            <img src={project.image} alt={project.alt || project.title} />
          </figure>
          {project.description && <div className="project-portal-about">
            <h3 className="project-portal-label">About the project</h3>
            <p id="project-portal-description" className="project-portal-description">{project.description}</p>
          </div>}
          {(projectUrl || videoUrl) && <nav className="project-portal-actions" aria-label="Project links">
            {projectUrl && <a href={projectUrl} target="_blank" rel="noopener noreferrer">View project <span aria-hidden="true">↗</span></a>}
            {videoUrl && videoUrl !== projectUrl && <a href={videoUrl} target="_blank" rel="noopener noreferrer">Watch film <span aria-hidden="true">↗</span></a>}
          </nav>}
          <footer className="project-portal-footer">
            <p className="project-portal-wordmark" aria-hidden="true">{project.title}</p>
          </footer>
        </div>
      </article>
    </div>,
    document.body
  );
}
