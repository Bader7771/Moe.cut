import GoldenRingCanvas from "./GoldenRingCanvas";

export default function Header({ email }) {
  return (
    <header className="header site-header top-navbar">
      <div className="navbar-left">
        <GoldenRingCanvas />
        <strong className="navbar-brand">MO-CUT-MOTION</strong>
      </div>

      <div className="navbar-center" aria-label="MO VIDEO EDITING STUDIO">
        <span aria-hidden="true" />
        <strong>MO-<br />VIDEO-<br />EDITING-<br />STUDIO-</strong>
        <span aria-hidden="true" />
      </div>

      <div className="navbar-right">
        <span className="navbar-language">EN / FR</span>
        <a className="navbar-work" href={`mailto:${email}`}>
          WORK WITH US <span aria-hidden="true">↗</span>
        </a>
      </div>
    </header>
  );
}
