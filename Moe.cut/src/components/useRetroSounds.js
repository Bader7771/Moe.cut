import { useCallback, useEffect, useRef, useState } from "react";

const PREFERENCE = "moecut:gameboy-button-sounds";
const profiles = {
  navigation: [{ frequency: 440, end: 392, duration: .06, volume: .045, type: 'square' }],
  confirm: [
    { frequency: 659, end: 784, duration: .045, volume: .035, type: 'square' },
    { frequency: 880, end: 988, offset: .045, duration: .065, volume: .03, type: 'square' },
  ],
  action: [{ frequency: 330, end: 220, duration: .1, volume: .06, type: 'triangle' }],
};

export function useRetroSounds() {
  const [enabled, setEnabled] = useState(() => {
    try { return localStorage.getItem(PREFERENCE) !== 'off'; } catch { return true; }
  });
  const enabledRef = useRef(enabled);
  const audio = useRef(null);
  const voices = useRef(new Set());

  const stopVoices = useCallback(() => {
    for (const oscillator of voices.current) {
      try { oscillator.stop(); } catch { /* Already ended. */ }
    }
  }, []);

  const toggle = useCallback(() => {
    const next = !enabledRef.current;
    enabledRef.current = next;
    setEnabled(next);
    if (!next) stopVoices();
    try { localStorage.setItem(PREFERENCE, next ? 'on' : 'off'); } catch { /* Optional persistence. */ }
  }, [stopVoices]);

  const play = useCallback(kind => {
    if (!enabledRef.current) return;
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    try {
      // Created only by an actual button or keyboard interaction, never on load.
      const context = audio.current || (audio.current = new Audio());
      const synthesize = () => {
        if (!enabledRef.current || audio.current !== context || context.state !== 'running') return;
        for (const tone of profiles[kind] || profiles.navigation) {
          if (voices.current.size >= 6) {
            const oldest = voices.current.values().next().value;
            oldest.stop();
            voices.current.delete(oldest);
          }
          const oscillator = context.createOscillator();
          const gain = context.createGain();
          const start = context.currentTime + .004 + (tone.offset || 0);
          const end = start + tone.duration;
          oscillator.type = tone.type;
          oscillator.frequency.setValueAtTime(tone.frequency, start);
          oscillator.frequency.exponentialRampToValueAtTime(tone.end, end);
          gain.gain.setValueAtTime(0, start);
          gain.gain.linearRampToValueAtTime(tone.volume, start + .003);
          gain.gain.exponentialRampToValueAtTime(.0001, end - .004);
          gain.gain.linearRampToValueAtTime(0, end);
          oscillator.connect(gain);
          gain.connect(context.destination);
          voices.current.add(oscillator);
          oscillator.onended = () => {
            oscillator.disconnect();
            gain.disconnect();
            voices.current.delete(oscillator);
          };
          oscillator.start(start);
          oscillator.stop(end);
        }
      };
      if (context.state === 'suspended') context.resume().then(synthesize).catch(() => {});
      else synthesize();
    } catch { /* Audio support or output can be unavailable; controls still work. */ }
  }, []);

  useEffect(() => () => {
    stopVoices();
    const context = audio.current;
    audio.current = null;
    if (context && context.state !== 'closed') context.close().catch(() => {});
  }, [stopVoices]);

  return { enabled, toggle, play };
}
