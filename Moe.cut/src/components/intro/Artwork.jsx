export function Polaroid({ photo }) {
  return <figure className={`con-polaroid ${photo.className}`}>
    <div className="con-photo-image">
      <img src={photo.src} alt={photo.alt} width="960" height="1280" draggable="false" loading="eager" decoding="async" fetchPriority="high" />
    </div>
  </figure>;
}
