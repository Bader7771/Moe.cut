import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { prepareRingModel, alignRingFocus } from '../src/components/green-lantern/ringModel.js';

const asset = new URL('../src/assets/3D ring/green_lantern_ring.glb', import.meta.url);
async function readModel() {
  const bytes = await readFile(asset);
  const loader = new GLTFLoader();
  // Node has no image decoder. Real image decoding and GPU maps are verified in browser QA;
  // retain all GLTF texture references here while testing the actual downloaded meshes.
  loader.register(() => ({ name: 'node-test-textures', loadTexture(index) {
    const texture = new THREE.Texture(); texture.name = `embedded-${index}`; return Promise.resolve(texture);
  } }));
  return loader.parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '');
}

test('downloaded GLB retains both authored meshes, all material maps, and original emission', async () => {
  const gltf = await readModel();
  const model = prepareRingModel(gltf);
  const meshes = [];
  model.artifact.traverse(object => { if (object.isMesh) meshes.push(object); });
  assert.equal(meshes.length, 2);
  assert.equal(meshes.reduce((count, mesh) => count + mesh.geometry.index.count / 3, 0), 17856);
  const body = meshes.find(mesh => mesh.material.name === 'ring');
  const glow = meshes.find(mesh => mesh.material.name === 'glow');
  for (const mesh of meshes) for (const map of ['map', 'normalMap', 'aoMap', 'roughnessMap', 'metalnessMap']) assert.ok(mesh.material[map]);
  assert.ok(glow.material.emissiveMap);
  assert.equal(body.material.metalness, .9349398283053398);
  assert.equal(glow.material.emissiveIntensity, 3.762229337995918);
  model.setEnergy(1.08); model.setEnergy(1);
  assert.equal(glow.material.emissiveIntensity, 3.762229337995918);
  assert.equal(model.animations.length, 0);
  assert.ok(model.bounds.getCenter(new THREE.Vector3()).length() < 1e-6);
  assert.ok(Math.abs(model.bounds.getSize(new THREE.Vector3()).y - 2.75) < 1e-6);
  model.dispose();
});

test('downloaded ring remains centered and framed through a full rotation at responsive aspects', async () => {
  const model = prepareRingModel(await readModel());
  const camera = new THREE.PerspectiveCamera(33, 1, .1, 50);
  camera.position.set(0, 0, 9); camera.lookAt(0, 0, 0); camera.updateMatrixWorld();
  for (const aspect of [520 / 480, 445 / 414, 335 / 304, 148 / 125]) {
    camera.aspect = aspect; camera.updateProjectionMatrix();
    for (let i = 0; i < 24; i++) {
      model.artifact.rotation.set(.9, -.2, -.08);
      model.artifact.rotateOnAxis(new THREE.Vector3(.12, 1, .08).normalize(), i / 24 * Math.PI * 2);
      alignRingFocus(model.artifact, model.focus); model.artifact.updateMatrixWorld(true);
      const projected = model.focus.clone().applyMatrix4(model.artifact.matrixWorld).project(camera);
      assert.ok(Math.abs(projected.x) < 1e-7 && Math.abs(projected.y) < 1e-7);
      model.artifact.traverse(object => {
        if (!object.geometry) return;
        const positions = object.geometry.getAttribute('position');
        const projection = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse).multiply(object.matrixWorld);
        const vertex = new THREE.Vector3();
        for (let j = 0; j < positions.count; j++) {
          vertex.fromBufferAttribute(positions, j).applyMatrix4(projection);
          assert.ok(Math.abs(vertex.x) < .98 && Math.abs(vertex.y) < .98, `clipping at angle ${i}, aspect ${aspect}: ${vertex.toArray()}`);
        }
      });
    }
  }
  model.dispose();
});

test('downloaded model disposes geometry, materials, and shared textures exactly once', async () => {
  const model = prepareRingModel(await readModel());
  const resources = new Map();
  model.artifact.traverse(object => {
    for (const resource of [object.geometry, object.material, ...Object.values(object.material || {}).filter(value => value?.isTexture)]) {
      if (!resource || resources.has(resource)) continue;
      resources.set(resource, 0);
      resource.addEventListener('dispose', () => resources.set(resource, resources.get(resource) + 1));
    }
  });
  model.dispose(); model.dispose();
  assert.ok([...resources.values()].every(count => count === 1));
});
