import { useEffect, useRef, useState } from "react";
import { useVisibility } from "../../performance/useVisibility";
import ProjectGrid from "./ProjectGrid";
import ProjectsIntro from "./ProjectsIntro";
import ProjectPortal from "./ProjectPortal";
import TargetCursor from "../TargetCursor";
import { projects as fallbackProjects } from "../../data/projects";

export default function ProjectsLayer() {
  const section = useRef(null);
  const near = useVisibility(section, "800px");
  const fetched = useRef(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    if (!near || fetched.current) return undefined;
    const controller = new AbortController();
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects', { signal: controller.signal });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        fetched.current = true;
        setProjects(data.map((project) => ({
          ...project,
          id: project.projectId || project.id || project._id,
        })));
      } catch (err) {
        if (err.name === "AbortError") return;
        fetched.current = true;
        setError(err.message);
        setProjects(fallbackProjects);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchProjects();
    return () => controller.abort();
  }, [near]);

  return (
    <section ref={section} id="projects" className="projects-section projects-layer" aria-labelledby="projects-title">
      <TargetCursor containerSelector=".projects-section" targetSelector=".cursor-target" />
      <ProjectsIntro />
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#fff' }}>Loading projects...</div>
      ) : <>
        {error && <p className="projects-data-notice" role="status">Live project data is temporarily unavailable. Showing the latest cached work.</p>}
        <ProjectGrid projects={projects} onSelect={setSelectedProject} />
      </>}
      {selectedProject && <ProjectPortal key={selectedProject.id} project={selectedProject} onClose={() => setSelectedProject(null)} />}
    </section>
  );
}
