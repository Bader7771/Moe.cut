import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function TransformGizmo3D() {
  const host = useRef(null);
  useEffect(() => {
    const node = host.current;
    if (!node) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(3.4, 2.9, 5.3);
    camera.lookAt(0, 0, 0);
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    const mobile = matchMedia("(max-width: 700px)").matches;
    renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.35 : 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    node.appendChild(renderer.domElement);
    const group = new THREE.Group();
    scene.add(group);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x222222, 2.2));
    const centerMaterial = new THREE.MeshStandardMaterial({
      color: 0xf4f4f4,
      roughness: 0.24,
      metalness: 0.12,
    });
    const center = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 32, 24),
      centerMaterial,
    );
    group.add(center);
    const geometries = [center.geometry];
    const materials = [centerMaterial];
    const addAxis = (color, direction) => {
      const material = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.28,
        metalness: 0.08,
      });
      const shaftGeometry = new THREE.CylinderGeometry(0.045, 0.045, 1.55, 18);
      const headGeometry = new THREE.ConeGeometry(0.13, 0.34, 24);
      const shaft = new THREE.Mesh(shaftGeometry, material);
      const head = new THREE.Mesh(headGeometry, material);
      shaft.position.y = 0.88;
      head.position.y = 1.82;
      const axis = new THREE.Group();
      axis.add(shaft, head);
      axis.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
      group.add(axis);
      geometries.push(shaftGeometry, headGeometry);
      materials.push(material);
    };
    addAxis(0xff2d20, new THREE.Vector3(1, 0, 0));
    addAxis(0x32e34b, new THREE.Vector3(0, 1, 0));
    addAxis(0x2779ff, new THREE.Vector3(0, 0, 1));
    group.rotation.set(-0.22, 0.2, -0.08);
    const canHover = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const idleVelocity = new THREE.Vector3(0.07, 0.22, 0);
    const angularVelocity = idleVelocity.clone();
    const targetVelocity = idleVelocity.clone();
    let hovered = false;
    let nextDirectionChange = 0;
    let animationFrame = 0;
    let intersecting = true;
    let running = true;
    let last = performance.now();
    const resize = () => {
      const { width, height } = node.getBoundingClientRect();
      renderer.setSize(Math.max(1, width), Math.max(1, height), false);
      camera.aspect = width / Math.max(1, height);
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(node);
    const enter = () => {
      if (canHover) {
        hovered = true;
        nextDirectionChange = 0;
      }
    };
    const leave = () => {
      hovered = false;
    };
    node.addEventListener("pointerenter", enter);
    node.addEventListener("pointerleave", leave);
    const render = (now) => {
      if (!running) return;
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;
      if (!reduced) {
        if (hovered && now >= nextDirectionChange) {
          const direction = () => (Math.random() < 0.5 ? -1 : 1);
          targetVelocity.set(
            direction() * (0.14 + Math.random() * 0.1),
            direction() * (0.3 + Math.random() * 0.16),
            direction() * (0.1 + Math.random() * 0.12),
          );
          nextDirectionChange = now + 900 + Math.random() * 700;
        } else if (!hovered) {
          targetVelocity.set(
            idleVelocity.x,
            idleVelocity.y,
            Math.sin(now * 0.0007) * 0.035,
          );
        }
        const damping = 1 - Math.exp(-dt * (hovered ? 7 : 2.2));
        angularVelocity.lerp(targetVelocity, damping);
        group.rotation.x += angularVelocity.x * dt;
        group.rotation.y += angularVelocity.y * dt;
        group.rotation.z += angularVelocity.z * dt;
        group.position.y = Math.sin(now * 0.0012) * 0.045;
      }
      renderer.render(scene, camera);
      animationFrame = requestAnimationFrame(render);
    };
    const syncRendering = () => {
      const shouldRun = !document.hidden && intersecting;
      if (shouldRun === running) return;
      running = shouldRun;
      cancelAnimationFrame(animationFrame);
      if (running) {
        last = performance.now();
        animationFrame = requestAnimationFrame(render);
      }
    };
    const visibility = () => syncRendering();
    const viewportObserver = new IntersectionObserver(([entry]) => {
      intersecting = entry.isIntersecting;
      syncRendering();
    });
    viewportObserver.observe(node);
    document.addEventListener("visibilitychange", visibility);
    resize();
    animationFrame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
      viewportObserver.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      node.removeEventListener("pointerenter", enter);
      node.removeEventListener("pointerleave", leave);
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);
  return (
    <div
      ref={host}
      className="transform-gizmo"
      role="img"
      aria-label="Rotating three-dimensional XYZ transform controller"
    />
  );
}
