import { useEffect, useRef } from 'react';
import './ElectricBorder.css';

const ElectricBorder = ({
  children,
  color = '#5227FF',
  speed = 1,
  chaos = 0.12,
  borderRadius = 24,
  className = '',
  style = {}
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animFrameId = useRef(null);
  const isVisibleRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    const padding = 20; // Canvas padding to prevent thunder clipping

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5); // Cap DPR to 1.5 for performance

      canvas.width = (width + padding * 2) * dpr;
      canvas.height = (height + padding * 2) * dpr;
      canvas.style.width = `${width + padding * 2}px`;
      canvas.style.height = `${height + padding * 2}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    updateSize();

    // Pause rendering if not visible on screen
    const observer = new IntersectionObserver(([entry]) => {
      isVisibleRef.current = entry.isIntersecting;
    }, { threshold: 0.1 });
    observer.observe(container);

    const resizeObserver = new ResizeObserver(() => updateSize());
    resizeObserver.observe(container);

    let time = 0;
    let lastTime = performance.now();

    const draw = (now) => {
      animFrameId.current = requestAnimationFrame(draw);
      if (!isVisibleRef.current) return;

      const delta = (now - lastTime) / 1000;
      lastTime = now;
      time += delta * speed * 4;

      ctx.clearRect(0, 0, width + padding * 2, height + padding * 2);

      const r = Math.min(borderRadius, width / 2, height / 2);
      const x0 = padding;
      const y0 = padding;
      const w = width;
      const h = height;

      // Sample path perimeter
      const points = [];
      const step = 8; // Step size: larger = faster performance

      // Top edge
      for (let x = x0 + r; x <= x0 + w - r; x += step) points.push({ x, y: y0 });
      // Top-Right corner
      for (let a = -Math.PI / 2; a <= 0; a += 0.2) points.push({ x: x0 + w - r + Math.cos(a) * r, y: y0 + r + Math.sin(a) * r });
      // Right edge
      for (let y = y0 + r; y <= y0 + h - r; y += step) points.push({ x: x0 + w, y });
      // Bottom-Right corner
      for (let a = 0; a <= Math.PI / 2; a += 0.2) points.push({ x: x0 + w - r + Math.cos(a) * r, y: y0 + h - r + Math.sin(a) * r });
      // Bottom edge
      for (let x = x0 + w - r; x >= x0 + r; x -= step) points.push({ x, y: y0 + h });
      // Bottom-Left corner
      for (let a = Math.PI / 2; a <= Math.PI; a += 0.2) points.push({ x: x0 + r + Math.cos(a) * r, y: y0 + h - r + Math.sin(a) * r });
      // Left edge
      for (let y = y0 + h - r; y >= y0 + r; y -= step) points.push({ x: x0, y });
      // Top-Left corner
      for (let a = Math.PI; a <= (Math.PI * 3) / 2; a += 0.2) points.push({ x: x0 + r + Math.cos(a) * r, y: y0 + r + Math.sin(a) * r });

      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.lineJoin = 'round';
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;

      const amp = chaos * 35;

      for (let i = 0; i < points.length; i++) {
        const pt = points[i];
        // Fast compound sine displacement
        const n = Math.sin(i * 0.45 + time) * 0.6 + Math.cos(i * 0.85 - time * 1.5) * 0.4;
        const dx = pt.x + (Math.sin(time * 2 + i) * amp * n);
        const dy = pt.y + (Math.cos(time * 2 + i) * amp * n);

        if (i === 0) ctx.moveTo(dx, dy);
        else ctx.lineTo(dx, dy);
      }

      ctx.closePath();
      ctx.stroke();
    };

    animFrameId.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animFrameId.current);
      observer.disconnect();
      resizeObserver.disconnect();
    };
  }, [color, speed, chaos, borderRadius]);

  return (
    <div
      ref={containerRef}
      className={`electric-border ${className}`}
      style={{
        '--electric-border-color': color,
        borderRadius: `${borderRadius}px`,
        ...style
      }}
    >
      <div className="eb-canvas-container">
        <canvas ref={canvasRef} className="eb-canvas" />
      </div>

      <div className="eb-layers">
        <div className="eb-glow-base" />
        <div className="eb-glow-soft" />
      </div>

      <div className="eb-content">{children}</div>
    </div>
  );
};

export default ElectricBorder;
