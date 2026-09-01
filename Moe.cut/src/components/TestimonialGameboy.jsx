import { useCallback, useEffect, useRef, useState } from "react";
import "./TestimonialGameboy.css";

const TESTIMONIALS = [
  {
    id: 1,
    client: "Barry Empire",
    tag: "@barry_empire",
    metric: "32.9K Followers",
    niche: "Creator",
    video: "/videos/testimonial1.mp4",
    review:
      "The visual pacing and color grading took our retention rates to another level. Best editor we've worked with.",
    link: "https://instagram.com",
  },
  {
    id: 2,
    client: "Sea Fdol",
    tag: "@sea.fdol",
    metric: "135K Followers",
    niche: "UGC",
    video: "/videos/testimonial2.mp4",
    review:
      "Incredible attention to sound design and dynamic cuts. Delivered everything ahead of schedule.",
    link: "https://instagram.com",
  },
  {
    id: 3,
    client: "Ayoub Copywriter",
    tag: "@ayoubcopywriter",
    metric: "50K Followers",
    niche: "Copywriting",
    video: "/videos/testimonial3.mp4",
    review:
      "Our engagement spiked by 40% on the very first reel campaign. Pure creative direction mastery.",
    link: "https://instagram.com",
  },
];

const padNumber = (number) => String(number).padStart(2, "0");

