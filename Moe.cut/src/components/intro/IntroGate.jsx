import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import IntroOverlay from './IntroOverlay';

// The original page is always mounted. Only the independent overlay exits.
export default function IntroGate({ children }) {
  const [showIntro, setShowIntro] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [blocking, setBlocking] = useState(showIntro);
  const content = useRef(null);
  const complete = useCallback(() => setShowIntro(false), []);

  useEffect(() => {
    if (!blocking) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [blocking]);

  return <>
    {/* A stacking context keeps even the existing z-1000 header beneath z-50.
        No transforms, replacement hero, or layout styles are applied to the site. */}
    <div ref={content} style={{ isolation: 'isolate' }} inert={blocking}>
      {children}
    </div>
    <AnimatePresence onExitComplete={() => {
      setBlocking(false);
      // Wait for React to remove inert before restoring keyboard navigation.
      requestAnimationFrame(() => content.current?.querySelector('a, button')?.focus({ preventScroll: true }));
    }}>
      {showIntro && <IntroOverlay key="intro-overlay" onComplete={complete} />}
    </AnimatePresence>
  </>;
}
