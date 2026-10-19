// Absolute cue positions in seconds; the gate owns the final overlay/reveal transition.
export const INTRO_CUES = [
  { id: 'photos', at: 0, duration: 1.8 },
  { id: 'focus', at: 1.8, duration: 0.8 },
  { id: 'greeting', at: 2.6, duration: 1.9 },
  { id: 'exit', at: 4.5, duration: 0.95 },
];

export const INTRO_DURATION = INTRO_CUES.at(-1).at + INTRO_CUES.at(-1).duration;
