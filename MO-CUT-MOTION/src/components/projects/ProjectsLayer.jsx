import { useEffect, useRef, useState } from "react";
import ProjectGrid from "./ProjectGrid";
import ProjectsIntro from "./ProjectsIntro";
import { projects as fallbackProjects } from "../../data/projects";

const clamp = (value) => Math.max(0, Math.min(1, value));
const smooth = (value) => value * value * (3 - 2 * value);

export default function ProjectsLayer() {
  const section = useRef(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setProjects(data.map((project) => ({
          ...project,
          id: project.projectId || project.id || project._id,
        })));
      } catch (err) {
        setError(err.message);
        setProjects(fallbackProjects);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const node = section.current;
    if (!node) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    const update = () => {
      frame = 0;
      if (reduced) return;
      const rect = node.getBoundingClientRect();
      const distance = Math.max(1, node.offsetHeight - innerHeight);
      const progress = clamp(-rect.top / distance);
      const entry = clamp(1 - rect.top / innerHeight);
      const intro = smooth(clamp((entry - 0.1) / 0.2));
      const handoff = smooth(clamp((progress - 0.12) / 0.2));
      node.style.setProperty("--projects-title-o", intro);
      node.style.setProperty("--projects-label-y", `${(1 - intro) * 20 - handoff * 12}px`);
      node.style.setProperty("--projects-title-y", `${(1 - intro) * 50 - handoff * 26}px`);
      node.style.setProperty("--projects-title-scale", 1 - handoff * 0.065);
      node.style.setProperty("--gizmo-o", smooth(clamp((entry - 0.13) / 0.2)));
      node.style.setProperty("--gizmo-y", `${(1 - intro) * 20 - handoff * 30}px`);
      node.style.setProperty("--gizmo-scale", 0.9 + intro * 0.1 - handoff * 0.1);
      [0.28, 0.5, 0.72].forEach((start, row) => {
        const reveal = smooth(clamp((progress - start) / 0.15));
        node.style.setProperty(`--row-${row + 1}-o`, reveal);
        node.style.setProperty(`--row-${row + 1}-y`, `${(1 - reveal) * 72}px`);
        node.style.setProperty(`--row-${row + 1}-clip`, `${(1 - reveal) * 100}%`);
        node.style.setProperty(`--row-${row + 1}-scale`, 0.97 + reveal * 0.03);
      });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    update();
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <section ref={section} className="projects-layer" aria-labelledby="projects-title">
      <ProjectsIntro />
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#fff' }}>Loading projects...</div>
      ) : <>
        {error && <p className="projects-data-notice" role="status">Live project data is temporarily unavailable. Showing the latest cached work.</p>}
        <ProjectGrid projects={projects} />
      </>}
    </section>
  );
}
