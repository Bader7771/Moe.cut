import Header from "../components/Header";
import HeroProfile from "../components/HeroProfile";
import EditorialProjects from "../components/EditorialProjects";
import ProjectsLayer from "../components/projects/ProjectsLayer";
import TestimonialsLayer from "../components/TestimonialsLayer";
import Footer from "../components/Footer";
import { siteContent } from "../data/siteContent";

export default function Home() {
  return (
    <div id="top" className="experience">
      <div className="hero-layer">
        <div className="site-shell">
          <Header
            name={siteContent.name}
            descriptor={siteContent.descriptor}
            email={siteContent.contact.email}
          />
          <main>
            <HeroProfile />
          </main>
        </div>
      </div>
      <ProjectsLayer />
      <EditorialProjects />
      <TestimonialsLayer />
      <Footer
        instagram={siteContent.footer.instagram}
        email={siteContent.footer.email}
      />
    </div>
  );
}
