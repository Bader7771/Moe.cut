import { createContext } from 'react';

// True only while the opening overlay blocks the page; never persisted.
export const IntroPlaybackContext = createContext(false);
