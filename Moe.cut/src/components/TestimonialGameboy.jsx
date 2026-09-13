import { useCallback, useEffect, useRef, useState } from "react";
import "./TestimonialGameboy.css";
import GameBoy from "./GameBoy";

const padNumber = (number) => String(number).padStart(2, "0");

function PreviewVideo({ src, visible }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (visible) video.play().catch(() => {});
    else video.pause();
  }, [src, visible]);

  return (
    <video
      ref={videoRef}
      src={src}
      className="side-preview-video"
      autoPlay={visible}
      muted
      playsInline
      loop
      preload="metadata"
      onTimeUpdate={({ currentTarget: video }) => {
        if (video.currentTime >= 10) video.currentTime = 0;
      }}
    />
  );
}

export default function TestimonialGameboy() {
  const [testimonials, setTestimonials] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const sectionRef = useRef(null);
  const transitionRef = useRef(null);
  const [movement, setMovement] = useState(0);
  const [previewCursor, setPreviewCursor] = useState(0);
  const transitionTimer = useRef(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [pressed, setPressed] = useState('');
  const pressTimer = useRef(null);
  const pulse = useCallback(key => {
    setPressed(key);
    clearTimeout(pressTimer.current);
    pressTimer.current = setTimeout(() => setPressed(''), 180);
  }, []);
  const toggleMute = useCallback(() => { setMuted(value => !value); pulse('c'); }, [pulse]);
  const togglePlayback = useCallback(() => { setPlaying(value => !value); pulse('v'); }, [pulse]);
  useEffect(() => () => { clearTimeout(pressTimer.current); clearTimeout(transitionTimer.current); }, []);

  const currentIndex = Math.max(0, testimonials.findIndex(item => item._id === selectedId));
  const activeTestimonial = testimonials[currentIndex];

  useEffect(() => {
    const controller = new AbortController();
    let pending = false;
    const refresh = async () => {
      if (pending || document.hidden || transitionRef.current) return;
      pending = true;
      try {
        const response = await fetch('/api/testimonials', { signal: controller.signal, cache: 'no-store' });
        if (!response.ok) throw new Error('Unable to load testimonials');
        const data = await response.json();
        if (transitionRef.current) return;
        const validTestimonials = data.filter(item => item.title && item.video);
        setTestimonials(validTestimonials);
        setSelectedId(id => validTestimonials.some(item => item._id === id) ? id : validTestimonials[0]?._id ?? null);
        setLoadError(false);
      } catch (error) {
        if (error.name !== 'AbortError') setLoadError(true);
      } finally { pending = false; if (!controller.signal.aborted) setLoading(false); }
    };
    refresh();
    const interval = window.setInterval(refresh, 30000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      controller.abort();
      clearInterval(interval);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);

  const finishTransition = useCallback(() => {
    const transition = transitionRef.current;
    if (!transition) return;
    setSelectedId(transition.target._id);
    setPreviewCursor(cursor => cursor + transition.offset);
    setMovement(0);
    clearTimeout(transitionTimer.current);
    transitionRef.current = null;
  }, []);
  const move = useCallback(offset => {
    if (testimonials.length < 2 || transitionRef.current || !offset) return;
    const index = ((currentIndex + offset) % testimonials.length + testimonials.length) % testimonials.length;
    if (index === currentIndex) return;
    pulse(offset < 0 ? 'left' : 'right');
    const transition = { target: testimonials[index], offset };
    transitionRef.current = transition;
    setMovement(offset);
    transitionTimer.current = setTimeout(finishTransition,
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 520);
  }, [testimonials, currentIndex, pulse, finishTransition]);
  const selectItem = useCallback(index => move(index - currentIndex), [move, currentIndex]);
  const handlePrev = useCallback(() => move(-1), [move]);
  const handleNext = useCallback(() => move(1), [move]);

  useEffect(() => {
    const handleKeyDown = event => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])')) return;
      const rect = sectionRef.current?.getBoundingClientRect();
      if (!rect || rect.bottom < 0 || rect.top > window.innerHeight) return;
      if (event.key === 'ArrowLeft') { event.preventDefault(); handlePrev(); }
      else if (event.key === 'ArrowRight') { event.preventDefault(); handleNext(); }
      else if (!event.repeat && ['m', 'c'].includes(event.key.toLowerCase())) { event.preventDefault(); toggleMute(); }
      else if (!event.repeat && event.key.toLowerCase() === 'v') { event.preventDefault(); togglePlayback(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, toggleMute, togglePlayback]);

  return (
    <section ref={sectionRef} className="testomina-gam-boy-section" aria-labelledby="testimonials-title">
      <div className="gameboy-section-heading">
        <p>CLIENT TRANSMISSIONS / 2026</p>
        <h2 id="testimonials-title">Reviews, on replay.</h2>
      </div>

      <div className="gameboy-top-pills" aria-label="Choose a testimonial">
        {testimonials.map((item, index) => (
          <button
            key={item._id}
            type="button"
            onClick={() => selectItem(index)}
            className={`gameboy-pill-btn ${index === currentIndex ? "active" : ""}`}
            aria-pressed={index === currentIndex}
          >
            <span>{padNumber(index + 1)}</span> {item.title}
          </button>
        ))}
      </div>

      <div className={`testimonials-container ${movement ? 'is-moving' : ''}`} role="region" aria-roledescription="carousel" aria-label="Client video testimonials">
        {!loading && !loadError && testimonials.length > 1 && Array.from({ length: 2 * Math.max(4, Math.abs(movement) + 2) + 1 }, (_, index) => index - Math.max(4, Math.abs(movement) + 2)).map(offset => {
          const item = testimonials[((currentIndex + offset) % testimonials.length + testimonials.length) % testimonials.length];
          const position = offset - movement;
          const visible = Math.abs(position) <= 2 && position !== 0;
          return (
            <button key={previewCursor + offset} type="button"
              className={`side-card-wrapper ${Math.abs(position) >= 2 ? 'outer-card' : ''}`}
              style={{ '--position': position, '--side': Math.sign(position), opacity: visible ? undefined : 0 }}
              onTransitionEnd={event => {
                if (event.target === event.currentTarget && event.propertyName === 'transform') finishTransition();
              }}
              onClick={() => move(offset)} tabIndex={visible && !movement ? 0 : -1}
              aria-hidden={!visible} aria-label={`Watch ${item.title}`} disabled={!!movement || !visible}>
              <PreviewVideo src={item.video} visible={visible} />
              <span className="side-preview-title">{item.title}</span>
            </button>
          );
        })}
        <div className="gameboy-wrapper">
          {loading ? <p role="status">Loading testimonials...</p>
            : loadError ? <p role="alert">Unable to load testimonials</p>
            : !activeTestimonial ? <p>No testimonials yet.</p>
            : <GameBoy activeTestimonial={activeTestimonial} onPrev={handlePrev} onNext={handleNext}
                muted={muted} playing={playing} onToggleMute={toggleMute} onTogglePlayback={togglePlayback}
                onPlayingChange={setPlaying} pressed={pressed} />}
        </div>
      </div>
      <p className="gameboy-now-playing" aria-live="polite">{activeTestimonial ? `${padNumber(currentIndex + 1)} / ${padNumber(testimonials.length)} — ${activeTestimonial.title}` : ''}</p>
    </section>
  );
}
