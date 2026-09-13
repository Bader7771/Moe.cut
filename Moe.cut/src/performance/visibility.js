// One scroll read phase for all effects. Sticky panels can stay intersecting
// while a later opaque panel covers them, so intersection alone is insufficient.
const entries = new Set();
let frame = 0;
function update() {
  frame = 0;
  const changes = [];
  for (const entry of entries) {
    let visible = entry.intersecting && !document.hidden;
    if (visible && entry.panel?.nextElementSibling) {
      const cover = entry.panel.nextElementSibling.getBoundingClientRect();
      const bounds = entry.node.getBoundingClientRect();
      if (cover.top <= Math.max(0, bounds.top) && cover.bottom >= Math.min(innerHeight, bounds.bottom)
        && cover.left <= bounds.left && cover.right >= bounds.right) visible = false;
    }
    if (visible !== entry.visible) { entry.visible = visible; changes.push([entry, visible]); }
  }
  for (const [entry, visible] of changes) if (entries.has(entry)) entry.callback(visible);
}
function schedule() { if (!frame) frame = requestAnimationFrame(update); }
export function observeActivity(node, callback, rootMargin = '0px') {
  const entry = { node, callback, panel: node.closest('.hero-layer, .stacked-panel'), intersecting: false, visible: undefined };
  const observer = new IntersectionObserver(([result]) => { entry.intersecting = result.isIntersecting; schedule(); }, { rootMargin });
  if (!entries.size) {
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule, { passive: true });
    document.addEventListener('visibilitychange', schedule);
  }
  entries.add(entry); observer.observe(node);
  return () => {
    observer.disconnect(); entries.delete(entry);
    if (!entries.size) {
      removeEventListener('scroll', schedule); removeEventListener('resize', schedule);
      document.removeEventListener('visibilitychange', schedule);
      cancelAnimationFrame(frame); frame = 0;
    }
  };
}
