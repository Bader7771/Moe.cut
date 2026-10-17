export default function ProjectCard({ project, onSelect }) {
  const content = (
    <>
      <img className="cursor-target" src={project.image} alt={project.alt} loading="lazy" width="1200" height="675" style={{ objectPosition: project.position }} />
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
    <article className="project-card cursor-target">
      <button type="button" aria-label={`Preview ${project.title}`} onClick={() => onSelect(project)}>{content}</button>
    </article>
  );
}
