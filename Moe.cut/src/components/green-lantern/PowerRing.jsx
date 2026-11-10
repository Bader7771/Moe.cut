import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { loadRingModel, alignRingFocus } from './ringModel';
import { createScrollRotation } from './scrollRotation';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// One locally loaded GLB instance persists through portal, flight, and scroll rotation.
export default function PowerRing({ motionState }) {
  const host = useRef(null);
  const [status, setStatus] = useState('loading');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const mount = host.current;
    setStatus('loading');
    const loading = new AbortController();
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' }); }
    catch { setStatus('error'); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, innerWidth < 600 ? 1.5 : 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    mount.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(33, 1, .1, 50);
    camera.position.set(0, 0, 9);
    camera.lookAt(0, 0, 0);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const environment = pmrem.fromScene(room, .04);
    scene.environment = environment.texture;
    room.dispose(); pmrem.dispose();
    let model;
    const artifact = new THREE.Group();
    artifact.rotation.set(.9, -.2, -.08);
    const focus = new THREE.Vector3();
    scene.add(artifact);
    const focusWorld = new THREE.Vector3();
    scene.environmentIntensity = .5;
    scene.add(new THREE.HemisphereLight('#dce9ff', '#0b1419', .65));
    const key = new THREE.DirectionalLight('#fff6e8', 2.1);
    key.position.set(-3, 5, 5);
    key.castShadow = true;
    const shadowSize = innerWidth < 600 ? 512 : 1024;
    key.shadow.mapSize.set(shadowSize, shadowSize);
    Object.assign(key.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: .1, far: 15 });
    key.shadow.bias = -.001; key.shadow.normalBias = .025;
    scene.add(key);
    const rimLight = new THREE.DirectionalLight('#b9dcff', 2);
    rimLight.position.set(4, 1, -3); scene.add(rimLight);
    const fill = new THREE.DirectionalLight('#eefff5', .65);
    fill.position.set(1, -2, 4); scene.add(fill);
    const motion=matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0, last = 0, disposed = false, contextLost = false;
    let lastScrollY = window.scrollY;
    let mode = 'portal';
    let flightStartTurn = 0;
    const pointer = { x: 0, y: 0 };
    const scrollRotation = createScrollRotation();
    const flightPose = new THREE.Quaternion();
    const axialRotation = new THREE.Quaternion();
    const axis = new THREE.Vector3(.12, 1, .08).normalize();

    const updateMode = () => {
      const state = motionState?.current;
      const nextMode = state?.docked ? 'docked' : state?.flying ? 'flight' : 'portal';
      if (nextMode === mode) return;
      if (nextMode === 'flight' || (mode === 'portal' && nextMode === 'docked')) {
        flightPose.copy(artifact.quaternion);
        flightStartTurn = state?.turn || 0;
        scrollRotation.reset();
        pointer.x = pointer.y = 0;
      }
      if (nextMode === 'portal') scrollRotation.reset();
      mode = nextMode;
    };
    const draw = (time = performance.now()) => {
      frame = 0;
      if (disposed || contextLost || document.hidden || !model) return;
      const state = motionState?.current;
      const dt = last ? Math.min(1, (time - last) / 1000) : 1 / 60;
      last = time;
      updateMode();
      if (mode === 'portal') {
        const t = motion.matches ? 0 : time * .001;
        artifact.rotation.set(.9 + pointer.y * .06, -.20 + Math.sin(t * .38) * .10 + pointer.x * .12, -.08);
        model.setEnergy(1 + Math.sin(t * 1.5) * .08);
      } else {
        if (!motion.matches) {
          const turn = (state?.turn || 0) - flightStartTurn + scrollRotation.step(dt);
          axialRotation.setFromAxisAngle(axis, turn);
          artifact.quaternion.copy(flightPose).multiply(axialRotation);
        }
        // The focal anchor stays fixed; the emerald retains a steady light.
        model.setEnergy(1);
      }
      alignRingFocus(artifact, focus, focusWorld);
      renderer.render(scene, camera);
      if (!motion.matches && (mode !== 'docked' || !scrollRotation.settled)) {
        frame = requestAnimationFrame(draw);
      }
    };
    const wake = () => {
      if (disposed || contextLost) return;
      // Capture the flight baseline at its trigger, even when a render is already queued
      // or the GLB is still decoding. A slow first frame must not consume part of the spin.
      updateMode();
      if (document.hidden || frame) return;
      last = performance.now();
      frame = requestAnimationFrame(draw);
    };
    if (motionState) motionState.current.invalidate = wake;
    const resize = () => {
      const width = mount.clientWidth, height = mount.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      wake();
    };
    const sync = () => {
      cancelAnimationFrame(frame); frame = 0;
      lastScrollY = window.scrollY;
      if (motion.matches) scrollRotation.stop();
      wake();
    };
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastScrollY;
      lastScrollY = y;
      if (!motion.matches && motionState?.current.docked && delta) {
        scrollRotation.add(delta);
        wake();
      }
    };
    const move = event => {
      if (motion.matches || motionState?.current.docked || motionState?.current.flying) return;
      const rect = mount.getBoundingClientRect();
      pointer.x = (event.clientX - rect.left) / rect.width - .5;
      pointer.y = (event.clientY - rect.top) / rect.height - .5;
    };
    const reset = () => { pointer.x = pointer.y = 0; };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    mount.addEventListener('pointermove', move);
    mount.addEventListener('pointerleave', reset);
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', sync);
    motion.addEventListener('change', sync);
    const lost = event => {
      event.preventDefault(); contextLost = true;
      cancelAnimationFrame(frame); frame = 0; setStatus('error');
    };
    renderer.domElement.addEventListener('webglcontextlost', lost);
    resize();
    loadRingModel({ signal: loading.signal }).then(loaded => {
      if (disposed || contextLost) { loaded.dispose(); return; }
      model = loaded;
      artifact.add(model.artifact);
      focus.copy(model.focus);
      model.textures.forEach(texture => { texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy()); });
      setStatus('ready');
      wake();
    }).catch(error => {
      if (!disposed && error.name !== 'AbortError') setStatus('error');
    });
    return () => {
      disposed = true; loading.abort(); cancelAnimationFrame(frame); observer.disconnect();
      if (motionState?.current.invalidate === wake) delete motionState.current.invalidate;
      mount.removeEventListener('pointermove', move);
      mount.removeEventListener('pointerleave', reset);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', sync);
      motion.removeEventListener('change', sync);
      renderer.domElement.removeEventListener('webglcontextlost', lost);
      model?.dispose(); key.shadow.dispose();
      environment.dispose(); renderer.dispose(); renderer.domElement.remove();
    };
  },[motionState, attempt]);
  return <div className="lantern-artifact" data-model-state={status} ref={host}
    role={status === 'ready' ? 'img' : undefined} aria-busy={status === 'loading'}
    aria-label={status === 'ready' ? 'Green Lantern power ring with its original metallic green finish and luminous emblem' : undefined}>
    {status === 'loading' && <span className="lantern-model-status" role="status">Loading power ring…</span>}
    {status === 'error' && <div className="lantern-model-status" role="status">
      <span>Power ring unavailable.</span>
      <button type="button" onClick={() => setAttempt(value => value + 1)}>Retry model</button>
    </div>}
  </div>;
}
