export default function HaloFallback() {
  return (
    <svg
      className="halo-fallback"
      viewBox="0 0 800 650"
      role="img"
      aria-label="Static twisted film-loop sculpture"
    >
      <defs>
        <path
          id="fallback-loop"
          d="M143 356C121 190 286 105 466 139c151 29 236 156 152 276-81 116-284 126-402 37-78-59-75-154-17-218"
        />
      </defs>
      <use
        href="#fallback-loop"
        fill="none"
        stroke="#000"
        strokeWidth="54"
        strokeDasharray="7 7"
      />
      <use
        href="#fallback-loop"
        fill="none"
        stroke="#fff"
        strokeWidth="28"
        strokeDasharray="2 12"
      />
      <use href="#fallback-loop" fill="none" stroke="#000" strokeWidth="2" />
    </svg>
  );
}
