import React, { useEffect, useRef, useState } from "react";

export default function BackgroundCarousel({
  images = [],
  interval = 5000, // autoplay cada 5s
  height = 260,    // alto escritorio en px
  heightMobile = 140, // alto móvil en px
}) {
  const [idx, setIdx] = useState(0);
  const timerRef = useRef(null);

  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);
  const next = () => setIdx((i) => (i + 1) % images.length);

  useEffect(() => {
    if (images.length <= 1) return;
    timerRef.current = setInterval(next, interval);
    return () => clearInterval(timerRef.current);
  }, [images.length, interval]);

  const pause = () => timerRef.current && clearInterval(timerRef.current);
  const resume = () => {
    if (images.length <= 1) return;
    timerRef.current = setInterval(next, interval);
  };

  if (!images.length) return null;

  return (
    <div
      className="bg-carousel"
      style={{ "--h": `${height}px`, "--hm": `${heightMobile}px` }}
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      {/* Slides */}
      {images.map((src, i) => (
        <div
          key={src + i}
          className={`bgc-slide ${i === idx ? "is-active" : ""}`}
          style={{ backgroundImage: `url("${src}")` }}
          aria-hidden={i !== idx}
        />
      ))}

      {/* Degradado overlay para legibilidad */}
      <div className="bgc-gradient" />

      {/* Controles */}
      {images.length > 1 && (
        <>
          <button className="bgc-arrow left" onClick={prev} aria-label="Anterior">
            ‹
          </button>
          <button className="bgc-arrow right" onClick={next} aria-label="Siguiente">
            ›
          </button>

          {/* Dots */}
          <div className="bgc-dots" role="tablist" aria-label="Paginación carrusel">
            {images.map((_, i) => (
              <button
                key={i}
                className={`bgc-dot ${i === idx ? "active" : ""}`}
                onClick={() => setIdx(i)}
                role="tab"
                aria-selected={i === idx}
                aria-label={`Ir al slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
