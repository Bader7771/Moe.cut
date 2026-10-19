export function scrollToSection(event) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const hash = event.currentTarget.hash;
  const target = hash && document.querySelector(hash);
  if (!target) return;
  event.preventDefault();
  if (window.location.hash !== hash) window.history.pushState(null, "", hash);
  // The navbar belongs to the Hero and scrolls away; there is no fixed header
  // to subtract from the destination's position.
  target.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
  const focusTarget = target.matches("h1, h2") ? target : target.querySelector("h1, h2") || target;
  if (!focusTarget.hasAttribute("tabindex")) {
    focusTarget.setAttribute("tabindex", "-1");
    focusTarget.addEventListener("blur", () => focusTarget.removeAttribute("tabindex"), { once: true });
  }
  focusTarget.focus({ preventScroll: true });
}
