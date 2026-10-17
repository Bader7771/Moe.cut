import { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { motion } from 'framer-motion';
import { INTRO_CUES, INTRO_DURATION } from './timeline';
import { Arrow, Polaroid, Squiggle } from './Artwork';
import { PHOTOS } from './data';
import './IntroOverlay.css';

function Words({ children }) {
  const words = children.split(' ');
  return words.map((word, index) => <span className="con-word-mask" key={`${word}-${index}`}><span className="con-word">{word}{index < words.length - 1 ? '\u00a0' : ''}</span></span>);
}

export default function IntroOverlay({ onComplete }) {
  const root = useRef(null);
  const timeline = useRef(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const skipButton = useRef(null);

  useLayoutEffect(() => {
    skipButton.current?.focus({ preventScroll: true });
    const context = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete });
      timeline.current = tl;
      INTRO_CUES.forEach((cue, index) => {
        tl.addLabel(cue.id, cue.at);
        tl.call(() => setCurrentStep(index), [], cue.at);
      });
      gsap.set('.con-scene', { autoAlpha: 0 });
      gsap.set('.con-photo-deck', { xPercent: -50, yPercent: -50 });
      gsap.set('.con-photo-deck .con-polaroid', { autoAlpha: 0 });

      // Start immediately: individually masked words, followed by an upward exit.
      tl.set('.con-scene-persona', { autoAlpha: 1 }, 'persona');
      tl.from('.con-scene-persona .con-word', { yPercent: 110, opacity: 0, stagger: .09, duration: .65, ease: 'expo.out' }, 'persona');
      tl.to('.con-scene-persona', { y: -50, autoAlpha: 0, duration: .38 }, 'photos-=0.38');

      // 2: two physical prints land, settle, then remain docked to the viewport.
      tl.fromTo('.con-photo-deck .desk-photo', { y: -28, scale: .85, rotation: -13 }, { autoAlpha: 1, y: 0, scale: 1, rotation: -5, duration: .65, ease: 'back.out(1.4)' }, 'photos');
      tl.fromTo('.con-photo-deck .people-photo', { y: -180, x: 25, scale: .9, rotation: 17 }, { autoAlpha: 1, y: 8, x: 18, scale: 1, rotation: 7, duration: .8, ease: 'elastic.out(1,0.7)' }, 'photos+=0.65');
      tl.to('.con-photo-deck', { top: 'calc(100% - 34px)', scale: .45, duration: .85, ease: 'power3.inOut' }, 'pitch-=0.7');

      // 3–6: shared reveal rhythm; all timing comes from the declarative cues.
      for (const id of ['pitch', 'ask', 'closing']) {
        const cue = INTRO_CUES.find(item => item.id === id);
        tl.fromTo(`.con-scene-${id}`, { autoAlpha: 0, y: 32 }, { autoAlpha: 1, y: 0, duration: .55 }, id);
        tl.from(`.con-scene-${id} .con-word`, { yPercent: 110, stagger: .035, duration: .55 }, id);
        tl.to(`.con-scene-${id}`, { autoAlpha: 0, y: -24, duration: .3 }, cue.at + cue.duration - .3);
      }
      tl.fromTo('.con-scene-reveal', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: .5 }, 'reveal');
      tl.fromTo('.con-stomp', { autoAlpha: 0, scale: 1.45, y: -40 }, { autoAlpha: 1, scale: 1, y: 0, duration: .42, ease: 'back.out(1.8)' }, 'reveal+=1');
      tl.to('.con-camera', { x: 3, y: 2, repeat: 3, yoyo: true, duration: .045, ease: 'none' }, 'reveal+=1.28');
      tl.to('.con-camera', { x: 0, y: 0, duration: .08 }, 'reveal+=1.46');
      tl.to('.con-scene-reveal', { autoAlpha: 0, y: -25, duration: .3 }, 'ask-=0.3');

      // Only the photos leave here. AnimatePresence handles the overlay fade;
      // onComplete removes this layer while the original site stays mounted.
      tl.fromTo('.con-intro-progress', { scaleX: 0 }, { scaleX: 1, duration: INTRO_DURATION, ease: 'none' }, 0);
      tl.to('.con-photo-deck', { y: 180, autoAlpha: 0, duration: .6 }, 'exit');
    }, root);
    // Pause automatically in a background tab without changing the user's setting.
    const onVisibility = () => {
      if (document.hidden) timeline.current?.pause();
      else if (root.current?.dataset.paused !== 'true') timeline.current?.resume();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      context.revert();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [onComplete]);

  function skip() { timeline.current?.play('exit'); setPaused(false); }
  function togglePause() {
    const next = !paused;
    setPaused(next);
    timeline.current?.paused(next);
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape') skip();
    if (event.key !== 'Tab') return;
    const controls = [...root.current.querySelectorAll('button:not(:disabled)')];
    const target = event.shiftKey ? controls.at(-1) : controls[0];
    const edge = event.shiftKey ? controls[0] : controls.at(-1);
    if (document.activeElement === edge) { event.preventDefault(); target?.focus(); }
  }

  return <motion.section ref={root} className="intro-overlay fixed inset-0 z-50 pointer-events-none" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .8, ease: [.16, 1, .3, 1] }} data-step={currentStep} data-paused={paused} role="dialog" aria-modal="true" aria-label="An introduction from Mohammed" onKeyDown={handleKeyDown}>
    <div className="con-intro-top"><span className="con-intro-brand">MOE.CUT</span><span>A LITTLE CONTEXT, FIRST.</span></div>
    <div className="con-camera">
      <div className="con-scene con-scene-persona"><h2><Words>Hi, I am Mohammed</Words><span className="con-greeting-dot">.</span></h2></div>
      <div className="con-scene con-scene-pitch"><h2>I'm hosting a <em>free</em><br /><Words>creative tech conference</Words></h2></div>
      <div className="con-scene con-scene-reveal"><p>It's called...</p><h2 className="con-stomp">CONTEXT<br />CON<span>®</span></h2></div>
      <div className="con-scene con-scene-ask"><h2><Words>I need your help</Words><br />to figure out <span className="con-underlined">where<Squiggle /></span></h2></div>
      <div className="con-scene con-scene-closing"><h2><Words>It'll be fun</Words><span className="con-greeting-dot">.</span></h2></div>
    </div>
    <div className="con-photo-deck" aria-hidden="true">{PHOTOS.map(photo => <Polaroid key={photo.src} photo={photo} />)}</div>
    <div className="con-intro-controls"><span className="con-scene-number">0{Math.min(currentStep + 1, 6)} <span>/ 06</span></span><div><button type="button" onClick={togglePause} disabled={currentStep === 6} aria-label={paused ? 'Resume intro' : 'Pause intro'}>{paused ? '▶' : 'Ⅱ'}</button><button ref={skipButton} type="button" onClick={skip} disabled={currentStep === 6}>Skip intro <Arrow /></button></div></div>
    <div className="con-intro-progress" />
  </motion.section>;
}
