export function Arrow({ className = '' }) {
  return <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function Polaroid({ photo, className = '' }) {
  return <figure className={`con-polaroid ${photo.className} ${className}`}>
    <div className="con-photo-image"><img src={photo.src} alt={photo.alt} width="500" height="600" draggable="false" onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = photo.fallback; }} /><span /></div>
    <figcaption>{photo.caption}</figcaption>
  </figure>;
}

export function Squiggle({ className = '' }) {
  return <svg className={className} viewBox="0 0 260 20" fill="none" aria-hidden="true"><path d="M4 12C55 2 144 1 253 8 186 8 123 12 70 17" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /></svg>;
}
