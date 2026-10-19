import { Link } from 'react-router-dom';

export default function Footer({ instagram }) {
  const backToTop = (event) => {
    event.preventDefault();
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <footer className="site-footer footer">
      <p>TIMELINE/STUDIO © 2026</p>
      <p className="footer-descriptor">VIDEO EDITING STUDIO</p>
      <nav className="footer-links" aria-label="Footer navigation">
        <a href={instagram} target="_blank" rel="noopener noreferrer">
          <svg className="footer-social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" focusable="false">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
          </svg>
          INSTAGRAM <span aria-hidden="true">↗</span>
        </a>
        <Link to="/login">ADMIN <span aria-hidden="true">↗</span></Link>
        <a href="#top" onClick={backToTop}>BACK TO TOP <span aria-hidden="true">↑</span></a>
      </nav>
    </footer>
  );
}
