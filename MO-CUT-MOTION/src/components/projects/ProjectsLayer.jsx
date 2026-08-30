import { useEffect, useState } from "react";
import ProjectGrid from "./ProjectGrid";
import ProjectsIntro from "./ProjectsIntro";
import TargetCursor from "../TargetCursor";
import { projects as fallbackProjects } from "../../data/projects";

export default function ProjectsLayer() {
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

  return (
    <section id="projects" className="projects-section projects-layer" aria-labelledby="projects-title">
      <TargetCursor containerSelector=".projects-section" targetSelector=".cursor-target" />
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
