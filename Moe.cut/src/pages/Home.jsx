import { useLayoutEffect, useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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
  const heroRef = useRef(null);
  const projectsRef = useRef(null);
  const testimonialsRef = useRef(null);
  const footerButtonRef = useRef(null);

  useLayoutEffect(() => {
    const nodes = [
      heroRef.current,
      projectsRef.current,
      testimonialsRef.current,
      footerButtonRef.current,
    ].filter(Boolean);
    if (!nodes.length) return undefined;

    let updateFrame = 0;
    let refreshFrame = 0;
    let footerLiftTrigger = null;

    const updateStickyTops = () => {
      updateFrame = 0;
      const viewportHeight = window.innerHeight;
      const footerElement = document.querySelector(".site-footer");

      nodes.forEach((node) => {
        const stickyTop = Math.min(0, viewportHeight - node.offsetHeight);
        node.style.setProperty("--stack-stick-top", `${stickyTop}px`);
      });

      const footerButtonNode = footerButtonRef.current;
      footerLiftTrigger?.kill();
      footerLiftTrigger = null;

      if (footerButtonNode) {
        footerButtonNode.style.setProperty("--stack-end-lift", "0px");
        footerButtonNode.style.setProperty("--stack-end-progress", "0");

        const prefersReducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        const footerShortfall = footerElement
          ? Math.max(
              0,
              viewportHeight -
                (footerButtonNode.offsetHeight + footerElement.offsetHeight),
            )
          : 0;

        footerButtonNode.style.setProperty(
          "--stack-end-lift",
          `${footerShortfall}px`,
        );

        if (footerElement && footerShortfall > 0 && !prefersReducedMotion) {
          footerLiftTrigger = ScrollTrigger.create({
            trigger: footerButtonNode,
            start: "top bottom",
            endTrigger: footerElement,
            end: "bottom bottom",
            scrub: true,
            invalidateOnRefresh: true,
            onRefresh: ({ progress }) => {
              footerButtonNode.style.setProperty(
                "--stack-end-progress",
                progress.toFixed(4),
              );
            },
            onUpdate: ({ progress }) => {
              footerButtonNode.style.setProperty(
                "--stack-end-progress",
                progress.toFixed(4),
              );
            },
          });
        }
      }

      cancelAnimationFrame(refreshFrame);
      refreshFrame = requestAnimationFrame(() => {
        ScrollTrigger.refresh();
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
      cancelAnimationFrame(refreshFrame);
      footerLiftTrigger?.kill();
      resizeObserver.disconnect();
      window.removeEventListener("resize", scheduleUpdate);
      window.visualViewport?.removeEventListener("resize", scheduleUpdate);
      nodes.forEach((node) => node.style.removeProperty("--stack-stick-top"));
      footerButtonRef.current?.style.removeProperty("--stack-end-lift");
      footerButtonRef.current?.style.removeProperty("--stack-end-progress");
    };
  }, []);

  return (
    <div id="top" className="experience app-container">
      <div ref={heroRef} className="hero-layer">
        <Header email={siteContent.contact.email} />
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
      <div ref={projectsRef} className="stacked-panel stacked-projects-panel">
        <ProjectsLayer />
      </div>
      <div
        ref={testimonialsRef}
        className="stacked-panel stacked-testimonials-panel"
      >
        <TestimonialGameboy />
      </div>
      <EditorialTypeStage />
      <section
        ref={footerButtonRef}
        className="footer-button-stage"
        aria-label="End of portfolio"
      >
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
