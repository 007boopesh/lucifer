"use client";

import * as React from "react";

type RippleDisplacementSliderProps = {
  images?: string[];
  className?: string;
};

const defaultImages = [
  "/gallery/photo-01.jpg",
  "/gallery/photo-02.jpg",
  "/gallery/photo-03.jpg",
  "/gallery/photo-04.jpg",
  "/gallery/photo-05.jpg",
];

export function RippleDisplacementSlider({
  images = defaultImages,
  className = "",
}: RippleDisplacementSliderProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isAnimating, setIsAnimating] = React.useState(false);

  const total = images.length;

  const goToSlide = (index: number) => {
    if (isAnimating || total <= 1) return;

    setIsAnimating(true);
    setActiveIndex((index + total) % total);

    window.setTimeout(() => {
      setIsAnimating(false);
    }, 650);
  };

  const nextSlide = () => {
    goToSlide(activeIndex + 1);
  };

  const previousSlide = () => {
    goToSlide(activeIndex - 1);
  };

  React.useEffect(() => {
    if (total <= 1) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        previousSlide();
      }

      if (event.key === "ArrowRight") {
        nextSlide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex, total, isAnimating]);

  if (!total) {
    return null;
  }

  return (
    <div
      className={`relative h-[600px] w-full overflow-hidden rounded-[28px] bg-black ${className}`}
    >
      {/* Background images */}
      {images.map((image, index) => {
        const isActive = index === activeIndex;

        return (
          <div
            key={`${image}-${index}`}
            className={`absolute inset-0 transition-all duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isActive
                ? "scale-100 opacity-100"
                : "scale-[1.08] opacity-0"
            }`}
          >
            <img
              src={image}
              alt={`Gallery image ${index + 1}`}
              draggable={false}
              className="h-full w-full select-none object-cover"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/35" />

            {/* Red cinematic gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />

            {/* Ripple-style distortion rings */}
            {isActive && (
              <>
                <span className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-red-500/20 animate-[ripple_1.8s_ease-out_infinite]" />

                <span className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-red-500/15 animate-[ripple_1.8s_ease-out_0.6s_infinite]" />

                <span className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-red-500/10 animate-[ripple_1.8s_ease-out_1.2s_infinite]" />
              </>
            )}
          </div>
        );
      })}

      {/* Top information */}
      <div className="absolute left-6 top-6 z-20 sm:left-8 sm:top-8">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.9)]" />

          <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-red-400">
            Visual Archive
          </span>
        </div>

        <p className="mt-3 font-mono text-[10px] tracking-[0.18em] text-white/50">
          BOOPESH_K
        </p>
      </div>

      {/* Large slide number */}
      <div className="pointer-events-none absolute right-6 top-4 z-20 sm:right-10">
        <span className="font-mono text-7xl font-bold tracking-[-0.08em] text-white/[0.08] sm:text-9xl">
          {String(activeIndex + 1).padStart(2, "0")}
        </span>
      </div>

      {/* Center ripple button */}
      <button
        type="button"
        onClick={nextSlide}
        aria-label="Next gallery image"
        className="group absolute left-1/2 top-1/2 z-30 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-red-500/40 bg-black/45 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-red-500 hover:bg-red-500/10 focus:outline-none focus:ring-2 focus:ring-red-500/50"
      >
        <span className="absolute inset-2 rounded-full border border-red-500/20 transition-all duration-500 group-hover:scale-125 group-hover:border-red-500/40" />

        <span className="relative ml-1 text-xl text-red-500 transition-transform duration-300 group-hover:translate-x-1">
          →
        </span>
      </button>

      {/* Bottom information */}
      <div className="absolute bottom-6 left-6 right-6 z-20 sm:bottom-8 sm:left-8 sm:right-8">
        <div className="flex items-end justify-between gap-5">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-red-500">
              Gallery / {String(activeIndex + 1).padStart(2, "0")}
            </p>

            <h3 className="mt-2 text-3xl font-black uppercase tracking-tight text-white sm:text-5xl">
              BOOPESH_K
            </h3>
          </div>

          <div className="hidden font-mono text-[8px] uppercase tracking-[0.2em] text-white/40 sm:block">
            ← → Navigate
          </div>
        </div>

        {/* Progress */}
        <div className="mt-6 flex items-center gap-2">
          {images.map((_, index) => (
            <button
              key={`ripple-dot-${index}`}
              type="button"
              aria-label={`Show gallery image ${index + 1}`}
              aria-current={activeIndex === index ? "true" : undefined}
              onClick={() => goToSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                activeIndex === index
                  ? "w-10 bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]"
                  : "w-3 bg-white/30 hover:bg-red-500/60"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="absolute bottom-7 right-6 z-30 flex items-center gap-2 sm:right-8">
        <button
          type="button"
          onClick={previousSlide}
          aria-label="Previous gallery image"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white/70 backdrop-blur-md transition-all duration-300 hover:border-red-500/60 hover:bg-red-500/10 hover:text-red-400 active:scale-90"
        >
          ←
        </button>

        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next gallery image"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-red-500/40 bg-red-500/10 text-red-500 backdrop-blur-md transition-all duration-300 hover:border-red-500 hover:bg-red-500 hover:text-white active:scale-90"
        >
          →
        </button>
      </div>

      <style jsx>{`
        @keyframes ripple {
          0% {
            opacity: 0.65;
            transform: translate(-50%, -50%) scale(0.6);
          }

          70% {
            opacity: 0.15;
          }

          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(5);
          }
        }
      `}</style>
    </div>
  );
}