export default function TestimonialGameboy() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [failedVideos, setFailedVideos] = useState({});
  const [direction, setDirection] = useState("next");
  const videoRefs = useRef([]);
  const touchStart = useRef(null);
  const currentItem = TESTIMONIALS[currentIndex];

  const selectItem = useCallback((index, nextDirection = "next") => {
    setDirection(nextDirection);
    setCurrentIndex((index + TESTIMONIALS.length) % TESTIMONIALS.length);
  }, []);

  const handlePrev = useCallback(() => {
    setDirection("prev");
    setCurrentIndex((index) =>
      index === 0 ? TESTIMONIALS.length - 1 : index - 1,
    );
  }, []);

  const handleNext = useCallback(() => {
    setDirection("next");
    setCurrentIndex((index) =>
      index === TESTIMONIALS.length - 1 ? 0 : index + 1,
    );
  }, []);

  const openCurrentLink = useCallback(() => {
    if (currentItem.link) {
      window.open(currentItem.link, "_blank", "noopener,noreferrer");
    }
  }, [currentItem.link]);

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      video.muted = isMuted;
      if (index === currentIndex) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [currentIndex, isMuted]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        handlePrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        handleNext();
      } else if (event.key.toLowerCase() === "m") {
        setIsMuted((muted) => !muted);
      } else if (["c", "v"].includes(event.key.toLowerCase())) {
        openCurrentLink();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, openCurrentLink]);

  const handleTouchStart = (event) => {
    touchStart.current = event.changedTouches[0].clientX;
  };

  const handleTouchEnd = (event) => {
    if (touchStart.current === null) return;
    const distance = event.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(distance) > 45) {
      if (distance > 0) handlePrev();
      else handleNext();
    }
    touchStart.current = null;
  };

  return (
    <section className="testomina-gam-boy-section" aria-labelledby="testimonials-title">
      <div className="gameboy-section-heading">
        <p>CLIENT TRANSMISSIONS / 2026</p>
        <h2 id="testimonials-title">Reviews, on replay.</h2>
      </div>

      <div className="gameboy-top-pills" aria-label="Choose a testimonial">
        {TESTIMONIALS.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => selectItem(index, index < currentIndex ? "prev" : "next")}
            className={`gameboy-pill-btn ${index === currentIndex ? "active" : ""}`}
            aria-pressed={index === currentIndex}
          >
            <span>{padNumber(index + 1)}</span> {item.client}
          </button>
        ))}
      </div>

      <div className="gameboy-chassis">
        <aside className="gameboy-side-guide left-guide" aria-hidden="true">
          <span>USE ARROW KEYS TO MOVE</span>
          <div className="dpad-guide-icon"><span>PREV</span><i /><span>NEXT</span></div>
          <small>← / →</small>
        </aside>

        <div className="gameboy-housing">
          <div className="gameboy-speaker-slits gameboy-speaker-slits-top" aria-hidden="true" />
          <div className="gameboy-screen-bezel">
            <div className="battery-indicator" aria-hidden="true">
              <i className="battery-led" /><span>BATTERY</span>
            </div>

            <div
              className="screen-display"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <div className="screen-video-container">
                {TESTIMONIALS.map((item, index) => (
                  <div
                    className={`gameboy-reel ${index === currentIndex ? "active" : ""} direction-${direction}`}
                    key={item.id}
                    aria-hidden={index !== currentIndex}
                  >
                    <div className="reel-placeholder" aria-hidden="true">
                      <span>MO/CUT</span><small>CLIENT REEL {padNumber(index + 1)}</small>
                    </div>
                    {!failedVideos[item.id] && (
                      <video
                        ref={(element) => { videoRefs.current[index] = element; }}
                        src={item.video}
                        autoPlay={index === currentIndex}
                        loop
                        muted={isMuted}
                        playsInline
                        preload={index === currentIndex ? "auto" : "metadata"}
                        onError={() => setFailedVideos((failed) => ({ ...failed, [item.id]: true }))}
                        className="screen-video-element"
                      />
                    )}
                    <span className="reel-label">PLAYING / {item.tag}</span>
                  </div>
                ))}
              </div>

              <div className="screen-status-bar">
                <span className="gameboy-logo-text">DOT MATRIX WITH STEREO SOUND</span>
                <span className="version-code">v.05.13.03</span>
              </div>

              <div className="screen-terminal-info" aria-live="polite">
                <div className="terminal-header">
                  <div>
                    <span className="terminal-prompt">&gt;</span>
                    <strong>{currentItem.client.toUpperCase()}</strong>
                  </div>
                  <span className="terminal-index">#{padNumber(currentIndex + 1)} / {padNumber(TESTIMONIALS.length)}</span>
                </div>
                <p className="terminal-handle">{currentItem.tag}</p>
                <p className="terminal-metric"><span>{currentItem.metric}</span><b>{currentItem.niche}</b></p>
                <blockquote>“{currentItem.review}”</blockquote>
              </div>
            </div>

            <div className="bezel-brand"><strong>GAME BOY</strong><em>™</em><span>MO/CUT edition</span></div>
          </div>

          <div className="gameboy-controls">
            <div className="gameboy-dpad" aria-label="Testimonial navigation">
              <span className="dpad-arm dpad-up" aria-hidden="true" />
              <button type="button" className="dpad-arm dpad-left" onClick={handlePrev} aria-label="Previous testimonial"><i /></button>
              <span className="dpad-center" aria-hidden="true" />
              <button type="button" className="dpad-arm dpad-right" onClick={handleNext} aria-label="Next testimonial"><i /></button>
              <span className="dpad-arm dpad-down" aria-hidden="true" />
            </div>

            <div className="gameboy-action-buttons">
              <div><button type="button" className="round-action-btn" onClick={() => setIsMuted((muted) => !muted)} aria-label={isMuted ? "Turn video sound on" : "Mute video"}>C</button><span>{isMuted ? "SOUND" : "MUTE"}</span></div>
              <div><button type="button" className="round-action-btn" onClick={openCurrentLink} aria-label={`Visit ${currentItem.client}`}>V</button><span>VISIT</span></div>
            </div>
          </div>

          <div className="gameboy-utility-row" aria-hidden="true"><span>SELECT</span><i /><span>START</span><i /></div>
          <div className="gameboy-speaker-slits" aria-hidden="true" />
        </div>

        <aside className="gameboy-side-guide right-guide" aria-hidden="true">
          <span>USE M &amp; V FOR SOUND &amp; LINK</span>
          <div className="action-guide-icon"><span>SOUND</span><i /><i /><span>VISIT</span></div>
          <small>M / V</small>
        </aside>
      </div>
    </section>
  );
}
