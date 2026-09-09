"use client";

import { useEffect, useRef } from "react";

type WebNode = {
  x: number;
  y: number;
  anchorX: number;
  anchorY: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
};

type Ripple = {
  x: number;
  y: number;
  life: number;
  maxLife: number;
};

const MAX_NODES = 110;
const MAX_RIPPLES = 8;
const NODE_INTERVAL = 24;
const MAX_CONNECTION_DISTANCE = 65;
const MAX_CURSOR_DISTANCE = 100;
const MAX_DPR = 2;
const TARGET_FRAME_MS = 1000 / 60;

export default function SpideyCursor() {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const canvas = canvasRef.current;

    if (!cursor || !canvas) return;

    const ctx = canvas.getContext("2d", {
      alpha: true,
    });

    if (!ctx) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    let currentX = mouseX;
    let currentY = mouseY;

    let previousX = currentX;
    let previousY = currentY;

    let lastNodeTime = 0;
    let lastTime = performance.now();

    let animationFrame = 0;
    let destroyed = false;
    let pageVisible = !document.hidden;

    const nodes: WebNode[] = [];
    const ripples: Ripple[] = [];

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const isMobile = () => window.innerWidth < 768;

    /*
     * ---------------------------------------------------------
     * CANVAS RESIZE
     * ---------------------------------------------------------
     */

    const resizeCanvas = () => {
      const dpr = Math.min(
        window.devicePixelRatio || 1,
        MAX_DPR
      );

      const width = Math.max(1, window.innerWidth);
      const height = Math.max(1, window.innerHeight);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
      );
    };

    const clearCanvas = () => {
      ctx.clearRect(
        0,
        0,
        window.innerWidth,
        window.innerHeight
      );
    };

    /*
     * ---------------------------------------------------------
     * MOUSE
     * ---------------------------------------------------------
     */

    const handleMouseMove = (event: PointerEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const handleMouseDown = (event: MouseEvent) => {
      if (
        prefersReducedMotion.matches ||
        isMobile()
      ) {
        return;
      }

      ripples.push({
        x: event.clientX,
        y: event.clientY,
        life: 0,
        maxLife: 420,
      });

      if (ripples.length > MAX_RIPPLES) {
        ripples.splice(
          0,
          ripples.length - MAX_RIPPLES
        );
      }
    };

    /*
     * ---------------------------------------------------------
     * TAB VISIBILITY
     * ---------------------------------------------------------
     */

    const handleVisibilityChange = () => {
      pageVisible = !document.hidden;

      lastTime = performance.now();
    };

    /*
     * ---------------------------------------------------------
     * CREATE WEB NODE
     * ---------------------------------------------------------
     */

    const createNode = (
      x: number,
      y: number,
      velocityX: number,
      velocityY: number,
      now: number
    ) => {
      const speed = Math.hypot(
        velocityX,
        velocityY
      );

      if (speed < 1.5) {
        return;
      }

      if (
        now - lastNodeTime <
        NODE_INTERVAL
      ) {
        return;
      }

      lastNodeTime = now;

      const direction = Math.atan2(
        velocityY,
        velocityX
      );

      const angle =
        direction +
        Math.PI +
        (Math.random() - 0.5) * 1.8;

      const distance =
        8 +
        Math.random() *
          Math.min(speed * 2.2, 32);

      const nodeX =
        x + Math.cos(angle) * distance;

      const nodeY =
        y + Math.sin(angle) * distance;

      const maxLife =
        350 +
        Math.random() * 500;

      const nodeSpeed =
        0.15 +
        Math.random() * 0.55;

      nodes.push({
        x: nodeX,
        y: nodeY,

        anchorX: nodeX,
        anchorY: nodeY,

        vx:
          Math.cos(angle) *
          nodeSpeed,

        vy:
          Math.sin(angle) *
          nodeSpeed,

        life: maxLife,
        maxLife,

        size:
          0.7 +
          Math.random() * 1.4,
      });

      if (nodes.length > MAX_NODES) {
        nodes.splice(
          0,
          nodes.length - MAX_NODES
        );
      }
    };

    /*
     * ---------------------------------------------------------
     * UPDATE
     * ---------------------------------------------------------
     */

    const update = (
      deltaMs: number
    ) => {
      const frameScale = Math.min(
        deltaMs / TARGET_FRAME_MS,
        2
      );

      for (const node of nodes) {
        node.life -= deltaMs;

        node.x +=
          node.vx * frameScale;

        node.y +=
          node.vy * frameScale;
      }

      for (const ripple of ripples) {
        ripple.life += deltaMs;
      }

      for (
        let i = nodes.length - 1;
        i >= 0;
        i--
      ) {
        if (nodes[i].life <= 0) {
          nodes.splice(i, 1);
        }
      }

      for (
        let i = ripples.length - 1;
        i >= 0;
        i--
      ) {
        if (
          ripples[i].life >=
          ripples[i].maxLife
        ) {
          ripples.splice(i, 1);
        }
      }
    };

    /*
     * ---------------------------------------------------------
     * DRAW LINE
     * ---------------------------------------------------------
     */

    const drawLine = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      opacity: number,
      width: number,
      red = false
    ) => {
      if (opacity <= 0) {
        return;
      }

      ctx.beginPath();

      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);

      ctx.strokeStyle = red
        ? `rgba(239,68,68,${opacity})`
        : `rgba(255,255,255,${opacity})`;

      ctx.lineWidth = width;

      ctx.stroke();
    };

    /*
     * ---------------------------------------------------------
     * DRAW NETWORK
     * ---------------------------------------------------------
     */

    const drawNetwork = () => {
      clearCanvas();

      /*
       * Disable expensive canvas shadows.
       * The CSS cursor still provides the glow.
       */
      ctx.shadowBlur = 0;

      /*
       * -------------------------------------------------------
       * NODE NETWORK
       * -------------------------------------------------------
       */

      for (
        let i = 0;
        i < nodes.length;
        i++
      ) {
        const node = nodes[i];

        if (node.life <= 0) {
          continue;
        }

        const opacity = Math.max(
          0,
          Math.min(
            1,
            node.life /
              node.maxLife
          )
        );

        /*
         * Main filament
         */

        drawLine(
          node.anchorX,
          node.anchorY,
          node.x,
          node.y,
          opacity * 0.5,
          0.65
        );

        /*
         * Nearby connections
         */

        for (
          let j = i + 1;
          j < nodes.length;
          j++
        ) {
          const other = nodes[j];

          if (other.life <= 0) {
            continue;
          }

          const dx =
            node.x - other.x;

          const dy =
            node.y - other.y;

          const distanceSquared =
            dx * dx + dy * dy;

          if (
            distanceSquared >
            MAX_CONNECTION_DISTANCE *
              MAX_CONNECTION_DISTANCE
          ) {
            continue;
          }

          const distance =
            Math.sqrt(
              distanceSquared
            );

          const otherOpacity =
            Math.max(
              0,
              Math.min(
                1,
                other.life /
                  other.maxLife
              )
            );

          const connectionOpacity =
            (1 -
              distance /
                MAX_CONNECTION_DISTANCE) *
            Math.min(
              opacity,
              otherOpacity
            ) *
            0.32;

          drawLine(
            node.x,
            node.y,
            other.x,
            other.y,
            connectionOpacity,
            0.45
          );
        }

        /*
         * Node point
         */

        ctx.beginPath();

        ctx.arc(
          node.x,
          node.y,
          node.size,
          0,
          Math.PI * 2
        );

        ctx.fillStyle =
          `rgba(255,255,255,${opacity * 0.9})`;

        ctx.fill();
      }

      /*
       * -------------------------------------------------------
       * CURSOR CONNECTIONS
       * -------------------------------------------------------
       */

      for (const node of nodes) {
        if (node.life <= 0) {
          continue;
        }

        const dx =
          currentX - node.x;

        const dy =
          currentY - node.y;

        const distanceSquared =
          dx * dx + dy * dy;

        if (
          distanceSquared >
          MAX_CURSOR_DISTANCE *
            MAX_CURSOR_DISTANCE
        ) {
          continue;
        }

        const distance =
          Math.sqrt(
            distanceSquared
          );

        const opacity =
          (1 -
            distance /
              MAX_CURSOR_DISTANCE) *
          Math.max(
            0,
            Math.min(
              1,
              node.life /
                node.maxLife
            )
          ) *
          0.42;

        drawLine(
          currentX,
          currentY,
          node.x,
          node.y,
          opacity,
          0.5
        );
      }

      /*
       * -------------------------------------------------------
       * CLICK RIPPLES
       * -------------------------------------------------------
       */

      for (const ripple of ripples) {
        const progress =
          Math.max(
            0,
            Math.min(
              1,
              ripple.life /
                ripple.maxLife
            )
          );

        const radius =
          progress * 55;

        const opacity =
          1 - progress;

        /*
         * Circle
         */

        ctx.beginPath();

        ctx.arc(
          ripple.x,
          ripple.y,
          radius,
          0,
          Math.PI * 2
        );

        ctx.strokeStyle =
          `rgba(239,68,68,${opacity * 0.8})`;

        ctx.lineWidth = 1;

        ctx.stroke();

        /*
         * Crosshair
         */

        ctx.beginPath();

        ctx.moveTo(
          ripple.x - radius,
          ripple.y
        );

        ctx.lineTo(
          ripple.x + radius,
          ripple.y
        );

        ctx.moveTo(
          ripple.x,
          ripple.y - radius
        );

        ctx.lineTo(
          ripple.x,
          ripple.y + radius
        );

        ctx.strokeStyle =
          `rgba(255,255,255,${opacity * 0.35})`;

        ctx.lineWidth = 0.5;

        ctx.stroke();
      }
    };

    /*
     * ---------------------------------------------------------
     * ANIMATION
     * ---------------------------------------------------------
     */

    const animate = (
      now: number
    ) => {
      if (destroyed) {
        return;
      }

      const deltaMs =
        Math.min(
          now - lastTime,
          50
        );

      lastTime = now;

      /*
       * -------------------------------------------------------
       * CURSOR MOVEMENT
       * -------------------------------------------------------
       * The cursor must ALWAYS follow the pointer on desktop.
       * Reduced-motion settings disable particles, not tracking.
       */

      currentX +=
        (mouseX - currentX) *
        0.30;

      currentY +=
        (mouseY - currentY) *
        0.30;

      /*
       * Cursor velocity
       */

      const velocityX =
        currentX - previousX;

      const velocityY =
        currentY - previousY;

      const velocity =
        Math.hypot(
          velocityX,
          velocityY
        );

      /*
       * Cursor intensity
       */

      const intensity =
        Math.min(
          velocity / 20,
          1
        );

      const scale =
        1 +
        intensity * 0.22;

      /*
       * Update DOM cursor
       */

      cursor.style.transform =
        `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%) scale(${scale})`;

      cursor.style.setProperty(
        "--cursor-intensity",
        `${intensity}`
      );

      /*
       * -------------------------------------------------------
       * WEB NETWORK
       * -------------------------------------------------------
       * Keep the cursor responsive even when reduced motion is
       * enabled or the page is temporarily hidden.
       */

      if (
        pageVisible &&
        !prefersReducedMotion.matches &&
        !isMobile()
      ) {
        createNode(
          currentX,
          currentY,
          velocityX,
          velocityY,
          now
        );

        update(deltaMs);
        drawNetwork();
      } else {
        clearCanvas();
      }

      /*
       * Store position
       */

      previousX = currentX;
      previousY = currentY;

      animationFrame =
        requestAnimationFrame(
          animate
        );
    };

    /*
     * ---------------------------------------------------------
     * REDUCED MOTION
     * ---------------------------------------------------------
     */

    const handleMotionPreferenceChange =
      () => {
        nodes.length = 0;
        ripples.length = 0;

        lastTime =
          performance.now();

        clearCanvas();
      };

    /*
     * ---------------------------------------------------------
     * INITIALIZATION
     * ---------------------------------------------------------
     */

    resizeCanvas();

    cursor.style.transform =
      `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%) scale(1)`;

    window.addEventListener(
      "pointermove",
      handleMouseMove,
      { passive: true }
    );

    window.addEventListener(
      "mousedown",
      handleMouseDown,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      resizeCanvas,
      { passive: true }
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    if (
      typeof prefersReducedMotion.addEventListener ===
      "function"
    ) {
      prefersReducedMotion.addEventListener(
        "change",
        handleMotionPreferenceChange
      );
    }

    animationFrame =
      requestAnimationFrame(
        animate
      );

    /*
     * ---------------------------------------------------------
     * CLEANUP
     * ---------------------------------------------------------
     */

    return () => {
      destroyed = true;

      cancelAnimationFrame(
        animationFrame
      );

      window.removeEventListener(
        "pointermove",
        handleMouseMove
      );

      window.removeEventListener(
        "mousedown",
        handleMouseDown
      );

      window.removeEventListener(
        "resize",
        resizeCanvas
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      if (
        typeof prefersReducedMotion.removeEventListener ===
        "function"
      ) {
        prefersReducedMotion.removeEventListener(
          "change",
          handleMotionPreferenceChange
        );
      }

      nodes.length = 0;
      ripples.length = 0;

      ctx.setTransform(
        1,
        0,
        0,
        1,
        0,
        0
      );

      clearCanvas();
    };
  }, []);

  return (
    <>
      {/* =====================================================
          CYBER WEB NETWORK
      ===================================================== */}

      <canvas
        ref={canvasRef}
        className="cyber-web-network"
        aria-hidden="true"
      />

      {/* =====================================================
          CYBER WEB CURSOR
      ===================================================== */}

      <div
        ref={cursorRef}
        className="cyber-web-cursor"
        aria-hidden="true"
      >
        {/* HUD FRAME */}

        <div className="web-hud">
          <span className="hud-line hud-line-top" />
          <span className="hud-line hud-line-right" />
          <span className="hud-line hud-line-bottom" />
          <span className="hud-line hud-line-left" />
        </div>

        {/* ROTATING SECURITY RING */}

        <div className="web-ring" />

        {/* TARGETING RING */}

        <div className="web-target">
          <span />
          <span />
          <span />
          <span />
        </div>

        {/* CRIMSON CORE */}

        <div className="web-core">
          <div className="core-center" />
        </div>

        {/* STATUS INDICATOR */}

        <div className="web-status" />

        {/* CROSSHAIR */}

        <div className="web-crosshair">
          <i />
          <i />
        </div>
      </div>

      <style jsx global>{`
        /* =====================================================
           CANVAS
        ===================================================== */

        .cyber-web-network {
          position: fixed;
          inset: 0;

          width: 100vw;
          height: 100vh;

          z-index: 999997;

          pointer-events: none;

          overflow: hidden;
        }

        /* =====================================================
           MAIN CURSOR
        ===================================================== */

        .cyber-web-cursor {
          --cursor-scale: 1;
          --cursor-intensity: 0;

          position: fixed;

          left: 0;
          top: 0;

          width: 32px;
          height: 32px;

          z-index: 999999;

          pointer-events: none;

          transform:
            translate3d(0, 0, 0)
            translate(-50%, -50%)
            scale(var(--cursor-scale));

          will-change: transform, filter;

          filter:
            drop-shadow(
              0 0
              calc(
                5px +
                var(--cursor-intensity) * 8px
              )
              rgba(239, 68, 68, 0.5)
            );
        }

        /* =====================================================
           HUD FRAME
        ===================================================== */

        .web-hud {
          position: absolute;

          inset: -7px;

          transform: rotate(45deg);

          opacity: 0.8;
        }

        .hud-line {
          position: absolute;

          display: block;

          background:
            rgba(255, 255, 255, 0.7);

          box-shadow:
            0 0 5px
            rgba(255, 255, 255, 0.6);
        }

        .hud-line-top,
        .hud-line-bottom {
          width: 8px;
          height: 1px;
        }

        .hud-line-top {
          top: 0;
          left: 50%;

          transform:
            translateX(-50%);
        }

        .hud-line-bottom {
          bottom: 0;
          left: 50%;

          transform:
            translateX(-50%);
        }

        .hud-line-left,
        .hud-line-right {
          width: 1px;
          height: 8px;
        }

        .hud-line-left {
          left: 0;
          top: 50%;

          transform:
            translateY(-50%);
        }

        .hud-line-right {
          right: 0;
          top: 50%;

          transform:
            translateY(-50%);
        }

        /* =====================================================
           ROTATING RING
        ===================================================== */

        .web-ring {
          position: absolute;

          inset: 1px;

          border-radius: 50%;

          border:
            1px solid
            rgba(239, 68, 68, 0.65);

          border-top-color:
            rgba(255, 255, 255, 0.9);

          border-right-color:
            rgba(255, 255, 255, 0.2);

          box-shadow:
            0 0 5px
            rgba(239, 68, 68, 0.5),

            inset 0 0 5px
            rgba(239, 68, 68, 0.25);

          animation:
            webRingSpin
            2.8s
            linear
            infinite;
        }

        @keyframes webRingSpin {
          from {
            transform:
              rotate(0deg);
          }

          to {
            transform:
              rotate(360deg);
          }
        }

        /* =====================================================
           TARGET
        ===================================================== */

        .web-target {
          position: absolute;

          inset: 6px;

          border:
            1px dashed
            rgba(255, 255, 255, 0.45);

          border-radius: 50%;

          animation:
            targetPulse
            1.4s
            ease-in-out
            infinite;
        }

        @keyframes targetPulse {
          0%,
          100% {
            opacity: 0.45;
          }

          50% {
            opacity: 0.9;
          }
        }

        .web-target span {
          position: absolute;

          width: 3px;
          height: 3px;

          border-radius: 50%;

          background:
            #ffffff;

          box-shadow:
            0 0 5px
            #ffffff;
        }

        .web-target span:nth-child(1) {
          top: -2px;
          left: 50%;
        }

        .web-target span:nth-child(2) {
          right: -2px;
          top: 50%;
        }

        .web-target span:nth-child(3) {
          bottom: -2px;
          left: 50%;
        }

        .web-target span:nth-child(4) {
          left: -2px;
          top: 50%;
        }

        /* =====================================================
           CRIMSON CORE
        ===================================================== */

        .web-core {
          position: absolute;

          left: 50%;
          top: 50%;

          width: 12px;
          height: 12px;

          transform:
            translate(-50%, -50%);

          border-radius: 50%;

          background:
            radial-gradient(
              circle,
              #ffffff 0%,
              #ef4444 25%,
              #b91c1c 58%,
              #450a0a 100%
            );

          box-shadow:
            0 0 5px
            rgba(255, 255, 255, 0.9),

            0 0 13px
            rgba(239, 68, 68, 0.85),

            0 0 24px
            rgba(239, 68, 68, 0.45);
        }

        /* =====================================================
           CORE PULSE
        ===================================================== */

        .core-center {
          position: absolute;

          left: 50%;
          top: 50%;

          width: 3px;
          height: 3px;

          transform:
            translate(-50%, -50%);

          border-radius: 50%;

          background:
            #ffffff;

          box-shadow:
            0 0 7px #ffffff,
            0 0 12px #ffffff;

          animation:
            corePulse
            800ms
            ease-in-out
            infinite;
        }

        @keyframes corePulse {
          0%,
          100% {
            transform:
              translate(-50%, -50%)
              scale(0.7);
          }

          50% {
            transform:
              translate(-50%, -50%)
              scale(1.4);
          }
        }

        /* =====================================================
           STATUS LIGHT
        ===================================================== */

        .web-status {
          position: absolute;

          right: 1px;
          top: 2px;

          width: 4px;
          height: 4px;

          border-radius: 50%;

          background:
            #ffffff;

          box-shadow:
            0 0 5px #ffffff,
            0 0 9px #ef4444;

          animation:
            statusBlink
            900ms
            ease-in-out
            infinite;
        }

        @keyframes statusBlink {
          0%,
          100% {
            opacity: 0.35;
          }

          50% {
            opacity: 1;
          }
        }

        /* =====================================================
           CROSSHAIR
        ===================================================== */

        .web-crosshair {
          position: absolute;

          left: 50%;
          top: 50%;

          width: 22px;
          height: 22px;

          transform:
            translate(-50%, -50%);
        }

        .web-crosshair i {
          position: absolute;

          display: block;

          background:
            rgba(255, 255, 255, 0.45);
        }

        .web-crosshair i:first-child {
          left: 50%;
          top: 0;

          width: 1px;
          height: 100%;

          transform:
            translateX(-50%);
        }

        .web-crosshair i:last-child {
          left: 0;
          top: 50%;

          width: 100%;
          height: 1px;

          transform:
            translateY(-50%);
        }

        /* =====================================================
           DESKTOP
        ===================================================== */

        @media (min-width: 768px) {
          html,
          body,
          * {
            cursor: none !important;
          }
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 767px) {
          .cyber-web-cursor,
          .cyber-web-network {
            display: none !important;
          }

          html,
          body,
          * {
            cursor: auto !important;
          }
        }

        /* =====================================================
           ACCESSIBILITY
        ===================================================== */

        @media (prefers-reduced-motion: reduce) {
          .web-ring,
          .web-target,
          .core-center,
          .web-status {
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
}