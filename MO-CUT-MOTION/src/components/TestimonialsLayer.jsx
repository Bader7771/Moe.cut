import { useEffect, useRef, useState, useCallback } from "react";

export default function TestimonialsLayer() {
  const [testimonials, setTestimonials] = useState([]);
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch('/api/testimonials');
        if (response.ok) {
          const data = await response.json();
          setTestimonials(data);
        }
      } catch (err) {
        console.error('Failed to fetch testimonials', err);
      }
    };
    fetchTestimonials();
  }, []);

  // Layering Effect Logic
  useEffect(() => {
    const section = document.querySelector('.testimonials-layer');
    const prev = section?.previousElementSibling;
    if (!section || !prev) return;

    let frame = 0;
    const handleScroll = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      
      // If testimonials is coming into view
      if (rect.top < vh && rect.top > -vh) {
        const progress = Math.max(0, Math.min(1, 1 - (rect.top / vh)));
        prev.style.transform = `scale(${1 - progress * 0.05})`;
        prev.style.opacity = `${1 - progress * 0.5}`;
        prev.style.filter = `brightness(${1 - progress * 0.3})`;
        prev.style.transformOrigin = 'bottom center';
      } else if (rect.top >= vh) {
        prev.style.transform = 'none';
        prev.style.opacity = '1';
        prev.style.filter = 'none';
      }
    };

    const schedule = () => { if (!frame) frame = requestAnimationFrame(handleScroll); };
    window.addEventListener('scroll', schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      if (prev) {
        prev.style.transform = '';
        prev.style.opacity = '';
        prev.style.filter = '';
      }
    };
  }, []);

  // Auto-scroll Marquee Logic
  useEffect(() => {
    if (!containerRef.current) return;
    
    let animationFrameId;
    const container = containerRef.current;
    
    const scrollLoop = () => {
      if (!isHovered && !isDragging.current) {
        container.scrollLeft += 1.5; // Auto-scroll speed
        
        // Reset scroll position for infinite effect
        // If we scrolled past half of the doubled content, jump back to start
        if (container.scrollLeft >= (container.scrollWidth / 2)) {
          container.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(scrollLoop);
    };
    
    animationFrameId = requestAnimationFrame(scrollLoop);
    
    return () => cancelAnimationFrame(animationFrameId);
  }, [isHovered, testimonials.length]);

  // Mouse Drag to scroll
  const handleMouseDown = (e) => {
    isDragging.current = true;
    startX.current = e.pageX - containerRef.current.offsetLeft;
    scrollLeft.current = containerRef.current.scrollLeft;
  };
  const handleMouseLeave = () => {
    isDragging.current = false;
    setIsHovered(false);
  };
  const handleMouseUp = () => {
    isDragging.current = false;
  };
  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX.current) * 2; // scroll-fast
    containerRef.current.scrollLeft = scrollLeft.current - walk;
  };

  if (testimonials.length === 0) return null;

  return (
    <section className="testimonials-layer">
      <div className="testimonials-layer-inner">
        <div className="testimonials-header-new">
          <p className="testimonials-eyebrow">WHAT OUR CLIENTS SAY</p>
          <h2 className="testimonials-headline">Real results. Real experiences. Built for businesses ready to grow.</h2>
        </div>
        
        <div 
          className="testimonials-carousel-container"
          ref={containerRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          <div className="testimonials-track" ref={trackRef}>
            {/* Double array for infinite marquee */}
            {[...testimonials, ...testimonials].map((t, i) => (
              <div key={`${t._id}-${i}`} className="testimonial-card-vertical">
                <div className="tc-top">
                  <div className="tc-avatar">
                    <img src={t.image} alt={t.clientName} loading="lazy" />
                  </div>
                  <div className="tc-rating">★★★★★</div>
                </div>
                <div className="tc-body">
                  <p className="tc-review">"{t.review}"</p>
                </div>
                <div className="tc-footer">
                  <h4 className="tc-name">{t.clientName}</h4>
                  <span className="tc-role">Client & Partner</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
