// Critically damped angular response, independent of rendering frequency.
// The target follows real page displacement; no synthetic idle velocity is added.
export function createScrollRotation() {
  let angle = 0;
  let target = 0;
  let velocity = 0;
  let direction = 0;
  return {
    get angle() { return angle; },
    get settled() { return angle === target && velocity === 0; },
    add(delta) {
      if (!Number.isFinite(delta) || delta === 0) return;
      const nextDirection = Math.sign(delta);
      // Discard pending travel in the old direction on reversal, retaining physical momentum.
      if (direction && direction !== nextDirection) target = angle;
      direction = nextDirection;
      target += Math.max(-600, Math.min(600, delta)) * .0045;
    },
    step(seconds) {
      const dt = Math.min(1, Math.max(0, seconds));
      const frequency = 18;
      const offset = angle - target;
      const impulse = velocity + frequency * offset;
      const decay = Math.exp(-frequency * dt);
      angle = target + (offset + impulse * dt) * decay;
      velocity = (velocity - frequency * impulse * dt) * decay;
      if (Math.abs(angle - target) < .0001 && Math.abs(velocity) < .001) {
        angle = target;
        velocity = 0;
      }
      return angle;
    },
    stop() { target = angle; velocity = 0; direction = 0; },
    reset() { angle = target = velocity = direction = 0; },
  };
}
