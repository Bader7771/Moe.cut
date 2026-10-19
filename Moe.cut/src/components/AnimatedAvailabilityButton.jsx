import "./AnimatedAvailabilityButton.css";
import { siteContent } from "../data/siteContent";

const circles = Array.from({ length: 12 }, (_, index) => 12 - index);
const workRequestUrl = new URL(siteContent.contact.whatsapp);
workRequestUrl.searchParams.set("text", "Hello! I'm interested in working with you. I'd like to discuss a potential project or collaboration.");

export default function AnimatedAvailabilityButton() {
  return (
    <div className="availability-button-shell">
      <a className="uiverse" href={workRequestUrl.href} target="_blank" rel="noopener noreferrer">
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
