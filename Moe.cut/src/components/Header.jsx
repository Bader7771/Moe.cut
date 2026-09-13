import { lazy, Suspense } from "react";
const GoldenRingCanvas = lazy(() => import("./GoldenRingCanvas"));

export default function Header({ email }) {
  return (
    <header className="header site-header top-navbar navbar">
      <div className="navbar-left">
        <Suspense fallback={<div className="golden-ring-wrapper" />}><GoldenRingCanvas /></Suspense>
        <strong className="navbar-brand">Moe.cut</strong>
      </div>

      <div className="navbar-center" aria-label="MO VIDEO EDITING STUDIO">
        <span aria-hidden="true" />
        <strong>MO-<br />VIDEO-<br />EDITING-<br />STUDIO-</strong>
        <span aria-hidden="true" />
      </div>

      <div className="navbar-right nav-right-container">
        <span className="navbar-language nav-lang-toggle">EN / FR</span>
        <a className="navbar-work nav-cta-btn" href={`mailto:${email}`}>
          WORK WITH US <span aria-hidden="true">↗</span>
        </a>
      </div>
    </header>
  );
}
