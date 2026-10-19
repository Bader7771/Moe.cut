import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { motion, useReducedMotion } from 'framer-motion';
import { INTRO_CUES, INTRO_DURATION } from './timeline';
import { Polaroid } from './Artwork';
import { PHOTOS } from './data';
import './IntroOverlay.css';

function Words({ children }) {
  return children.split(' ').map((word, index) => (
    <span className="con-word-mask" key={word}>
      <span className="con-word">{index > 0 ? '\u00a0' : ''}{word}</span>
    </span>
  ));
}

export default function IntroOverlay({ onComplete }) {
  const root = useRef(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    root.current.focus({ preventScroll: true });
    let cancelled = false;
    let ready = false;
    let timeline;
    let preloadTimeout;
    const context = gsap.context(() => {
      const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
      timeline = tl;
      INTRO_CUES.forEach(cue => {
        tl.addLabel(cue.id, cue.at);
        tl.set(root.current, { attr: { 'data-phase': cue.id } }, cue.at);
      });
      gsap.set('.con-polaroid', { autoAlpha: 0 });
      gsap.set('.con-greeting', { autoAlpha: 0 });

      // Keep the physical print / stack / settle rhythm of the original intro.
      tl.fromTo('.desk-photo',
        { autoAlpha: 0, y: 48, x: -18, scale: .92, rotation: -9 },
        { autoAlpha: 1, y: 12, scale: 1, rotation: -6, duration: .85 }, 'photos');
      tl.fromTo('.people-photo',
        { autoAlpha: 0, y: -80, x: 42, scale: 1.06, rotation: 12 },
        { autoAlpha: 1, y: 0, x: 16, scale: 1, rotation: 5, duration: .9, ease: 'power4.out' }, 'photos+=0.75');
      tl.to('.desk-photo', { x: -48, y: 8, rotation: -10, scale: .96, autoAlpha: 0, duration: .65 }, 'focus');
      tl.to('.people-photo', { x: 0, rotation: 0, duration: .8, ease: 'power3.inOut' }, 'focus');
      tl.fromTo('.people-photo img', { scale: 1.035 }, { scale: 1, duration: 1.45, ease: 'power2.out' }, 'focus');

      tl.set('.con-greeting', { autoAlpha: 1 }, 'greeting');
      tl.fromTo('.con-word', { yPercent: 110, opacity: 0 },
        { yPercent: 0, opacity: 1, stagger: .07, duration: .7, ease: 'power4.out' }, 'greeting');

      // Collapse the portrait into a narrow aperture, then close it horizontally.
      tl.to('.con-photo-image', {
        clipPath: 'inset(46% 0% 46% 0% round 8px)', duration: .6, ease: 'power3.inOut',
      }, 'exit');
      tl.to('.people-photo', { y: -22, scale: .96, borderColor: 'transparent', boxShadow: '0 0 0 rgba(0,0,0,0)', backgroundColor: 'transparent', duration: .6, ease: 'power3.inOut' }, 'exit');
      tl.to('.con-photo-image', { clipPath: 'inset(50% 50% 50% 50% round 8px)', duration: .3, ease: 'power2.in' }, 'exit+=0.55');
      tl.to('.people-photo', { autoAlpha: 0, duration: .2 }, 'exit+=0.7');
      tl.to('.con-word', { yPercent: -110, opacity: 0, stagger: .035, duration: .5, ease: 'power3.in' }, 'exit+=0.15');
      tl.call(onComplete, [], INTRO_DURATION);
    }, root);

    // Eager imports are fetched with the overlay. Decode before playback, with
    // a bounded wait so failed/slow images cannot leave the website locked.
    const images = [...root.current.querySelectorAll('img')];
    const decoded = Promise.allSettled(images.map(image => image.decode()));
    const timeout = new Promise(resolve => { preloadTimeout = window.setTimeout(resolve, 800); });
    Promise.race([decoded, timeout]).then(() => {
      clearTimeout(preloadTimeout);
      ready = true;
      if (!cancelled && !document.hidden) timeline.play();
    });
    const onVisibility = () => {
      if (!ready) return;
      if (document.hidden) timeline.pause();
      else timeline.resume();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelled = true;
      clearTimeout(preloadTimeout);
      context.revert();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [onComplete]);

  return <motion.section
    ref={root}
    className="intro-overlay"
    initial={{ opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' }}
    exit={reduced ? { opacity: 0 } : { clipPath: 'inset(0% 0% 100% 0%)' }}
    transition={{ duration: reduced ? .12 : .75, ease: [.76, 0, .24, 1] }}
    role="dialog"
    aria-modal="true"
    aria-label="An introduction from Mohamed"
    tabIndex={-1}
    data-phase="photos"
  >
    <div className="con-composition">
      <div className="con-photo-deck" aria-hidden="true">
        {PHOTOS.map(photo => <Polaroid key={photo.src} photo={photo} />)}
      </div>
      <h2 className="con-greeting" aria-label="Hi, it's me Mohamed">
        <span aria-hidden="true"><Words>Hi, it's me Mohamed</Words></span>
      </h2>
    </div>
  </motion.section>;
}
