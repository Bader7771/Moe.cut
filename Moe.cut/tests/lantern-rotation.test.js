import test from 'node:test';
import assert from 'node:assert/strict';
import { createScrollRotation } from '../src/components/green-lantern/scrollRotation.js';

function settle(rotation, fps = 60) {
  for (let i = 0; i < fps * 3 && !rotation.settled; i++) rotation.step(1 / fps);
  assert.equal(rotation.settled, true);
  return rotation.angle;
}

test('scroll rotation follows displacement and comes to a complete rest', () => {
  const rotation = createScrollRotation();
  rotation.add(200);
  assert.ok(rotation.step(1 / 60) > 0);
  assert.ok(Math.abs(settle(rotation) - .9) < 1e-9);
  const resting = rotation.angle;
  for (let i = 0; i < 120; i++) rotation.step(1 / 60);
  assert.equal(rotation.angle, resting);
  rotation.add(-100);
  assert.ok(settle(rotation) < resting);
});

test('reversal sheds pending forward travel and settles in the opposite direction', () => {
  const rotation = createScrollRotation();
  rotation.add(500);
  for (let i = 0; i < 5; i++) rotation.step(1 / 60);
  const before = rotation.angle;
  rotation.add(-150);
  assert.ok(settle(rotation) < before);
});

test('damping is consistent across frame rates and handles tiny scroll inputs', () => {
  const slow = createScrollRotation(), fast = createScrollRotation(), constrained = createScrollRotation();
  slow.add(300); fast.add(300); constrained.add(300);
  for (let i = 0; i < 15; i++) slow.step(1 / 30);
  for (let i = 0; i < 60; i++) fast.step(1 / 120);
  for (let i = 0; i < 5; i++) constrained.step(1 / 10);
  assert.ok(Math.abs(slow.angle - fast.angle) < 1e-9);
  assert.ok(Math.abs(slow.angle - constrained.angle) < 1e-9);
  const tiny = createScrollRotation();
  for (let i = 0; i < 10; i++) tiny.add(.5);
  assert.ok(Math.abs(settle(tiny) - .0225) < 1e-9);
});

test('reduced-motion stop cancels residual movement and reset clears activation state', () => {
  const rotation = createScrollRotation();
  rotation.add(300); rotation.step(1 / 60);
  rotation.stop();
  const angle = rotation.angle;
  assert.equal(rotation.settled, true);
  assert.equal(rotation.step(1 / 30), angle);
  rotation.reset();
  assert.equal(rotation.angle, 0);
  assert.equal(rotation.settled, true);
});
