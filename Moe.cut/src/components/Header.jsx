import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { scrollToSection } from "../utils/scrollToSection";
import "./Header.css";
const GoldenRingCanvas = lazy(() => import("./GoldenRingCanvas"));

export default function Header({ whatsapp }) {
  const [open, setOpen] = useState(false);
  const header = useRef(null);
  const toggle = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const desktop = window.matchMedia("(min-width: 821px)");
    const close = () => setOpen(false);
    const onResize = () => { if (desktop.matches) close(); };
    const onPointer = event => { if (!header.current?.contains(event.target)) close(); };
    const onKey = event => {
      if (event.key === "Escape") {
        close();
        toggle.current?.focus({ preventScroll: true });
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, { passive: true });
    desktop.addEventListener("change", onResize);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close);
      desktop.removeEventListener("change", onResize);
    };
  }, [open]);

  const navigate = event => { scrollToSection(event); setOpen(false); };

  return (
    <header ref={header} className="header site-header top-navbar navbar" onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }}>
      <div className="navbar-left">
        <Suspense fallback={<div className="golden-ring-wrapper" />}><GoldenRingCanvas /></Suspense>
        <a className="navbar-brand" href="#top" onClick={navigate}>Moe.cut</a>
      </div>

      <div className="navbar-center" aria-label="MO VIDEO EDITING STUDIO">
        <span aria-hidden="true" />
        <strong>MO-<br />VIDEO-<br />STUDIO-</strong>
        <span aria-hidden="true" />
      </div>

      <div className="navbar-right nav-right-container">
        <span className="navbar-language nav-lang-toggle">From / Here</span>
        <a className="navbar-work nav-cta-btn" href={whatsapp} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
          Contact Us <span aria-hidden="true">↗</span>
        </a>
        <button ref={toggle} type="button" className="navbar-menu-toggle" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(value => !value)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
            {open ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 8h16M4 16h16" />}
          </svg>
        </button>
      </div>

      <nav id="mobile-navigation" className="mobile-navigation" aria-label="Mobile navigation" hidden={!open}>
        <a href="#top" onClick={navigate}>Home <span aria-hidden="true">↑</span></a>
        <a href="#projects" onClick={navigate}>Selected work <span aria-hidden="true">↓</span></a>
        <a href="#testimonials-title" onClick={navigate}>Reviews <span aria-hidden="true">↓</span></a>
      </nav>
    </header>
  );
}
