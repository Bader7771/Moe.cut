# Intro overlay

`IntroGate` keeps the existing home route mounted below a separate fixed
`IntroOverlay`. The page is temporarily inert while the overlay runs. Scroll
locking, timelines, media listeners and pending image decodes are cleaned up
when the gate unmounts. The intro plays once per tab session; navigation and
ordinary rerenders do not replay it. Storage restrictions have an in-memory
fallback. Reduced-motion visitors go directly to the website, and enabling
reduced motion during playback completes the intro promptly.

The original GSAP print / stack / settle sequence now uses the two local
960×1280 portraits imported from `src/assets/intro-img`. Images load eagerly
and decode before playback, with an 800ms maximum wait. Their native portrait
proportions are preserved with `object-fit: contain`. No remote image or
conference-image fallback is used.

`INTRO_CUES` in `timeline.js` controls the sequence: two overlapping prints,
a settled final portrait, the masked-word greeting “Hi, it's me Mohamed”, a
reading hold, then an aperture-style image exit and coordinated text exit.
There are no captions, scene counters, playback controls or progress bars.
The GSAP sequence lasts 5.45 seconds. Framer Motion removes the white overlay
with a 750ms upward mask reveal.

During that final reveal, a GSAP timeline in the gate introduces the real
navbar, profile card, its existing children and collaborators. Only opacity
and transforms are used for the website entrance; inline animation properties
are cleared on completion. All entrance selectors are scoped to the gate's
Hero. No replacement Hero or navigation is rendered.

The original `SplitFlapText` is restored by `HeroSplitFlap` directly below the
availability pill, preserving its monthly message, client/work messages and
mechanical flip settings. The pill and both Hero buttons remain independent.
