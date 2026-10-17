// Absolute cue positions (seconds). Retiming a scene updates its animation label.
export const INTRO_CUES = [
  { id: 'persona', at: 0, duration: 1.7 },
  { id: 'photos', at: 1.7, duration: 2.5 },
  { id: 'pitch', at: 4.2, duration: 2 },
  { id: 'reveal', at: 6.2, duration: 3 },
  { id: 'ask', at: 9.2, duration: 2 },
  { id: 'closing', at: 11.2, duration: 1.5 },
  { id: 'exit', at: 12.7, duration: 0.6 },
];

export const INTRO_DURATION = INTRO_CUES.at(-1).at;
