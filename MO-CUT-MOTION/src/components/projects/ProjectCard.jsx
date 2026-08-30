import { useState } from "react";

export default function ProjectCard({ project }) {
  const [touchOpen, setTouchOpen] = useState(false);
  const activate = (event) => {
    if (!matchMedia("(hover: none)").matches) return;
    if (!touchOpen) {
      event.preventDefault();
      setTouchOpen(true);
    }
  };
  const content = (
    <>
      <img src={project.image} alt={project.alt} loading="lazy" width="1200" height="675" style={{ objectPosition: project.position }} />
      <span className="project-shade" aria-hidden="true" />
      <span className="project-number">({project.id})</span>
      <span className="project-card-copy">
        <strong>{project.title}</strong>
        <span>{project.category} / {project.year}</span>
      </span>
      <span className="project-arrow" aria-hidden="true">↗</span>
    </>
  );
  return (
    <article className={`project-card${touchOpen ? " is-open" : ""}`}>
      {project.url ? (
        <a href={project.url} aria-label={`View ${project.title}`} onClick={activate}>{content}</a>
      ) : (
        <button type="button" aria-label={`Preview ${project.title}`} aria-expanded={touchOpen} onClick={activate}>{content}</button>
      )}
    </article>
  );
}
