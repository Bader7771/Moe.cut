// Optional local assets: Vite includes only files that actually exist. No missing-file requests.
const assets = import.meta.glob('../../assets/{green-lantern-oath,green lantern}.mp3', {
  eager: true,
  query: '?url',
  import: 'default',
});
export const oathAudioUrl = assets['../../assets/green-lantern-oath.mp3']
  || assets['../../assets/green lantern.mp3'];

// Called directly from the availability button's user gesture, before lazy loading the portal.
export function prepareOathAudio() {
  if (!oathAudioUrl) return { reset() {}, start() {}, stop() {} };
  const audio = new Audio(oathAudioUrl);
  audio.preload = 'auto';
  let started = false;
  let stopped = false;
  audio.muted = true;
  // Prime playback while activation is trusted. Some browsers still require a later gesture;
  // rejected playback stays silent and never prevents the visual experience.
  audio.play().then(() => {
    if (!started || stopped) { audio.pause(); audio.currentTime = 0; }
  }).catch(() => {});
  return {
    reset() { started = false; stopped = false; },
    start() {
      if (started || stopped) return;
      started = true;
      audio.muted = false;
      audio.currentTime = 0;
      audio.play().catch(() => {});
    },
    stop() {
      stopped = true;
      audio.pause();
      audio.currentTime = 0;
    },
  };
}
