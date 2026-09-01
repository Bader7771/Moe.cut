import ProjectCard from "./ProjectCard";

export default function ProjectGrid({ projects }) {
  return (
    <div className="project-grid">
      {projects.map((project, index) => (
        <div className="project-grid-item" data-row={Math.floor(index / 2) + 1} data-side={index % 2 ? "right" : "left"} key={project.id}>
          <ProjectCard project={project} />
        </div>
      ))}
    </div>
  );
}
