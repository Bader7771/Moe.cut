# Intro overlay

`IntroGate` renders its children unchanged and always mounted, with a separate
fixed `IntroOverlay` sibling. App.jsx wraps only the existing home route in the
gate. Home.jsx, HeroProfile, Header, projects, testimonials, footer, login and
admin components are unchanged.

The overlay starts immediately with “Hi, I am Mohammed”, followed by the photo
drop/stack/dock and the remaining text scenes. Edit `INTRO_CUES` in `timeline.js`
to adjust timing. GSAP orchestrates the scenes; `onComplete` asks the gate to
remove the overlay, and Framer Motion's `AnimatePresence` fades it out and fully
unmounts it. The existing site is already rendered below the overlay.

CSS is scoped to `.intro-overlay`, with pure white backgrounds, black typography
and royal blue accents. Photos are monochrome. The fixed layer has
`pointer-events: none`; only the optional pause/skip buttons accept pointers.
The underlying site is temporarily inert, and scrolling is restored after the
exit completes (or immediately if the route unmounts). Reduced-motion visitors
go directly to the original website. No new hero, navigation or vote UI is used.

Photo files are local, with original SVG fallbacks in `public/conference/`.
Sources: https://images.unsplash.com/photo-1497215728101-856f4ea42174 and
https://images.unsplash.com/photo-1522071820081-009f0129c71c.
