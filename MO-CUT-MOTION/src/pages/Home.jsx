import Header from "../components/Header";
import HeroProfile from "../components/HeroProfile";
import GhostCursor from "../components/GhostCursor";
import EditorialTypeStage from "../components/EditorialTypeStage";
import ProjectsLayer from "../components/projects/ProjectsLayer";
import TestimonialGameboy from "../components/TestimonialGameboy";
import RetroButton from "../components/RetroButton";
import Footer from "../components/Footer";
import { siteContent } from "../data/siteContent";
import "./Home.css";

export default function Home() {
  return (
    <div id="top" className="experience app-container">
      <Header email={siteContent.contact.email} />
      <div className="hero-layer">
        <GhostCursor
          trailLength={35}
          grainIntensity={0.03}
          bloomStrength={0.12}
          bloomRadius={0.75}
          brightness={1.2}
          color="#2563EB"
          mixBlendMode="multiply"
          edgeIntensity={0.1}
          zIndex={1}
        />
        <div className="site-shell">
          <main className="hero-content">
            <HeroProfile />
          </main>
        </div>
      </div>
      <div className="stacked-panel stacked-projects-panel">
        <ProjectsLayer />
      </div>
      <div className="stacked-panel stacked-testimonials-panel">
        <TestimonialGameboy />
      </div>
      <EditorialTypeStage />
      <section className="footer-button-stage" aria-label="End of portfolio">
        <div className="footer-button-wrapper">
          <div className="flashing-click-prompt">
            <span>Click here</span>
            <svg
              className="bounce-arrow-down"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <polyline points="19 12 12 19 5 12" />
            </svg>
          </div>
          <RetroButton />
        </div>
      </section>
      <Footer
        instagram={siteContent.footer.instagram}
        email={siteContent.footer.email}
      />
    </div>
  );
}
