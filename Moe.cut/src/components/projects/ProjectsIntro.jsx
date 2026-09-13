import { lazy, Suspense, useRef } from "react";
import { useVisibility } from "../../performance/useVisibility";
const TransformGizmo3D = lazy(() => import("./TransformGizmo3D"));

export default function ProjectsIntro() {
  const host = useRef(null);
  const near = useVisibility(host, "800px");
  const loaded = useRef(false);
  if (near) loaded.current = true;
  return (
    <div ref={host} className="projects-intro">
      <div className="projects-heading">
        <p>SELECTED WORK / 2026</p>
        <h2 id="projects-title">PROJECTS</h2>
      </div>
      {loaded.current ? <Suspense fallback={<div className="transform-gizmo" />}><TransformGizmo3D /></Suspense> : <div className="transform-gizmo" />}
    </div>
  );
}
