import { lazy, Suspense, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import './GreenLanternPortal.css';
const PowerRing = lazy(() => import('./PowerRing'));
const oath = [
  'In brightest day, in blackest night,',
  'No evil shall escape my sight.',
  "Let those who worship evil's might,",
  "Beware my power, Green Lantern's light!",
];

export default function GreenLanternPortal({ origin, trigger, audio, onDock, onClose }) {
  const root = useRef(null);
  const close = useRef(null);
  const ring = useRef(null);
  const slot = useRef(null);
  const dock = useRef(null);
  const dismiss = useRef(() => {});
  const ringMotion = useRef({ turn: 0, docked: false, flying: false });
  const [phase, setPhase] = useState('opening');

  useLayoutEffect(() => {
    const el = root.current;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const q = gsap.utils.selector(el);
    const atmosphere = q('.lantern-atmosphere');
    const orbits = q('.lantern-orbits');
    const wave = q('.lantern-origin-wave');
    const flare = q('.lantern-source');
    const inscription = q('.lantern-oath span');
    const ringEl = ring.current;
    const playback = audio.current;
    playback?.reset();
    let status = 'opening';
    let exitTimeline;
    let touchY;
    let wheelDistance = 0;
    let released = false;
    setPhase('opening');
    ringMotion.current.docked = false;
    ringMotion.current.flying = false;
    ringMotion.current.invalidate?.();
    const body = document.body;
    const previous = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };
    const scrollbar = innerWidth - document.documentElement.clientWidth;
    body.style.overflow = 'hidden';
    if (scrollbar) body.style.paddingRight = `${parseFloat(getComputedStyle(body).paddingRight) + scrollbar}px`;
    const siblings = [...body.children].filter(child => child !== el && child instanceof HTMLElement && !['SCRIPT', 'STYLE'].includes(child.tagName));
    const inert = siblings.map(child => child.inert);
    siblings.forEach(child => { child.inert = true; });
    close.current.focus({ preventScroll: true });
    const releasePage = (restoreFocus = false) => {
      if (released) return;
      released = true;
      siblings.forEach((child, i) => { child.inert = inert[i]; });
      body.style.overflow = previous.overflow;
      body.style.paddingRight = previous.paddingRight;
      if (restoreFocus) trigger.current?.focus({ preventScroll: true });
      else if (el.contains(document.activeElement)) document.activeElement.blur();
    };
    // Dimensions are read only at layout changes. Flight itself animates transforms exclusively.
    const placement = floating => {
      const target = (floating ? dock.current : slot.current).getBoundingClientRect();
      const width = ringEl.offsetWidth;
      const height = ringEl.offsetHeight;
      return { x: target.left + target.width / 2 - width / 2, y: target.top + target.height / 2 - height / 2, scale: floating ? target.width / width : 1 };
    };
    gsap.set(ringEl, { ...placement(false), opacity: 0, rotation: 0 });
    gsap.set(orbits, { opacity: 0, scale: .65 });
    gsap.set(inscription, { opacity: 0, y: 12 });
    gsap.set(q('.lantern-particles'), { opacity: 1 });
    gsap.set([atmosphere, close.current], { opacity: 0 });
    const radius = Math.hypot(Math.max(origin.x, innerWidth - origin.x), Math.max(origin.y, innerHeight - origin.y));
    const timeline = gsap.timeline({ onComplete: () => { if (status === 'opening') { status = 'open'; setPhase('open'); } } });
    if (motion.matches) {
      gsap.set([orbits, atmosphere, ringEl, close.current], { opacity: 1, scale: 1 });
      gsap.set(inscription, { opacity: 1, y: 0 });
      gsap.set([wave, flare], { opacity: 0 });
      playback?.start();
      status = 'open'; setPhase('open');
    } else {
      timeline.fromTo(flare, { opacity: 0, scale: .4 }, { opacity: 1, scale: 1, duration: .3 })
        .to(flare, { scale: 1.5, duration: .26, ease: 'sine.inOut' })
        .fromTo(wave, { scale: 0, opacity: .8 }, { scale: radius / 100, opacity: 0, duration: 1.4, ease: 'power3.inOut' }, .4)
        .to(atmosphere, { opacity: 1, duration: 1.1 }, .45)
        .to(flare, { opacity: 0, scale: .2, duration: .65 }, .75)
        .to(orbits, { opacity: 1, scale: 1, duration: 1.5, ease: 'power3.out' }, .85)
        .to(ringEl, { opacity: 1, duration: 1.1 }, 1.25)
        .to(close.current, { opacity: 1, duration: .7 }, 1.5)
        // One callback at the start of the first line, never per-line playback.
        .call(() => playback?.start(), [], 2.1)
        .to(inscription, { opacity: 1, y: 0, duration: .9, stagger: .55, ease: 'power2.out' }, 2.1);
    }

    const finish = floating => {
      if (!['opening', 'open'].includes(status)) return;
      status = floating ? 'flying' : 'closing';
      setPhase(status);
      timeline.kill(); playback?.stop();
      const duration = motion.matches ? .12 : .9;
      if (floating) {
        // Extracted ring already lives outside the energy layer: no reparent, clone, or WebGL restart.
        ringMotion.current.flying = true;
        ringMotion.current.invalidate?.();
        gsap.set(ringEl, { opacity: 1 });
        releasePage(); onDock();
      }
      exitTimeline = gsap.timeline({ onComplete: () => {
        if (floating) {
          status = 'floating';
          ringMotion.current.docked = true;
          ringMotion.current.flying = false;
          ringMotion.current.invalidate?.();
          setPhase('floating');
        }
        else { releasePage(true); onClose(); }
      } });
      exitTimeline.to(inscription, { opacity: 0, y: motion.matches ? 0 : -6, duration: duration * .4, stagger: .025 }, 0)
        .to(q('.lantern-particles'), { opacity: 0, duration: duration * .5 }, 0)
        .to(orbits, { scale: motion.matches ? 1 : .05, opacity: 0, duration, ease: 'power3.inOut' }, 0)
        .to([atmosphere, close.current, wave, flare], { opacity: 0, duration: duration * .8 }, duration * .15);
      if (floating) {
        exitTimeline.to(ringEl, { ...placement(true), rotation: 0, duration: motion.matches ? .12 : 1.5, ease: 'power3.inOut' }, motion.matches ? 0 : .22)
          .to(ringMotion.current, { turn: ringMotion.current.turn + (motion.matches ? 0 : Math.PI * 2 + .55), duration: motion.matches ? .12 : 1.5, ease: 'power2.out' }, motion.matches ? 0 : .22);
      } else {
        exitTimeline.to(ringEl, { opacity: 0, scale: motion.matches ? 1 : .75, duration: duration * .7, ease: 'power2.in' }, 0);
      }
    };
    dismiss.current = () => finish(false);
    const wheel = event => { wheelDistance += Math.abs(event.deltaY); if (wheelDistance > 3) finish(true); };
    const touchstart = event => { touchY = event.touches[0]?.clientY; };
    const touchmove = event => { if (touchY != null && Math.abs(event.touches[0]?.clientY - touchY) > 12) finish(true); };
    const scroll = () => finish(true);
    const keydown = event => {
      if (!['opening', 'open'].includes(status)) return;
      if (event.key === 'Escape') { event.preventDefault(); finish(false); }
      else if (event.key === ' ' && event.target instanceof HTMLButtonElement) return;
      else if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Home', 'End'].includes(event.key)) finish(true);
      else if (event.key === 'Tab') {
        event.preventDefault();
        // Include the model retry control if loading failed; otherwise this remains the close button.
        const controls = [...el.querySelectorAll('button:not([disabled])')].filter(control => getComputedStyle(control).visibility !== 'hidden');
        const index = controls.indexOf(document.activeElement);
        const next = (index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length;
        controls[next]?.focus();
      }
    };
    const resize = () => {
      if (status === 'closing') return;
      if (status === 'flying') {
        // Retarget the existing flight if the device rotates; never clone or snap the ring.
        gsap.to(ringEl, { ...placement(true), duration: motion.matches ? 0 : .35, ease: 'power2.out', overwrite: 'auto' });
        return;
      }
      gsap.set(ringEl, placement(status === 'floating'));
    };
    const motionChange = () => {
      if (!motion.matches) return;
      if (['opening', 'open'].includes(status)) timeline.progress(1);
      else exitTimeline?.progress(1);
    };
    window.addEventListener('wheel', wheel, { passive: true });
    window.addEventListener('touchstart', touchstart, { passive: true });
    window.addEventListener('touchmove', touchmove, { passive: true });
    window.addEventListener('scroll', scroll, { passive: true, capture: true });
    window.addEventListener('resize', resize);
    document.addEventListener('keydown', keydown);
    motion.addEventListener('change', motionChange);
    return () => {
      timeline.kill(); exitTimeline?.kill(); playback?.stop();
      gsap.killTweensOf([ringEl, ringMotion.current, ...orbits, ...inscription, ...atmosphere, ...wave, ...flare, close.current, ...q('.lantern-particles')]);
      window.removeEventListener('wheel', wheel);
      window.removeEventListener('touchstart', touchstart);
      window.removeEventListener('touchmove', touchmove);
      window.removeEventListener('scroll', scroll, true);
      window.removeEventListener('resize', resize);
      document.removeEventListener('keydown', keydown);
      motion.removeEventListener('change', motionChange);
      releasePage();
    };
  }, [origin, trigger, audio, onDock, onClose]);

  return createPortal(<div ref={root} className="lantern-experience" data-phase={phase} style={{ '--source-x': `${origin.x}px`, '--source-y': `${origin.y}px` }}>
    <div className="lantern-overlay" role={phase === 'floating' || phase === 'flying' ? undefined : 'dialog'} aria-modal={phase === 'opening' || phase === 'open' ? true : undefined} aria-label="Green Lantern power ring" aria-describedby="lantern-oath" aria-hidden={phase === 'floating' ? true : undefined} onClick={event => { if (event.target === event.currentTarget) dismiss.current(); }}>
      <div className="lantern-atmosphere" aria-hidden="true" />
      <div className="lantern-source" aria-hidden="true" />
      <div className="lantern-origin-wave" aria-hidden="true" />
      <button ref={close} type="button" className="lantern-close" aria-label="Close Green Lantern portal" onClick={() => dismiss.current()}><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg></button>
      <div className="lantern-stage">
        <div className="lantern-content">
          <div ref={slot} className="lantern-artifact-slot">
            <div className="lantern-orbits" aria-hidden="true">
              <div className="lantern-haze" /><div className="lantern-rays" />
              <div className="lantern-orbit lantern-orbit-outer" /><div className="lantern-orbit lantern-orbit-ticks" />
              <div className="lantern-orbit lantern-orbit-middle" /><div className="lantern-orbit lantern-orbit-inner" />
              <div className="lantern-particles">{Array.from({ length: 24 }, (_, i) => <i key={i} style={{ '--angle': `${i * 137.508}deg`, '--delay': `${-i * .7}s`, '--duration': `${5 + i % 4}s` }} />)}</div>
            </div>
          </div>
          <p id="lantern-oath" className="lantern-oath" onClick={event => event.stopPropagation()}>{oath.map((line, i) => <span key={line} style={{ '--line': i }}>{line}</span>)}</p>
        </div>
      </div>
    </div>
    <div ref={ring} className="lantern-ring-flight"><Suspense fallback={null}><PowerRing motionState={ringMotion} /></Suspense></div>
    <div ref={dock} className="lantern-dock-target" aria-hidden="true" />
  </div>, document.body);
}
