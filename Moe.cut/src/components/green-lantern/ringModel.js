import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export const ringModelUrl = new URL('../../assets/3D ring/green_lantern_ring.glb', import.meta.url).href;

export function disposeRingResources(root) {
  const geometries = new Set(), materials = new Set(), textures = new Set(), images = new Set();
  root.traverse(object => {
    if (object.geometry) geometries.add(object.geometry);
    const list = Array.isArray(object.material) ? object.material : object.material ? [object.material] : [];
    list.forEach(material => {
      materials.add(material);
      Object.values(material).forEach(value => { if (value?.isTexture) textures.add(value); });
    });
  });
  geometries.forEach(geometry => geometry.dispose());
  materials.forEach(material => material.dispose());
  textures.forEach(texture => {
    if (texture.source?.data) images.add(texture.source.data);
    texture.dispose();
  });
  // GLTFLoader uses ImageBitmap where supported; GPU texture disposal does not close it.
  images.forEach(image => image.close?.());
}

export function prepareRingModel(gltf) {
  const artifact = new THREE.Group();
  artifact.name = 'Downloaded Green Lantern ring';
  // This asset's FBX/Sketchfab wrappers contain opposing 100x/.01x unit transforms
  // and an arbitrary display tilt. Normalize the named source root, keeping both meshes intact.
  const source = gltf.scene.getObjectByName('Ring');
  if (!source) { disposeRingResources(gltf.scene); throw new Error('Ring model root is missing'); }
  source.removeFromParent();
  source.matrixAutoUpdate = true;
  source.position.set(0, 0, 0);
  source.rotation.set(-Math.PI / 2, 0, 0);
  source.scale.setScalar(1);
  artifact.add(source);
  artifact.updateMatrixWorld(true);
  const originalBounds = new THREE.Box3().setFromObject(source);
  const size = originalBounds.getSize(new THREE.Vector3());
  if (!Number.isFinite(size.y) || size.y <= 0) {
    disposeRingResources(artifact); throw new Error('Ring model has invalid bounds');
  }
  source.scale.setScalar(2.75 / size.y);
  artifact.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(source);
  const center = bounds.getCenter(new THREE.Vector3());
  source.position.sub(center);
  artifact.updateMatrixWorld(true);
  const glowingFace = source.getObjectByName('Ring_glow_0');
  const focus = glowingFace ? new THREE.Box3().setFromObject(glowingFace).getCenter(new THREE.Vector3()) : new THREE.Vector3();
  const materials = new Set(), textures = new Set();
  source.traverse(object => {
    if (!object.isMesh) return;
    object.castShadow = true; object.receiveShadow = true;
    const list = Array.isArray(object.material) ? object.material : [object.material];
    list.forEach(material => {
      materials.add(material);
      Object.values(material).forEach(value => { if (value?.isTexture) textures.add(value); });
    });
  });
  const emissiveMaterials = [...materials].filter(material => material.emissive?.getHex() && material.emissiveIntensity > 0);
  const emission = emissiveMaterials.map(material => material.emissiveIntensity);
  let disposed = false;
  return {
    artifact, focus, textures, emissiveMaterials, animations: gltf.animations,
    bounds: new THREE.Box3().setFromObject(artifact),
    setEnergy(multiplier) {
      emissiveMaterials.forEach((material, index) => { material.emissiveIntensity = emission[index] * multiplier; });
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      disposeRingResources(artifact);
    },
  };
}

export async function loadRingModel({ signal } = {}) {
  const response = await fetch(ringModelUrl, { signal });
  if (!response.ok) throw new Error(`Ring model request failed: ${response.status}`);
  const data = await response.arrayBuffer();
  signal?.throwIfAborted();
  // All seven textures are embedded in this GLB. A local base path also preserves relative
  // dependencies if a later version of the file references external resources.
  const gltf = await new GLTFLoader().parseAsync(data, ringModelUrl.slice(0, ringModelUrl.lastIndexOf('/') + 1));
  if (signal?.aborted) { disposeRingResources(gltf.scene); signal.throwIfAborted(); }
  return prepareRingModel(gltf);
}

export function alignRingFocus(artifact, focus, target = new THREE.Vector3()) {
  target.copy(focus).applyQuaternion(artifact.quaternion);
  artifact.position.set(-target.x, -target.y, -target.z);
}
