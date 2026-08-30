import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import ringClickSound from "../assets/Sonic Ring - Sound Effect (HD).mp3";

export default function GoldenRingCanvas() {
  const mount = useRef(null);
  const [fallback, setFallback] = useState(false);
  useEffect(() => {
    const host = mount.current;
    if (!host) return;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setFallback(true);
      return;
    }
    const initialWidth = host.clientWidth || 86;
    const initialHeight = host.clientHeight || 64;
    renderer.setClearColor(0x000000, 0);
    const mobile = matchMedia("(max-width: 700px)").matches;
    renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.35 : 2));
    renderer.setSize(initialWidth, initialHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    host.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      35,
      initialWidth / initialHeight,
      0.1,
      100,
    );
    camera.position.set(0, 1.6, 5.5);
    camera.lookAt(0, 0, 0);
    const environmentCanvas = document.createElement("canvas");
    environmentCanvas.width = 1024;
    environmentCanvas.height = 512;
    const context = environmentCanvas.getContext("2d");
    const studio = context.createLinearGradient(0, 0, 0, 512);
    studio.addColorStop(0, "#ffffff");
    studio.addColorStop(0.13, "#fffdf4");
    studio.addColorStop(0.2, "#fff0a6");
    studio.addColorStop(0.34, "#e5ae20");
    studio.addColorStop(0.52, "#c98708");
    studio.addColorStop(0.66, "#8b5908");
    studio.addColorStop(0.79, "#3a260b");
    studio.addColorStop(1, "#090806");
    context.fillStyle = studio;
    context.fillRect(0, 0, 1024, 512);
    const reflectionBand = (center, width, color, opacity) => {
      const band = context.createLinearGradient(
        center - width,
        0,
        center + width,
        0,
      );
      band.addColorStop(0, "rgba(0,0,0,0)");
      band.addColorStop(0.5, color);
      band.addColorStop(1, "rgba(0,0,0,0)");
      context.globalAlpha = opacity;
      context.fillStyle = band;
      context.fillRect(center - width, 0, width * 2, 512);
      context.globalAlpha = 1;
    };
    reflectionBand(70, 128, "#030303", 0.94);
    reflectionBand(465, 98, "#0b0906", 0.9);
    reflectionBand(950, 138, "#020202", 0.96);
    reflectionBand(252, 48, "#ffffff", 0.92);
    reflectionBand(706, 34, "#fff8da", 0.78);
    const upperStrip = context.createLinearGradient(0, 58, 0, 118);
    upperStrip.addColorStop(0, "rgba(255,255,255,0)");
    upperStrip.addColorStop(0.45, "rgba(255,255,255,.98)");
    upperStrip.addColorStop(0.62, "rgba(255,247,207,.92)");
    upperStrip.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = upperStrip;
    context.fillRect(0, 58, 1024, 60);
    const lowerBand = context.createLinearGradient(0, 330, 0, 512);
    lowerBand.addColorStop(0, "rgba(35,22,7,0)");
    lowerBand.addColorStop(0.38, "rgba(24,15,6,.46)");
    lowerBand.addColorStop(0.72, "rgba(8,7,5,.78)");
    lowerBand.addColorStop(1, "rgba(2,2,2,.94)");
    context.fillStyle = lowerBand;
    context.fillRect(0, 330, 1024, 182);
    const environmentSource = new THREE.CanvasTexture(environmentCanvas);
    environmentSource.mapping = THREE.EquirectangularReflectionMapping;
    environmentSource.colorSpace = THREE.SRGBColorSpace;
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environmentTarget = pmrem.fromEquirectangular(environmentSource);
    pmrem.dispose();
    scene.environment = environmentTarget.texture;
    const geometry = new THREE.TorusGeometry(1.35, 0.24, 32, 128);
    const material = new THREE.MeshPhysicalMaterial({
      color: 0xd6a21c,
      metalness: 0.88,
      roughness: 0.12,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      reflectivity: 1,
      envMapIntensity: 1.45,
    });
    const ring = new THREE.Mesh(geometry, material);
    ring.position.set(0, 0, 0);
    ring.rotation.x = Math.PI * 0.63;
    ring.rotation.z = -0.08;
    scene.add(ring);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x160f07, 1.2));
    const key = new THREE.DirectionalLight(0xffffff, 4.4);
    key.position.set(1, 5, 5);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffe3a0, 1.8);
    fill.position.set(-4, 2, 4);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffffff, 0.9);
    rim.position.set(4, 1, 3);
    scene.add(rim);
    const clickAudio = new Audio(ringClickSound);
    clickAudio.preload = "auto";
    clickAudio.volume = 0.7;
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const idleSpeed = 0.00016;
    const idleRadians = 0.16;
    const baseX = Math.PI * 0.63;
    const baseZ = -0.08;
    const currentAngularVelocity = new THREE.Vector3(0, idleRadians, 0);
    const currentTargetAngularVelocity = new THREE.Vector3(0, idleRadians, 0);
    const nextTargetAngularVelocity = new THREE.Vector3(0, idleRadians, 0);
    const blendedTargetAngularVelocity = new THREE.Vector3();
    const desiredAngularVelocity = new THREE.Vector3();
    const impulseAxis = new THREE.Vector3();
    const rotationAxis = new THREE.Vector3();
    const deltaQuaternion = new THREE.Quaternion();
    const desiredQuaternion = new THREE.Quaternion();
    const desiredEuler = new THREE.Euler(0, 0, 0, "XYZ");
    const directionAxes = [
      new THREE.Vector3(1, 0.22, 0.12).normalize(),
      new THREE.Vector3(-1, 0.18, -0.16).normalize(),
      new THREE.Vector3(0.14, 1, 0.18).normalize(),
      new THREE.Vector3(-0.12, -1, 0.2).normalize(),
      new THREE.Vector3(0.15, 0.2, 1).normalize(),
      new THREE.Vector3(-0.18, 0.16, -1).normalize(),
      new THREE.Vector3(1, 1, 0.35).normalize(),
      new THREE.Vector3(-1, 1, 0.35).normalize(),
      new THREE.Vector3(1, -1, -0.35).normalize(),
      new THREE.Vector3(-1, -1, 0.35).normalize(),
    ];
    let idleAngle = performance.now() * idleSpeed;
    let lastTime = performance.now();
    let directionStartedAt = 0;
    let directionDuration = 1900;
    let previousCategory = -1;
    let nextPrepared = false;
    let hoverStrength = 0;
    let hovering = false;
    let freeMotion = false;
    let frame = 0;
    let running = true;
    let intersecting = true;
    const resize = () => {
      const width = host.clientWidth || 86;
      const height = host.clientHeight || 64;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const move = (event) => {
      if (matchMedia("(pointer: coarse)").matches) return;
      const box = host.getBoundingClientRect();
      const dx = event.clientX - (box.left + box.width / 2);
      const dy = event.clientY - (box.top + box.height / 2);
      const proximity = Math.max(0, 1 - Math.hypot(dx, dy) / 180);
      pointer.targetX = (dx / 180) * 0.12 * proximity;
      pointer.targetY = (dy / 180) * 0.08 * proximity;
    };
    const chooseTarget = (destination) => {
      let category;
      let attempts = 0;
      do {
        category = Math.floor(Math.random() * directionAxes.length);
        attempts++;
      } while (
        (category === previousCategory ||
          directionAxes[category].dot(currentTargetAngularVelocity) < -0.3) &&
        attempts < 12
      );
      previousCategory = category;
      destination
        .copy(directionAxes[category])
        .multiplyScalar(0.78 + Math.random() * 0.42);
    };
    const beginDirectionCycle = (time) => {
      currentTargetAngularVelocity.copy(nextTargetAngularVelocity);
      chooseTarget(nextTargetAngularVelocity);
      directionStartedAt = time;
      directionDuration = 1600 + Math.random() * 550;
      nextPrepared = false;
    };
    const enter = (event) => {
      if (event.pointerType !== "touch") {
        hovering = true;
        freeMotion = true;
        currentTargetAngularVelocity.copy(currentAngularVelocity);
        chooseTarget(nextTargetAngularVelocity);
        directionStartedAt = performance.now();
        directionDuration = 1600 + Math.random() * 550;
        nextPrepared = true;
      }
    };
    const leave = () => {
      hovering = false;
      freeMotion = true;
    };
    const activate = () => {
      clickAudio.currentTime = 0;
      clickAudio.play().catch(() => {});
      impulseAxis.set(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5,
      );
      if (impulseAxis.lengthSq() < 0.05) impulseAxis.set(0.4, 0.7, -0.3);
      impulseAxis.normalize();
      currentAngularVelocity.addScaledVector(impulseAxis, 0.62);
      freeMotion = true;
    };
    const keydown = (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activate();
      }
    };
    const render = (time) => {
      if (!running) return;
      const deltaMs = Math.min(50, Math.max(0, time - lastTime));
      const delta = deltaMs * 0.001;
      lastTime = time;
      idleAngle += idleSpeed * deltaMs;
      pointer.x += (pointer.targetX - pointer.x) * 0.045;
      pointer.y += (pointer.targetY - pointer.y) * 0.045;
      desiredEuler.set(baseX + pointer.y, idleAngle + pointer.x, baseZ);
      desiredQuaternion.setFromEuler(desiredEuler);
      if (hovering) {
        hoverStrength += (1 - hoverStrength) * (1 - Math.exp(-2.7 * delta));
        let progress = (time - directionStartedAt) / directionDuration;
        if (progress >= 0.75 && !nextPrepared) {
          chooseTarget(nextTargetAngularVelocity);
          nextPrepared = true;
        }
        if (progress >= 1) {
          beginDirectionCycle(time);
          progress = 0;
        }
        const blend = Math.max(0, Math.min(1, (progress - 0.72) / 0.28));
        const smoothBlend = blend * blend * (3 - 2 * blend);
        blendedTargetAngularVelocity.lerpVectors(
          currentTargetAngularVelocity,
          nextTargetAngularVelocity,
          smoothBlend,
        );
        desiredAngularVelocity
          .copy(blendedTargetAngularVelocity)
          .multiplyScalar(hoverStrength);
        desiredAngularVelocity.y += idleRadians * (1 - hoverStrength);
        currentAngularVelocity.lerp(
          desiredAngularVelocity,
          1 - Math.exp(-2.35 * delta),
        );
        freeMotion = true;
      } else if (freeMotion) {
        hoverStrength *= Math.exp(-1.75 * delta);
        currentAngularVelocity.x *= Math.exp(-2.05 * delta);
        currentAngularVelocity.z *= Math.exp(-2.05 * delta);
        currentAngularVelocity.y +=
          (idleRadians - currentAngularVelocity.y) *
          (1 - Math.exp(-1.5 * delta));
      }
      if (freeMotion) {
        const speed = currentAngularVelocity.length();
        if (speed > 0.0001) {
          rotationAxis.copy(currentAngularVelocity).normalize();
          deltaQuaternion.setFromAxisAngle(rotationAxis, speed * delta);
          ring.quaternion.multiply(deltaQuaternion);
        }
        const restoreRate = hovering ? 0.11 : 0.72;
        ring.quaternion.slerp(
          desiredQuaternion,
          1 - Math.exp(-restoreRate * delta),
        );
        if (
          !hovering &&
          hoverStrength < 0.018 &&
          Math.abs(currentAngularVelocity.x) < 0.012 &&
          Math.abs(currentAngularVelocity.z) < 0.012 &&
          ring.quaternion.angleTo(desiredQuaternion) < 0.018
        ) {
          ring.quaternion.copy(desiredQuaternion);
          currentAngularVelocity.set(0, idleRadians, 0);
          freeMotion = false;
        }
      } else {
        ring.quaternion.copy(desiredQuaternion);
      }
      ring.position.y = Math.sin(time * 0.0015) * 0.05;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };
    const syncRendering = () => {
      const shouldRun = !document.hidden && intersecting;
      if (shouldRun === running) return;
      running = shouldRun;
      cancelAnimationFrame(frame);
      if (running) {
        lastTime = performance.now();
        frame = requestAnimationFrame(render);
      }
    };
    const visibility = () => syncRendering();
    const viewportObserver = new IntersectionObserver(([entry]) => {
      intersecting = entry.isIntersecting;
      syncRendering();
    });
    viewportObserver.observe(host);
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    window.addEventListener("pointermove", move, { passive: true });
    host.addEventListener("pointerenter", enter);
    host.addEventListener("pointerleave", leave);
    host.addEventListener("click", activate);
    host.addEventListener("keydown", keydown);
    document.addEventListener("visibilitychange", visibility);
    resize();
    frame = requestAnimationFrame(render);
    return () => {
      running = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pointermove", move);
      host.removeEventListener("pointerenter", enter);
      host.removeEventListener("pointerleave", leave);
      host.removeEventListener("click", activate);
      host.removeEventListener("keydown", keydown);
      document.removeEventListener("visibilitychange", visibility);
      viewportObserver.disconnect();
      clickAudio.pause();
      clickAudio.currentTime = 0;
      geometry.dispose();
      material.dispose();
      environmentSource.dispose();
      environmentTarget.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);
  return (
    <div
      ref={mount}
      className="golden-ring-wrapper"
      role="button"
      tabIndex="0"
      aria-label="Play ring sound"
    >
      {fallback && (
        <svg className="golden-ring-fallback" viewBox="0 0 86 64">
          <ellipse
            cx="43"
            cy="32"
            rx="32"
            ry="12"
            fill="none"
            stroke="#e0ad1b"
            strokeWidth="8"
          />
          <ellipse
            cx="43"
            cy="29"
            rx="29"
            ry="8"
            fill="none"
            stroke="#ffe4a3"
            strokeWidth="2"
          />
        </svg>
      )}
    </div>
  );
}
