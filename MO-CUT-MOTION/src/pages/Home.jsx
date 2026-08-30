import Header from "../components/Header";
import HeroProfile from "../components/HeroProfile";
import GhostCursor from "../components/GhostCursor";
import ProjectsLayer from "../components/projects/ProjectsLayer";
import TestimonialGameboy from "../components/TestimonialGameboy";
import Footer from "../components/Footer";
import { siteContent } from "../data/siteContent";

export default function Home() {
  return (
    <div id="top" className="experience">
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
      <ProjectsLayer />
      <TestimonialGameboy />
      <Footer
        instagram={siteContent.footer.instagram}
        email={siteContent.footer.email}
      />
    </div>
  );
}
