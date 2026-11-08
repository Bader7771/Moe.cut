import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useWebsiteReveal } from '../../performance/useWebsiteReveal';
import IntroOverlay from './IntroOverlay';
import { IntroPlaybackContext } from './IntroPlaybackContext';

function shouldPlayIntro() {
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// The real page stays mounted; only the independent overlay is removed.
export default function IntroGate({ children }) {
  const [showIntro, setShowIntro] = useState(shouldPlayIntro);
  const [blocking, setBlocking] = useState(showIntro);
  const revealPending = useRef(showIntro);
  const content = useRef(null);
  const complete = useCallback(() => setShowIntro(false), []);

  useEffect(() => {
    if (!showIntro) return undefined;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => { if (motion.matches) complete(); };
    motion.addEventListener('change', onChange);
    return () => motion.removeEventListener('change', onChange);
  }, [showIntro, complete]);

  useEffect(() => {
    if (!blocking) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [blocking]);

  useWebsiteReveal(content, !showIntro && revealPending.current);

  return <>
    <div
      ref={content}
      className="intro-content"
      style={{ isolation: 'isolate' }}
      inert={blocking}
      data-intro-state={showIntro ? 'playing' : blocking ? 'revealing' : 'ready'}
    >
      <IntroPlaybackContext.Provider value={blocking}>{children}</IntroPlaybackContext.Provider>
    </div>
    <AnimatePresence onExitComplete={() => {
      setBlocking(false);
      requestAnimationFrame(() => content.current?.querySelector('.hero-layer .site-header a')?.focus({ preventScroll: true }));
    }}>
      {showIntro && <IntroOverlay key="intro-overlay" onComplete={complete} />}
    </AnimatePresence>
  </>;
}
