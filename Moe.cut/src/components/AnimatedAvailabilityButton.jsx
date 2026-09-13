import "./AnimatedAvailabilityButton.css";

const circles = Array.from({ length: 12 }, (_, index) => 12 - index);

export default function AnimatedAvailabilityButton() {
  return (
    <div className="availability-button-shell">
      <a className="uiverse" href="mailto:hello@mo-cut-motion.com">
        <span className="wrapper">
          <span className="label">Request availability</span>
          {circles.map((circle) => (
            <span
              aria-hidden="true"
              className={`circle circle-${circle}`}
              key={circle}
            />
          ))}
        </span>
      </a>
    </div>
  );
}
