import { Link } from 'react-router-dom';

export default function Footer({ instagram, email }) {
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
        <a href={instagram}>INSTAGRAM <span aria-hidden="true">↗</span></a>
        <Link to="/admin">ADMIN <span aria-hidden="true">↗</span></Link>
        <a href={email}>EMAIL <span aria-hidden="true">↗</span></a>
        <a href="#top" onClick={backToTop}>BACK TO TOP <span aria-hidden="true">↑</span></a>
      </nav>
    </footer>
  );
}
