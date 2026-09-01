export default function InteractionLabel({ interacted }) {
  return (
    <div
      className={`interaction-label ${interacted ? "used" : ""}`}
      aria-hidden="true"
    >
      <i />
      DRAG / TAP THE LOOP
    </div>
  );
}
