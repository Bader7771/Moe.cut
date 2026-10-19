import React, { useRef, useEffect, useState } from 'react';
import './GameBoy.css';

// Native buttons retain click, touch, focus, and Space-key behavior.
// Track Enter as well so a held keyboard press has the same physical feedback.
function ConsoleButton({ className, children, onClick, onSound, sound = 'navigation', ...props }) {
  const [keyHeld, setKeyHeld] = useState(false);
  const repeating = useRef(false);
  return (
    <button
      {...props}
      type="button"
      className={`${className}${keyHeld ? ' is-held' : ''}`}
      onClick={event => {
        if (!repeating.current) onSound?.(sound);
        onClick?.(event);
      }}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') { repeating.current = event.repeat; setKeyHeld(true); }
      }}
      onKeyUp={event => {
        if (event.key === 'Enter' || event.key === ' ') { repeating.current = false; setKeyHeld(false); }
      }}
      onBlur={() => { repeating.current = false; setKeyHeld(false); }}
    >{children}</button>
  );
}

const GameBoy = ({
  activeTestimonial,
  onPrev,
  onNext, visible = true, muted, playing, onToggleMute, onTogglePlayback, onPlayingChange, pressed,
  onButtonSound, soundsEnabled, onToggleSounds
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
            onSound={onButtonSound}
            aria-label="Up"
          />
          <ConsoleButton
            className={`dpad-hit left ${pressed === 'left' ? 'is-pressed' : ''}`}
            onClick={onPrev}
            onSound={onButtonSound}
            aria-label="Previous Testimonial"
          />
          <ConsoleButton
            className={`dpad-hit right ${pressed === 'right' ? 'is-pressed' : ''}`}
            onClick={onNext}
            onSound={onButtonSound}
            aria-label="Next Testimonial"
          />
          <ConsoleButton
            className="dpad-hit down"
            onSound={onButtonSound}
            aria-label="Down"
          />
        </div>

        {/* C & V Action Buttons */}
        <div className="action-controls">
          <ConsoleButton
            className={`action-key ${pressed === 'c' ? 'is-pressed' : ''}`}
            onClick={onToggleMute}
            onSound={onButtonSound}
            sound="confirm"
            aria-pressed={!muted}
            aria-label={muted ? "Unmute video" : "Mute video"}
          />
          <ConsoleButton
            className={`action-key ${pressed === 'v' ? 'is-pressed' : ''}`}
            onClick={onTogglePlayback}
            onSound={onButtonSound}
            sound="action"
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
        <button type="button" className="gameboy-sounds-toggle" onClick={onToggleSounds}
          aria-label={soundsEnabled ? 'Mute button sounds' : 'Enable button sounds'}
          aria-pressed={!soundsEnabled} title={`Button sounds: ${soundsEnabled ? 'on' : 'off'}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M11 5 6 9H3v6h3l5 4V5Z" />
            {soundsEnabled ? <path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" /> : <path d="m16 9 5 6m0-6-5 6" />}
          </svg>
        </button>
      </div>
    </div>
  );
};

export default GameBoy;
