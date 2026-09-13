import { useState } from 'react';

export default function CollaboratorImage({ src, name, ...props }) {
  const [failedSource, setFailedSource] = useState(null);
  const initials = name.trim().split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase();
  return src && failedSource !== src
    ? <img src={src} alt="" {...props} onError={() => setFailedSource(src)} />
    : <span aria-label={name}>{initials}</span>;
}
