import React, { useRef, useEffect, useState } from 'react';
import './GameBoy.css';

// Native buttons retain click, touch, focus, and Space-key behavior.
// Track Enter as well so a held keyboard press has the same physical feedback.
function ConsoleButton({ className, children, ...props }) {
  const [keyHeld, setKeyHeld] = useState(false);
  return (
    <button
      {...props}
      type="button"
      className={`${className}${keyHeld ? ' is-held' : ''}`}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') setKeyHeld(true);
      }}
      onKeyUp={event => {
        if (event.key === 'Enter' || event.key === ' ') setKeyHeld(false);
      }}
      onBlur={() => setKeyHeld(false)}
    >{children}</button>
  );
}

const GameBoy = ({
  activeTestimonial,
  onPrev,
  onNext, visible = true, muted, playing, onToggleMute, onTogglePlayback, onPlayingChange, pressed
}) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let cancelled = false;
    video.muted = muted;
    if (playing && visible) video.play().catch(() => { if (!cancelled) onPlayingChange(false); });
    else video.pause();
    return () => { cancelled = true; };
  }, [activeTestimonial?.video, muted, playing, visible, onPlayingChange]);

  return (
    <div className="gameboy">
      {/* Upper Display Enclosure: 100% Video Viewport */}
      <div className="screen-enclosure">
        <video
          ref={videoRef}
          src={activeTestimonial?.video}
          className="gameboy-active-video"
          aria-label={activeTestimonial?.title}
          muted={muted}
          loop
          playsInline
          preload="metadata"
        />
      </div>

      {/* Spacer row matching grid-template-rows */}
      <div className="console-spacer" />

      {/* Flat Vintage Control Deck */}
      <div className="console-controls">
        {/* D-Pad */}
        <div className="dpad-control">
          <div className="dpad-cross" aria-hidden="true">
            <i />
            <i />
          </div>
          <ConsoleButton
            className="dpad-hit up"
            aria-label="Up"
          />
          <ConsoleButton
            className={`dpad-hit left ${pressed === 'left' ? 'is-pressed' : ''}`}
            onClick={onPrev}
            aria-label="Previous Testimonial"
          />
          <ConsoleButton
            className={`dpad-hit right ${pressed === 'right' ? 'is-pressed' : ''}`}
            onClick={onNext}
            aria-label="Next Testimonial"
          />
          <ConsoleButton
            className="dpad-hit down"
            aria-label="Down"
          />
        </div>

        {/* C & V Action Buttons */}
        <div className="action-controls">
          <ConsoleButton
            className={`action-key ${pressed === 'c' ? 'is-pressed' : ''}`}
            onClick={onToggleMute}
            aria-pressed={!muted}
            aria-label={muted ? "Unmute video" : "Mute video"}
          />
          <ConsoleButton
            className={`action-key ${pressed === 'v' ? 'is-pressed' : ''}`}
            onClick={onTogglePlayback}
            aria-pressed={playing}
            aria-label={playing ? "Pause video" : "Play video"}
          />
        </div>
      </div>

      {/* Spacer */}
      <div className="console-spacer-sub" />

      {/* Bottom Label Bar */}
      <div className="console-bottom">
        <span>C-MUTE • V-PLAY / PAUSE</span>
      </div>
    </div>
  );
};

export default GameBoy;
