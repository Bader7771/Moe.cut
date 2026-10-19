import { lazy, Suspense, useLayoutEffect, useRef } from "react";
import Header from "../components/Header";
import HeroProfile from "../components/HeroProfile";
const GhostCursor = lazy(() => import("../components/GhostCursor"));
import ProjectsLayer from "../components/projects/ProjectsLayer";
import TestimonialGameboy from "../components/TestimonialGameboy";
import EditorialProjects from "../components/extracted-sections/sections.js";
import Footer from "../components/Footer";
import { siteContent } from "../data/siteContent";
import "./Home.css";

export default function Home() {
  const heroRef = useRef(null);
  const projectsRef = useRef(null);
  const testimonialsRef = useRef(null);

  useLayoutEffect(() => {
    const nodes = [
      heroRef.current,
      projectsRef.current,
      testimonialsRef.current,
    ].filter(Boolean);
    if (!nodes.length) return undefined;

    let updateFrame = 0;

    const updateStickyTops = () => {
      updateFrame = 0;
      const viewportHeight = window.innerHeight;

      nodes.forEach((node) => {
        const stickyTop = Math.min(0, viewportHeight - node.offsetHeight);
        node.style.setProperty("--stack-stick-top", `${stickyTop}px`);
      });


    };

    const scheduleUpdate = () => {
      if (!updateFrame) {
        updateFrame = requestAnimationFrame(updateStickyTops);
      }
    };

    const resizeObserver = new ResizeObserver(scheduleUpdate);
    nodes.forEach((node) => resizeObserver.observe(node));
    window.addEventListener("resize", scheduleUpdate, { passive: true });
    window.visualViewport?.addEventListener("resize", scheduleUpdate);
    scheduleUpdate();

    return () => {
      cancelAnimationFrame(updateFrame);
      resizeObserver.disconnect();
      window.removeEventListener("resize", scheduleUpdate);
      window.visualViewport?.removeEventListener("resize", scheduleUpdate);
      nodes.forEach((node) => node.style.removeProperty("--stack-stick-top"));
    };
  }, []);

  return (
    <div id="top" className="experience app-container">
      <div ref={heroRef} className="hero-layer">
        <Header whatsapp={siteContent.contact.whatsapp} />
        <Suspense fallback={null}><GhostCursor
          trailLength={35}
          grainIntensity={0.03}
          bloomStrength={0.12}
          bloomRadius={0.75}
          brightness={1.2}
          color="#2563EB"
          mixBlendMode="multiply"
          edgeIntensity={0.1}
          zIndex={1}
        /></Suspense>
        <div className="site-shell">
          <main className="hero-content">
            <HeroProfile />
          </main>
        </div>
      </div>
      <div ref={projectsRef} className="stacked-panel stacked-projects-panel">
        <ProjectsLayer />
      </div>
      <div
        ref={testimonialsRef}
        className="stacked-panel stacked-testimonials-panel"
      >
        <TestimonialGameboy />
      </div>
      <EditorialProjects />
      <Footer
        instagram={siteContent.footer.instagram}
      />
    </div>
  );
}
