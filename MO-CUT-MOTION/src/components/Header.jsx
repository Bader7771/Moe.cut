import GoldenRingCanvas from "./GoldenRingCanvas";

export default function Header({ name, descriptor, email }) {
  return (
    <header className="header site-header">
      <div className="header-left">
        <GoldenRingCanvas />
        <div className="identity header-branding">
          <strong className="brand-title">{name}</strong>
          <span className="brand-subtitle">{descriptor}</span>
        </div>
      </div>
      <a className="header-right work-link" href={`mailto:${email}`}>
        WORK WITH US <span aria-hidden="true">↗</span>
      </a>
    </header>
  );
}
