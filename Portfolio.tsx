"use client";

import { useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent, ComponentType, SVGProps } from "react";
import {
  motion,
  MotionConfig,
  useMotionValue,
  useSpring,
} from "framer-motion";

import {
  Github,
  Linkedin,
  Instagram,
  Mail,
  MapPin,
  ArrowUpRight,
  Download,
  Cpu,
  CircuitBoard,
  Globe,
  Video,
  Palette,
  Bot,
  Smartphone,
  Database,
  ExternalLink,
  Code2,
  Wifi,
  GitBranch,
  Home,
  User,
  Briefcase,
  FolderKanban,
  Award,
  Wrench,
  Sparkles,
  Images,
  GraduationCap,
  X,
  Terminal,
  Activity,
  ShieldCheck,
  Zap,
  ScanLine,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";




/* =========================================================
   EXISTING SPIDER-MAN CURSOR
   The original project already contains ./SpideyCursor.
   Keep using that component so its full custom mouse-arrow
   animation/design is preserved on desktop.
========================================================= */

/* =========================================================
   BUILT-IN SPIDER-MAN CYBER WEB CURSOR
========================================================= */

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

function SpideyCursor() {
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

    const handleMouseDown = (event: globalThis.MouseEvent) => {
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

const FRAME_COUNT = 257;
const FRAME_PATH = (index: number) =>
  `/frames/frames-${String(index + 1).padStart(3, "0")}.jpg`;

function ScrollCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const loadedRef = useRef<boolean[]>([]);
  const currentFrameRef = useRef(0);
  const targetFrameRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const resizeRafRef = useRef<number | null>(null);

  const mobileHeightRef = useRef<number | null>(null);
  const viewportWidthRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d", {
      alpha: true,
      desynchronized: true,
    });

    if (!context) return;

    let destroyed = false;
    let lastScrollY = -1;
    let mobileAnimationRaf: number | null = null;
    let lastMobileTime = performance.now();
    let lastPaintedFrame = -1;

    const isMobile = () => window.innerWidth <= 767;

    /*
     * MOBILE VIEWPORT LOCK
     *
     * Mobile Safari/Chrome can change innerHeight when the address bar
     * appears/disappears. Do NOT resize the canvas during normal scrolling.
     * That is what prevents the cinematic frames from looking like they
     * suddenly zoom or stretch.
     */
    const getViewport = () => {
      const width = window.innerWidth;
      let height = window.innerHeight;

      if (width <= 767) {
        if (
          mobileHeightRef.current === null ||
          viewportWidthRef.current !== width
        ) {
          mobileHeightRef.current = Math.max(1, window.innerHeight);
          viewportWidthRef.current = width;
        }

        height = mobileHeightRef.current;
      } else {
        viewportWidthRef.current = width;
        height = window.innerHeight;
      }

      return {
        width,
        height,
        valid: width > 0 && height > 0,
      };
    };

    const getDpr = () =>
      Math.min(
        window.devicePixelRatio || 1,
        isMobile() ? 1.5 : 2
      );

    /*
     * IMPORTANT:
     * Every one of the 257 images uses the exact same object-fit: cover
     * calculation. No frame gets a different scale or position.
     */
    const paintFrame = (frameIndex: number) => {
      if (destroyed) return;

      const image = imagesRef.current[frameIndex];

      if (
        !image ||
        !loadedRef.current[frameIndex] ||
        !image.naturalWidth ||
        !image.naturalHeight
      ) {
        return;
      }

      const { width, height, valid } = getViewport();

      if (!valid) return;

      const imageRatio =
        image.naturalWidth / image.naturalHeight;

      const viewportRatio = width / height;

      let drawWidth = width;
      let drawHeight = height;
      let offsetX = 0;
      let offsetY = 0;

      if (imageRatio > viewportRatio) {
        drawHeight = height;
        drawWidth = height * imageRatio;
        offsetX = (width - drawWidth) / 2;
      } else {
        drawWidth = width;
        drawHeight = width / imageRatio;
        offsetY = (height - drawHeight) / 2;
      }

      const dpr = getDpr();

      context.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
      );

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";

      context.clearRect(
        0,
        0,
        width,
        height
      );

      context.drawImage(
        image,
        Math.round(offsetX),
        Math.round(offsetY),
        Math.round(drawWidth),
        Math.round(drawHeight)
      );

      lastPaintedFrame = frameIndex;
    };

    const clampFrame = (value: number) =>
      Math.max(
        0,
        Math.min(
          FRAME_COUNT - 1,
          Math.round(value)
        )
      );

    /*
     * FRAME 001 → FRAME 257
     *
     * Frame 001 is exactly at the top of the page.
     * Frame 257 is exactly at the bottom.
     * Every integer frame between them is addressable.
     */
    const getScrollFrame = () => {
      const { height } = getViewport();

      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - height
      );

      const progress = Math.max(
        0,
        Math.min(
          1,
          window.scrollY / maxScroll
        )
      );

      return progress * (FRAME_COUNT - 1);
    };

    /*
     * DESKTOP:
     * Keep the original event-driven renderer. This avoids changing the
     * desktop interaction/performance or visual design.
     */
    const drawDesktop = () => {
      rafRef.current = null;

      if (destroyed) return;

      const frame = clampFrame(
        targetFrameRef.current
      );

      let paintable = frame;
      if (!loadedRef.current[paintable]) {
        for (let distance = 1; distance < FRAME_COUNT; distance += 1) {
          const left = frame - distance;
          const right = frame + distance;
          if (left >= 0 && loadedRef.current[left]) { paintable = left; break; }
          if (right < FRAME_COUNT && loadedRef.current[right]) { paintable = right; break; }
        }
      }

      if (loadedRef.current[paintable] && paintable !== lastPaintedFrame) {
        currentFrameRef.current = paintable;
        paintFrame(paintable);
      }
    };

    const requestDesktopDraw = () => {
      if (rafRef.current === null) {
        rafRef.current =
          window.requestAnimationFrame(
            drawDesktop
          );
      }
    };

    /*
     * MOBILE:
     * Follow requestAnimationFrame so the sequence is updated on the
     * display's refresh cadence (60Hz/90Hz/120Hz depending on device).
     *
     * There is NO CSS frame animation and NO orange placeholder frame.
     * If a requested frame has not decoded yet, the previous valid frame
     * stays on screen until the requested frame is ready.
     */
    const mobileLoop = (now: number) => {
      if (destroyed) return;

      const dt = Math.min(
        50,
        Math.max(
          1,
          now - lastMobileTime
        )
      );

      lastMobileTime = now;

      const exactTarget = getScrollFrame();

      targetFrameRef.current = exactTarget;

      const current =
        currentFrameRef.current;

      /*
       * Small easing removes touch micro-jitter while still converging
       * rapidly enough to follow the scroll position frame-by-frame.
       */
      const blend =
        1 - Math.exp(-dt / 24);

      const next =
        current +
        (exactTarget - current) *
          blend;

      currentFrameRef.current = next;

      const frame = clampFrame(next);

      if (
        loadedRef.current[frame] &&
        frame !== lastPaintedFrame
      ) {
        paintFrame(frame);
      }

      mobileAnimationRaf =
        window.requestAnimationFrame(
          mobileLoop
        );
    };

    /*
     * SCROLL TARGET
     */
    const updateTargetFromScroll = () => {
      const scrollY = window.scrollY;

      if (
        scrollY === lastScrollY &&
        isMobile()
      ) {
        return;
      }

      lastScrollY = scrollY;

      targetFrameRef.current =
        getScrollFrame();

      const frameWindow = window as Window & {
        __portfolioFramePump?: () => void;
      };
      frameWindow.__portfolioFramePump?.();

      if (!isMobile()) {
        requestDesktopDraw();
      }
    };

    /*
     * CANVAS RESIZE
     *
     * Mobile is resized only on actual orientation/width changes.
     * Normal address-bar changes are intentionally ignored.
     */
    const resizeCanvas = () => {
      if (resizeRafRef.current !== null) {
        return;
      }

      resizeRafRef.current =
        window.requestAnimationFrame(() => {
          resizeRafRef.current = null;

          if (destroyed) return;

          const {
            width,
            height,
            valid,
          } = getViewport();

          if (!valid) return;

          const dpr = getDpr();

          canvas.width = Math.max(
            1,
            Math.floor(width * dpr)
          );

          canvas.height = Math.max(
            1,
            Math.floor(height * dpr)
          );

          canvas.style.width =
            `${width}px`;

          canvas.style.height =
            `${height}px`;

          canvas.style.left = "0";
          canvas.style.top = "0";

          context.setTransform(
            dpr,
            0,
            0,
            dpr,
            0,
            0
          );

          context.clearRect(
            0,
            0,
            width,
            height
          );

          const frame =
            clampFrame(
              currentFrameRef.current
            );

          if (
            loadedRef.current[frame]
          ) {
            paintFrame(frame);
          } else if (
            loadedRef.current[0]
          ) {
            paintFrame(0);
          }
        });
    };

    /*
     * COMPLETE 257-FRAME LOADER
     *
     * All files are requested:
     *   /frames/frames-001.jpg
     *   ...
     *   /frames/frames-257.jpg
     *
     * No generated blocks, gradients or placeholder frames are ever drawn
     * by the canvas.
     */
    /*
     * STAGED 257-FRAME LOADER
     *
     * All 257 frames remain addressable. Frames are loaded progressively
     * instead of opening 257 network/decoder jobs at the same time.
     */
    const loadAllFrames = () => {
      const images = new Array<HTMLImageElement>(FRAME_COUNT);
      const loaded = new Array<boolean>(FRAME_COUNT).fill(false);
      const requested = new Array<boolean>(FRAME_COUNT).fill(false);

      imagesRef.current = images;
      loadedRef.current = loaded;

      let activeLoads = 0;
      const maxConcurrentLoads = isMobile() ? 5 : 8;

      const nearestLoadedFrame = (frame: number) => {
        if (loaded[frame]) return frame;

        for (let distance = 1; distance < FRAME_COUNT; distance += 1) {
          const left = frame - distance;
          const right = frame + distance;
          if (left >= 0 && loaded[left]) return left;
          if (right < FRAME_COUNT && loaded[right]) return right;
        }

        return -1;
      };

      const paintBestAvailable = () => {
        if (destroyed) return;
        const target = clampFrame(targetFrameRef.current);
        const frame = nearestLoadedFrame(target);
        if (frame >= 0 && frame !== lastPaintedFrame) {
          currentFrameRef.current = frame;
          paintFrame(frame);
        }
      };

      const priorityOrder = () => {
        const target = clampFrame(targetFrameRef.current);
        const order: number[] = [];
        const seen = new Set<number>();

        const add = (index: number) => {
          if (index >= 0 && index < FRAME_COUNT && !seen.has(index)) {
            seen.add(index);
            order.push(index);
          }
        };

        // Opening sequence first.
        for (let i = 0; i < Math.min(24, FRAME_COUNT); i += 1) add(i);

        // Then expand around the current scroll target.
        for (let distance = 0; distance < FRAME_COUNT; distance += 1) {
          add(target - distance);
          add(target + distance);
        }

        return order;
      };

      const pump = () => {
        if (destroyed) return;

        for (const index of priorityOrder()) {
          if (activeLoads >= maxConcurrentLoads) break;
          if (requested[index]) continue;

          requested[index] = true;
          activeLoads += 1;

          const image = new Image();
          image.decoding = "async";
          image.loading = "eager";
          image.fetchPriority =
            Math.abs(index - clampFrame(targetFrameRef.current)) <= 8
              ? "high"
              : "auto";

          images[index] = image;

          image.onload = () => {
            activeLoads = Math.max(0, activeLoads - 1);
            if (destroyed) return;

            loaded[index] = true;
            paintBestAvailable();
            pump();
          };

          image.onerror = () => {
            activeLoads = Math.max(0, activeLoads - 1);
            loaded[index] = false;
            console.warn(`Portfolio frame failed to load: ${FRAME_PATH(index)}`);
            pump();
          };

          image.src = FRAME_PATH(index);
        }
      };

      const frameWindow = window as Window & {
        __portfolioFramePump?: () => void;
      };
      frameWindow.__portfolioFramePump = pump;
      pump();
    };
    /*
     * INITIALIZE
     */
    resizeCanvas();
    loadAllFrames();
    updateTargetFromScroll();

    /*
     * Start the mobile renderer only on phones.
     */
    if (isMobile()) {
      lastMobileTime =
        performance.now();

      mobileAnimationRaf =
        window.requestAnimationFrame(
          mobileLoop
        );
    }

    const handleResize = () => {
      if (!isMobile()) {
        resizeCanvas();
      }
    };

    const handleOrientationChange = () => {
      mobileHeightRef.current =
        null;

      viewportWidthRef.current =
        0;

      lastPaintedFrame = -1;

      resizeCanvas();

      /*
       * Recalculate the exact frame after orientation changes.
       */
      targetFrameRef.current =
        getScrollFrame();
    };

    window.addEventListener(
      "scroll",
      updateTargetFromScroll,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      handleResize,
      { passive: true }
    );

    window.addEventListener(
      "orientationchange",
      handleOrientationChange,
      { passive: true }
    );

    return () => {
      destroyed = true;

      window.removeEventListener(
        "scroll",
        updateTargetFromScroll
      );

      window.removeEventListener(
        "resize",
        handleResize
      );

      window.removeEventListener(
        "orientationchange",
        handleOrientationChange
      );

      if (
        rafRef.current !== null
      ) {
        window.cancelAnimationFrame(
          rafRef.current
        );
      }

      if (
        mobileAnimationRaf !== null
      ) {
        window.cancelAnimationFrame(
          mobileAnimationRaf
        );
      }

      if (
        resizeRafRef.current !== null
      ) {
        window.cancelAnimationFrame(
          resizeRafRef.current
        );
      }

      rafRef.current = null;
      mobileAnimationRaf = null;
      resizeRafRef.current = null;

      imagesRef.current.forEach(
        (image: HTMLImageElement) => {
          image.onload = null;
          image.onerror = null;
        }
      );

      const frameWindow = window as Window & {
        __portfolioFramePump?: () => void;
      };
      delete frameWindow.__portfolioFramePump;

      imagesRef.current = [];
      loadedRef.current = [];

      context.setTransform(
        1,
        0,
        0,
        1,
        0,
        0
      );

      context.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="hero-canvas"
      aria-hidden="true"
      className="
        pointer-events-none
        fixed
        left-0
        top-0
        z-0
        block
      "
      style={{
        width: "100vw",
        height: "100vh",
        display: "block",
        background: "transparent",
        backgroundColor: "transparent",
        border: 0,
        outline: 0,
        boxShadow: "none",
        opacity: 1,
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility:
          "hidden",
        willChange: "transform",
      }}
    />
  );
}


type IconType = ComponentType<
  SVGProps<SVGSVGElement> & {
    size?: number | string;
    strokeWidth?: number | string;
  }
>;


/* =========================================================
   MANUAL LAYOUT CONTROL
   CHANGE ONLY THESE VALUES
========================================================= */

const LAYOUT = {
  pageWidth: "100%",
  maxWidth: "1700px",

  horizontal: "0px",
  vertical: "0px",

  heroX: "30px",
  heroY: "-25px",

  heroWidth: "100%",

  heroGap: "6rem",
};


/* =========================================================
   PROJECT DATA
========================================================= */

const projects = [
  {
    title: "Li-Fi Video & Audio Transfer",
    description:
      "A communication project exploring visible light communication for wireless audio and video data transfer.",
    category: "Communication",
    image: "./images/projects/lifi.jpg",
  },
  {
    title: "Vehicle & License Authentication",
    description:
      "An intelligent vehicle authentication concept combining image processing and identification technologies.",
    category: "Embedded / AI",
    image:
      "./images/projects/Vehicle & License Authentication.jpg",
  },
  {
    title: "Intelligent Speed Regulation Using Python",
    description:
      "A Python-based intelligent system designed to monitor and regulate vehicle speed using automation concepts.",
    category: "Python",
    image:
      "./images/projects/Intelligent Speed Regulation Using Python.jpg",
  },
  {
    title: "Smart Exam Time System",
    description:
      "A smart embedded system concept for managing examination timing and notification requirements.",
    category: "Embedded",
    image:
      "./images/projects/Smart Exam Time System.jpg",
  },
  {
    title: "Stress Analysis and Prediction System",
    description:
      "An IoT and embedded system concept involving sensors, monitoring, communication and intelligent prediction.",
    category: "IoT",
    image:
      "./images/projects/Stress Analysis and Prediction System.jpg",
  },
 
  {
    title: "Blockchain Technology",
    description:
      "Technical research and paper presentation exploring blockchain applications in healthcare security.",
    category: "Research",
    image: "./images/projects/Blockchain Technology.jpg",
  },
];


/* =========================================================
   SKILLS
========================================================= */

function PythonIcon(_props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-full w-full"
      aria-hidden="true"
      {..._props}
    >
      <path d="M12 3c-3.5 0-4 1.8-4 4v2h5v2H7c-3.2 0-4 1.5-4 4s.8 4 4 4h2v-3c0-2 1.2-3 3.2-3h3.8c2.7 0 4-1.3 4-4V7c0-2.8-1.5-4-4-4h-4Z" />
      <path d="M12 21c3.5 0 4-1.8 4-4v-2h-5v-2h6c3.2 0 4-1.5 4-4s-.8-4-4-4h-2v3c0 2-1.2 3-3.2 3H8c-2.7 0-4 1.3-4 4v2c0 2.8 1.5 4 4 4h4Z" />
      <circle cx="10" cy="6.5" r=".7" fill="currentColor" />
      <circle cx="14" cy="17.5" r=".7" fill="currentColor" />
    </svg>
  );
}

function ArduinoIcon(_props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className="h-full w-full"
      aria-hidden="true"
      {..._props}
    >
      <circle cx="8" cy="12" r="4" />
      <circle cx="16" cy="12" r="4" />
      <path d="M12 12h0M4 12H2M22 12h-2M8 8V6M16 18v-2" />
      <path d="M7 12h2M15 12h2" />
    </svg>
  );
}

function OpenCVIcon(_props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className="h-full w-full"
      aria-hidden="true"
      {..._props}
    >
      <circle cx="12" cy="12" r="8" />
      <circle cx="8" cy="12" r="2" />
      <circle cx="16" cy="8" r="2" />
      <circle cx="16" cy="16" r="2" />
      <path d="M10 12h2M14.5 9.5l-1 1M14.5 14.5l-1-1" />
    </svg>
  );
}


const skills: {
  name: string;
  icon?: IconType;
  customIcon?: ComponentType<SVGProps<SVGSVGElement>>;
  short?: string;
}[] = [
  {
    name: "Full Stack Development",
    icon: Code2,
  },
  {
    name: "Embedded Systems",
    icon: Cpu,
  },
  {
    name: "IoT",
    icon: Wifi,
  },
  {
    name: "PCB Design",
    icon: CircuitBoard,
  },
  {
    name: "Video Editing",
    icon: Video,
  },
  {
    name: "Graphic Design",
    icon: Palette,
  },
  {
    name: "Arduino",
    customIcon: ArduinoIcon,
  },
  {
    name: "Python",
    customIcon: PythonIcon,
  },
  {
    name: "OpenCV",
    customIcon: OpenCVIcon,
  },
  {
    name: "Git",
    icon: GitBranch,
  },
  {
    name: "GitHub",
    icon: Github,
  },
  {
    name: "Adobe After Effects",
    short: "Ae",
  },
  {
    name: "Adobe Media Encoder",
    short: "Me",
  },
  {
    name: "Adobe Premiere Pro",
    short: "Pr",
  },
  {
    name: "Adobe Photoshop",
    short: "Ps",
  },
];


/* =========================================================
   SERVICES
========================================================= */

const services = [
  {
    icon: Cpu,
    title: "Embedded Systems & IoT",
    description:
      "Microcontroller-based systems, sensors, automation, communication and IoT solutions.",
  },
  {
    icon: CircuitBoard,
    title: "PCB Design",
    description:
      "Electronic circuit development, schematic design and PCB implementation.",
  },
  {
    icon: Globe,
    title: "Full Stack Development",
    description:
      "Modern web applications with responsive interfaces and practical backend systems.",
  },
  {
    icon: Bot,
    title: "AI & Computer Vision",
    description:
      "Computer vision, image processing and intelligent automation concepts.",
  },
  {
    icon: Video,
    title: "Video Editing",
    description:
      "Creative video editing, motion graphics, visual storytelling and post-production.",
  },
  {
    icon: Palette,
    title: "Graphic Design",
    description:
      "Creative visual design for digital content, presentations and technical projects.",
  },
  {
    icon: Smartphone,
    title: "Digital Solutions",
    description:
      "Technology-driven solutions connecting hardware, software and user experience.",
  },
  {
    icon: Database,
    title: "Data & Applications",
    description:
      "Practical application development with structured data and modern technologies.",
  },
];


/* =========================================================
   ADDITIONAL CYBER NAVIGATION DATA
   ADDITIVE FEATURE
========================================================= */

const mobileNavItems = [
  {
    id: "home",
    label: "HOME",
    icon: Home,
  },
  {
    id: "about",
    label: "ABOUT",
    icon: User,
  },
  {
    id: "education",
    label: "EDUCATION",
    icon: GraduationCap,
  },
  {
    id: "services",
    label: "SERVICES",
    icon: Briefcase,
  },
  {
    id: "projects",
    label: "PROJECTS",
    icon: FolderKanban,
  },
  {
    id: "awards",
    label: "AWARDS",
    icon: Award,
  },
  {
    id: "skills",
    label: "SKILLS",
    icon: Wrench,
  },
  {
    id: "experience",
    label: "EXPERIENCE",
    icon: Sparkles,
  },
  {
    id: "gallery",
    label: "GALLERY",
    icon: Images,
  },
  {
    id: "contact",
    label: "CONTACT",
    icon: Mail,
  },
];


/* =========================================================
   PREMIUM CYBER 3D IDENTITY CARD
========================================================= */

function IdentityCard() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, {
    stiffness: 120,
    damping: 16,
    mass: 0.7,
  });

  const springY = useSpring(y, {
    stiffness: 120,
    damping: 16,
    mass: 0.7,
  });

  const handleMouseMove = (
    event: ReactMouseEvent<HTMLDivElement>
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();

    const mouseX =
      event.clientX -
      rect.left -
      rect.width / 2;

    const mouseY =
      event.clientY -
      rect.top -
      rect.height / 2;

    x.set(mouseX * 0.035);
    y.set(-mouseY * 0.035);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{
        rotateX: springY,
        rotateY: springX,
        transformPerspective: 1400,
      }}
      animate={{
        y: [0, -6, 0],
      }}
      transition={{
        y: {
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="mx-auto w-[290px] md:w-[350px]"
    >

      {/* STRAP */}

      <div className="relative mx-auto h-20 w-28">

        <motion.div
          animate={{
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            absolute
            left-1/2
            top-0
            h-20
            w-8
            -translate-x-1/2
            rounded-b-xl
            border-x
            border-red-500/20
            bg-gradient-to-b
            from-black
            via-zinc-800
            to-black
            shadow-[0_0_25px_rgba(255,30,45,0.15)]
          "
        />

        <motion.div
          animate={{
            y: [0, 55, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "linear",
          }}
          className="
            absolute
            left-1/2
            top-1
            z-10
            h-6
            w-px
            -translate-x-1/2
            bg-red-500
            shadow-[0_0_10px_rgba(255,30,45,1)]
          "
        />

        <div
          className="
            absolute
            bottom-0
            left-1/2
            h-5
            w-28
            -translate-x-1/2
            rounded-full
            border
            border-red-500/20
            bg-black
            shadow-[0_0_25px_rgba(255,30,45,0.15)]
          "
        />
      </div>


      {/* HOLDER */}

      <motion.div
        animate={{
          boxShadow: [
            "0 25px 50px rgba(0,0,0,0.45)",
            "0 25px 60px rgba(255,30,45,0.20)",
            "0 25px 50px rgba(0,0,0,0.45)",
          ],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          relative
          rounded-[32px]
          border
          border-red-500/20
          bg-black/95
          p-3
          shadow-2xl
        "
      >

        {/* HOLDER GLOW */}

        <motion.div
          animate={{
            opacity: [0.2, 0.7, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            pointer-events-none
            absolute
            inset-0
            rounded-[32px]
            ring-1
            ring-red-500/50
            shadow-[inset_0_0_40px_rgba(255,30,45,0.08)]
          "
        />


        {/* CARD */}

        <div
          className="
            identity-card
            group
            relative
            overflow-hidden
            rounded-[26px]
            border
            border-red-500/60
            bg-[#050505]
            shadow-[inset_0_0_80px_rgba(255,20,40,0.05)]
          "
        >

          {/* CYBER GRID */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              z-0
              opacity-20
              bg-[linear-gradient(rgba(255,30,45,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,30,45,0.12)_1px,transparent_1px)]
              bg-[size:22px_22px]
            "
          />

          {/* AMBIENT RED ATMOSPHERE */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              z-0
              bg-[radial-gradient(circle_at_50%_25%,rgba(255,30,45,0.16),transparent_45%),radial-gradient(circle_at_50%_100%,rgba(255,0,40,0.08),transparent_45%)]
            "
          />

          {/* CYBER SCANLIGHT */}

          <motion.div
            animate={{
              y: ["-100%", "500%"],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear",
            }}
            className="
              pointer-events-none
              absolute
              left-0
              top-0
              z-40
              h-24
              w-full
              bg-gradient-to-b
              from-transparent
              via-red-500/[0.07]
              to-transparent
            "
          />

          {/* CRT SCANLINES */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              z-30
              opacity-[0.08]
              bg-[repeating-linear-gradient(0deg,transparent_0px,transparent_3px,rgba(255,255,255,0.15)_4px)]
            "
          />


          {/* STATIC TOP LINE */}

          <div
            className="
              absolute
              left-1/2
              top-4
              z-30
              h-px
              w-[82%]
              -translate-x-1/2
              bg-gradient-to-r
              from-transparent
              via-red-500
              to-transparent
              shadow-[0_0_8px_rgba(255,30,45,0.8)]
            "
          />


          {/* HEADER */}

          <div
            className="
              relative
              z-20
              flex
              items-center
              justify-between
              px-6
              pb-3
              pt-7
            "
          >

            <div>

              <div className="flex items-center gap-2">

                <motion.span
                  animate={{
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="
                    h-1.5
                    w-1.5
                    rounded-full
                    bg-red-500
                    shadow-[0_0_8px_rgba(255,30,45,1)]
                  "
                />

                <p
                  className="
                    font-mono
                    text-[9px]
                    tracking-[0.35em]
                    text-white/50
                  "
                >
                  IDENTITY / ECE
                </p>

              </div>

              <p
                className="
                  mt-1
                  font-mono
                  text-[8px]
                  tracking-[0.2em]
                  text-red-500
                "
              >
                PREMIUM DIGITAL PROFILE
              </p>

            </div>


            {/* ID BADGE */}

            <motion.div
              animate={{
                opacity: [0.6, 1, 0.6],
                boxShadow: [
                  "0 0 0 rgba(255,30,45,0)",
                  "0 0 15px rgba(255,30,45,0.25)",
                  "0 0 0 rgba(255,30,45,0)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="
                relative
                overflow-hidden
                rounded-md
                border
                border-red-500/50
                bg-red-500/[0.04]
                px-2.5
                py-1
              "
            >

              <motion.div
                animate={{
                  x: ["-150%", "150%"],
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="
                  absolute
                  inset-y-0
                  w-5
                  bg-gradient-to-r
                  from-transparent
                  via-red-500/30
                  to-transparent
                "
              />

              <span
                className="
                  relative
                  font-mono
                  text-[9px]
                  tracking-widest
                  text-red-500
                "
              >
                BOOPESH007
              </span>

            </motion.div>

          </div>


          {/* PHOTO AREA */}

          <div
            className="
              relative
              mx-5
              overflow-hidden
              rounded-2xl
              border
              border-red-500/50
              bg-black
              shadow-[0_0_35px_rgba(255,30,45,0.12)]
            "
          >

            <div
              className="
                pointer-events-none
                absolute
                inset-0
                z-10
                bg-[radial-gradient(circle_at_center,rgba(255,30,45,0.14),transparent_62%)]
              "
            />


            {/* HUD CORNER MARKERS */}

            <div
              className="
                pointer-events-none
                absolute
                left-3
                top-3
                z-30
                h-7
                w-7
                border-l-2
                border-t-2
                border-red-500/80
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                right-3
                top-3
                z-30
                h-7
                w-7
                border-r-2
                border-t-2
                border-red-500/80
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                bottom-3
                left-3
                z-30
                h-7
                w-7
                border-b-2
                border-l-2
                border-red-500/80
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                bottom-3
                right-3
                z-30
                h-7
                w-7
                border-b-2
                border-r-2
                border-red-500/80
              "
            />


            {/* CYBER DATA LABELS */}

            <div
              className="
                absolute
                left-3
                top-12
                z-30
                font-mono
                text-[6px]
                tracking-[0.18em]
                text-red-500/60
              "
            >
              BIO_SCAN
              <br />
              98.7%
            </div>

            <div
              className="
                absolute
                right-3
                top-12
                z-30
                text-right
                font-mono
                text-[6px]
                tracking-[0.18em]
                text-red-500/60
              "
            >
              AUTH
              <br />
              VERIFIED
            </div>

            <div
              className="
                absolute
                bottom-12
                left-3
                z-30
                font-mono
                text-[6px]
                tracking-[0.18em]
                text-white/30
              "
            >
              SYS_007
            </div>

            <div
              className="
                absolute
                bottom-12
                right-3
                z-30
                text-right
                font-mono
                text-[6px]
                tracking-[0.18em]
                text-white/30
              "
            >
              ECE_CORE
            </div>


            {/* PORTRAIT */}

            <div
              className="
                relative
                flex
                aspect-square
                w-full
                items-center
                justify-center
                overflow-hidden
                bg-black
              "
            >

              <img
                src="/images/fdfd.jpg"
                alt="Boopesh K portrait"
                className="
                  relative
                  z-[5]
                  h-full
                  w-full
                  object-contain
                  object-center
                "
              />

              <div
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  z-10
                  bg-[linear-gradient(115deg,transparent_20%,rgba(255,30,45,0.05)_50%,transparent_80%)]
                  mix-blend-screen
                "
              />

            </div>


            {/* PORTRAIT SCAN LINE */}

            <motion.div
              animate={{
                y: ["0%", "100%", "0%"],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear",
              }}
              className="
                pointer-events-none
                absolute
                left-0
                top-0
                z-40
                h-px
                w-full
                bg-red-500
                shadow-[0_0_12px_rgba(255,30,45,1)]
              "
            />

          </div>


          {/* NAME */}

          <div className="relative z-20 px-6 pt-6 text-center">

            <div className="relative inline-block">

              <h3
                className="
                  font-display
                  text-4xl
                  tracking-wide
                  text-white
                  md:text-5xl
                "
              >
                BOOPESH K
              </h3>

              <motion.span
                animate={{
                  opacity: [0, 0.5, 0, 0.3, 0],
                  x: [0, 2, -2, 1, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  font-display
                  text-4xl
                  tracking-wide
                  text-red-500
                  mix-blend-screen
                  md:text-5xl
                "
              >
                BOOPESH K
              </motion.span>

            </div>

            <p
              className="
                mt-2
                font-mono
                text-[9px]
                tracking-[0.28em]
                text-red-500
              "
            >
              ELECTRONICS • EMBEDDED • FULL STACK
            </p>

          </div>


          {/* NAME DIVIDER */}

          <div
            className="
              relative
              mx-6
              mt-5
              h-px
              overflow-hidden
              bg-gradient-to-r
              from-transparent
              via-red-500/60
              to-transparent
            "
          >

            <motion.div
              animate={{
                x: ["120%", "-220%"],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                repeatDelay: 0.5,
                ease: "linear",
              }}
              className="
                absolute
                top-[-1px]
                left-0
                h-[3px]
                w-[35%]
                bg-gradient-to-r
                from-transparent
                via-red-500
                to-transparent
                blur-[1px]
                shadow-[0_0_12px_rgba(255,30,45,1)]
              "
            />

          </div>


          {/* DETAILS */}

          <div className="relative z-20 space-y-3 px-6 py-5">

            <div
              className="
                group/row
                grid
                grid-cols-[100px_1fr]
                items-center
                gap-3
              "
            >
              <span
                className="
                  font-mono
                  text-[9px]
                  tracking-[0.2em]
                  text-white/35
                "
              >
                DEPARTMENT
              </span>

              <span
                className="
                  font-mono
                  text-[10px]
                  text-white/80
                  transition-colors
                  group-hover/row:text-red-400
                "
              >
                ECE
              </span>
            </div>


            <div
              className="
                group/row
                grid
                grid-cols-[100px_1fr]
                items-center
                gap-3
              "
            >
              <span
                className="
                  font-mono
                  text-[9px]
                  tracking-[0.2em]
                  text-white/35
                "
              >
                YEAR
              </span>

              <span
                className="
                  font-mono
                  text-[10px]
                  text-white/80
                  transition-colors
                  group-hover/row:text-red-400
                "
              >
                THIRD YEAR
              </span>
            </div>


            <div
              className="
                group/row
                grid
                grid-cols-[100px_1fr]
                items-center
                gap-3
              "
            >
              <span
                className="
                  font-mono
                  text-[9px]
                  tracking-[0.2em]
                  text-white/35
                "
              >
                LOCATION
              </span>

              <span
                className="
                  font-mono
                  text-[10px]
                  text-white/80
                  transition-colors
                  group-hover/row:text-red-400
                "
              >
                SALEM, INDIA
              </span>
            </div>


            <div
              className="
                group/row
                grid
                grid-cols-[100px_1fr]
                items-start
                gap-3
              "
            >
              <span
                className="
                  font-mono
                  text-[9px]
                  tracking-[0.2em]
                  text-white/35
                "
              >
                FOCUS
              </span>

              <span
                className="
                  font-mono
                  text-[10px]
                  leading-5
                  text-white/80
                "
              >
                BUILDING DIGITAL
                <br />
                EXPERIENCES
              </span>
            </div>


            <div
              className="
                group/row
                grid
                grid-cols-[100px_1fr]
                items-start
                gap-3
              "
            >
              <span
                className="
                  font-mono
                  text-[9px]
                  tracking-[0.2em]
                  text-white/35
                "
              >
                CONTACT
              </span>

              <span
                className="
                  break-all
                  font-mono
                  text-[10px]
                  leading-5
                  text-white/80
                "
              >
                007boopesh@gmail.com
              </span>
            </div>

          </div>


          {/* CYBER STATUS */}

          <div
            className="
              mx-6
              mb-2
              flex
              items-center
              justify-between
              rounded-lg
              border
              border-red-500/20
              bg-red-500/[0.03]
              px-3
              py-2
            "
          >

            <div className="flex items-center gap-2">

              <motion.span
                animate={{
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="
                  h-1.5
                  w-1.5
                  rounded-full
                  bg-red-500
                  shadow-[0_0_8px_rgba(255,30,45,1)]
                "
              />

              <span
                className="
                  font-mono
                  text-[7px]
                  tracking-[0.2em]
                  text-white/40
                "
              >
                SYSTEM ONLINE
              </span>

            </div>

            <span
              className="
                font-mono
                text-[7px]
                tracking-widest
                text-red-500/70
              "
            >
              SECURE // 007
            </span>

          </div>


          {/* SIGNATURE */}

          <div
            className="
              relative
              z-20
              flex
              items-end
              justify-between
              px-6
              pb-6
              pt-3
            "
          >

            <div>

              <p
                className="
                  mb-1
                  font-mono
                  text-[6px]
                  tracking-[0.25em]
                  text-white/20
                "
              >
                DIGITAL SIGNATURE
              </p>

              <motion.p
                animate={{
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="
                  font-hand
                  text-3xl
                  italic
                  text-red-500
                  drop-shadow-[0_0_8px_rgba(255,30,45,0.4)]
                "
              >
                Boopesh K
              </motion.p>

            </div>


            {/* CYBER GLOBE */}

            <motion.div
              animate={{
                rotate: [0, 5, 0, -5, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="
                relative
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-xl
                border
                border-red-500/40
                bg-black/70
                shadow-[0_0_18px_rgba(255,30,45,0.12)]
              "
            >

              <motion.div
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="
                  pointer-events-none
                  absolute
                  inset-1
                  rounded-lg
                  border
                  border-dashed
                  border-red-500/20
                "
              />

              <Globe
                size={22}
                strokeWidth={1.3}
                className="
                  relative
                  z-10
                  text-red-500/80
                "
              />

            </motion.div>

          </div>


          {/* STATIC BOTTOM CYBER BAR */}

          <motion.div
            animate={{
              opacity: [0.45, 1, 0.45],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="
              relative
              z-20
              h-2
              bg-gradient-to-r
              from-transparent
              via-red-500
              to-transparent
            "
          />


          {/* GLASS EDGE */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              z-[60]
              rounded-[26px]
              border
              border-white/[0.04]
            "
          />


          {/* MICRO CYBER MARKERS */}

          <div
            className="
              pointer-events-none
              absolute
              right-4
              bottom-[72px]
              z-50
              font-mono
              text-[5px]
              tracking-[0.3em]
              text-red-500/30
            "
          >
            01
          </div>

          <div
            className="
              pointer-events-none
              absolute
              left-4
              bottom-[72px]
              z-50
              font-mono
              text-[5px]
              tracking-[0.3em]
              text-red-500/30
            "
          >
            007
          </div>

        </div>
      </motion.div>
    </motion.div>
  );
}


/* =========================================================
   SOCIAL DOCK
========================================================= */

function SocialDock() {
  const items = [
    {
      label: "Email",
      icon: Mail,
      href: "mailto:007boopesh@gmail.com",
    },
    {
      label: "LinkedIn",
      icon: Linkedin,
      href: "https://www.linkedin.com/in/boopesh007",
    },
    {
      label: "GitHub",
      icon: Github,
      href: "https://github.com/007boopesh",
    },
    {
      label: "Instagram",
      icon: Instagram,
      href: "https://www.instagram.com/toxic_boopesh",
    },
  ];

  return (
    <div className="fixed bottom-5 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-1 rounded-2xl border border-white/10 bg-black/70 p-2 shadow-2xl backdrop-blur-xl">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <a
            key={item.label}
            href={item.href}
            target={
              item.href.startsWith("http")
                ? "_blank"
                : undefined
            }
            rel={
              item.href.startsWith("http")
                ? "noopener noreferrer"
                : undefined
            }
            aria-label={item.label}
            title={item.label}
            className="rounded-xl p-3 text-white/50 transition-all duration-300 hover:bg-red-500/15 hover:text-red-500"
          >
            <Icon size={18} />
          </a>
        );
      })}
    </div>
  );
}


/* =========================================================
   ADDITIONAL CYBER HUD
   ADDITIVE FEATURE
========================================================= */

function CyberHUD() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-[70] hidden md:block">
        <div className="absolute left-5 top-1/2 h-28 w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-red-500/30 to-transparent" />

        <div className="absolute right-5 top-1/2 h-28 w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-red-500/30 to-transparent" />

        <div className="absolute left-5 top-24 flex flex-col gap-2 font-mono text-[7px] tracking-[0.25em] text-white/20">
          <span>SYS_007</span>
          <span>ONLINE</span>
        </div>

        <div className="absolute right-5 top-24 flex flex-col items-end gap-2 font-mono text-[7px] tracking-[0.25em] text-white/20">
          <span>SECURE</span>
          <span className="text-red-500/50">LIVE</span>
        </div>

        <div className="absolute bottom-24 left-5 flex items-center gap-2 font-mono text-[7px] tracking-[0.2em] text-white/15">
          <Activity size={10} />
          <span>NEURAL_INTERFACE</span>
        </div>

        <div className="absolute bottom-24 right-5 flex items-center gap-2 font-mono text-[7px] tracking-[0.2em] text-white/15">
          <ShieldCheck size={10} />
          <span>AUTH_007</span>
        </div>
      </div>

      <div className="pointer-events-none fixed left-0 top-1/2 z-[69] hidden -translate-y-1/2 lg:block">
        <motion.div
          animate={{
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="h-24 w-px bg-gradient-to-b from-transparent via-red-500 to-transparent shadow-[0_0_12px_rgba(239,68,68,0.7)]"
        />
      </div>

      <div className="pointer-events-none fixed right-0 top-1/2 z-[69] hidden -translate-y-1/2 lg:block">
        <motion.div
          animate={{
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
          className="h-24 w-px bg-gradient-to-b from-transparent via-red-500 to-transparent shadow-[0_0_12px_rgba(239,68,68,0.7)]"
        />
      </div>
    </>
  );
}


/* =========================================================
   SCROLL PROGRESS
   ADDITIVE FEATURE
========================================================= */

function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop =
        window.scrollY || document.documentElement.scrollTop;

      const scrollHeight =
        document.documentElement.scrollHeight -
        window.innerHeight;

      if (scrollHeight <= 0) {
        setProgress(0);
        return;
      }

      setProgress(
        Math.min(
          100,
          Math.max(0, (scrollTop / scrollHeight) * 100)
        )
      );
    };

    updateProgress();

    window.addEventListener(
      "scroll",
      updateProgress,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      updateProgress
    );

    return () => {
      window.removeEventListener(
        "scroll",
        updateProgress
      );

      window.removeEventListener(
        "resize",
        updateProgress
      );
    };
  }, []);

  return (
    <>
      <div className="pointer-events-none fixed left-0 right-0 top-0 z-[1000] h-[2px] bg-white/[0.03]">
        <motion.div
          className="h-full origin-left bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.9)]"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      <div className="pointer-events-none fixed bottom-7 left-5 z-[101] hidden items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3 py-2 font-mono text-[7px] tracking-[0.2em] text-white/30 backdrop-blur-xl md:flex">
        <ScanLine
          size={10}
          className="text-red-500/70"
        />

        <span>
          {Math.round(progress)
            .toString()
            .padStart(3, "0")}
          %
        </span>
      </div>
    </>
  );
}


/* =========================================================
   CYBER AMBIENT LINES
   ADDITIVE FEATURE
========================================================= */

function CyberAmbientLines() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[2] overflow-hidden">
      <motion.div
        animate={{
          x: ["-120%", "120%"],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-[24%] h-px w-[35%] bg-gradient-to-r from-transparent via-red-500/20 to-transparent"
      />

      <motion.div
        animate={{
          x: ["120%", "-120%"],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
          delay: 2,
        }}
        className="absolute top-[68%] h-px w-[30%] bg-gradient-to-r from-transparent via-red-500/15 to-transparent"
      />

      <motion.div
        animate={{
          y: ["-100%", "200%"],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
          delay: 1,
        }}
        className="absolute right-[18%] h-[20%] w-px bg-gradient-to-b from-transparent via-red-500/10 to-transparent"
      />
    </div>
  );
}


/* =========================================================
   MOBILE CYBER NAVIGATION
   ADDITIVE FEATURE
========================================================= */

function MobileCyberNavigation({
  activeSection,
  mobileMenuOpen,
  setMobileMenuOpen,
  setActiveSection,
}: {
  activeSection: string;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (value: boolean) => void;
  setActiveSection: (value: string) => void;
}) {
  const navigateTo = (id: string) => {
    const section = document.getElementById(id);

    if (!section) return;

    setMobileMenuOpen(false);
    setActiveSection(id);

    window.setTimeout(() => {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 40);
  };

  return (
    <>
      {/* THREE DOT BUTTON */}

      <button
        type="button"
        onClick={() =>
          setMobileMenuOpen(!mobileMenuOpen)
        }
        aria-label={
          mobileMenuOpen
            ? "Close navigation"
            : "Open navigation"
        }
        aria-expanded={mobileMenuOpen}
        className={`
          fixed
          right-4
          top-4
          z-[1002]
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-full
          border
          backdrop-blur-xl
          transition-all
          duration-300
          md:hidden
          ${
            mobileMenuOpen
              ? "border-red-500/60 bg-red-500/10 shadow-[0_0_25px_rgba(239,68,68,0.25)]"
              : "border-white/15 bg-black/80"
          }
        `}
      >
        {mobileMenuOpen ? (
          <X
            size={19}
            className="text-red-500"
          />
        ) : (
          <span className="flex flex-col gap-[3px]">
            <span className="h-[3px] w-[3px] rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
            <span className="h-[3px] w-[3px] rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
            <span className="h-[3px] w-[3px] rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
          </span>
        )}
      </button>


      {/* BACKDROP */}

      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() =>
            setMobileMenuOpen(false)
          }
          className="fixed inset-0 z-[998] bg-black/75 backdrop-blur-md md:hidden"
        />
      )}


      {/* PANEL */}

      {mobileMenuOpen && (
        <motion.div
          initial={{
            opacity: 0,
            y: -15,
            scale: 0.96,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            y: -15,
            scale: 0.96,
          }}
          transition={{
            duration: 0.22,
            ease: "easeOut",
          }}
          className="
            fixed
            left-3
            right-3
            top-[70px]
            z-[1001]
            max-h-[calc(100vh-85px)]
            overflow-y-auto
            rounded-[24px]
            border
            border-white/10
            bg-[#070707]/98
            shadow-[0_30px_100px_rgba(0,0,0,0.8)]
            backdrop-blur-2xl
            md:hidden
          "
        >

          {/* RED TOP LINE */}

          <div className="absolute left-[15%] right-[15%] top-0 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_15px_rgba(239,68,68,0.8)]" />


          {/* HEADER */}

          <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-5">

            <div>
              <div className="flex items-center gap-2">
                <Terminal
                  size={12}
                  className="text-red-500"
                />

                <span className="font-mono text-[8px] tracking-[0.3em] text-red-500">
                  WEB_UI
                </span>
              </div>

              <h3 className="mt-1 text-lg font-bold tracking-[0.16em] text-white">
                DISCOVER
              </h3>
            </div>

            <div className="flex items-center gap-2 font-mono text-[7px] tracking-[0.18em] text-white/30">
              <motion.span
                animate={{
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                }}
                className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)]"
              />

              ONLINE
            </div>

          </div>


          {/* NAVIGATION */}

          <div className="p-3">

            {mobileNavItems.map(
              (item, index) => {
                const Icon = item.icon;

                const isActive =
                  activeSection === item.id;

                return (
                  <motion.button
                    key={item.id}
                    type="button"
                    initial={{
                      opacity: 0,
                      x: -10,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      delay:
                        index * 0.025,
                    }}
                    onClick={() =>
                      navigateTo(item.id)
                    }
                    className={`
                      group
                      relative
                      flex
                      min-h-[48px]
                      w-full
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      transition-all
                      duration-200
                      ${
                        isActive
                          ? "bg-red-500/[0.12] text-white"
                          : "text-white/45 hover:bg-white/[0.035] hover:text-white"
                      }
                    `}
                  >

                    {/* ICON */}

                    <span
                      className={`
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        border
                        transition-all
                        ${
                          isActive
                            ? "border-red-500/40 bg-red-500/10 text-red-500"
                            : "border-white/10 text-white/40"
                        }
                      `}
                    >
                      <Icon
                        size={16}
                        strokeWidth={1.6}
                      />
                    </span>


                    {/* LABEL */}

                    <span className="font-mono text-[9px] font-semibold tracking-[0.17em]">
                      {item.label}
                    </span>


                    {/* NUMBER */}

                    <span className="ml-auto font-mono text-[7px] tracking-[0.2em] text-white/15">
                      {String(index + 1).padStart(
                        2,
                        "0"
                      )}
                    </span>


                    {/* ACTIVE BAR */}

                    {isActive && (
                      <motion.span
                        layoutId="mobileActiveBar"
                        className="absolute right-2 h-5 w-[2px] rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.9)]"
                      />
                    )}

                  </motion.button>
                );
              }
            )}

          </div>


          {/* FOOTER */}

          <div className="flex items-center justify-between border-t border-white/[0.06] px-5 py-4">

            <div className="flex items-center gap-2">
              <Zap
                size={10}
                className="text-red-500/70"
              />

              <span className="font-mono text-[7px] tracking-[0.2em] text-white/25">
                BOOPESH007
              </span>
            </div>

            <span className="font-mono text-[7px] tracking-[0.2em] text-white/20">
              ECE / FULL STACK
            </span>

          </div>

        </motion.div>
      )}
    </>
  );
}



/* =========================================================
   ABOUT SECTION WAVEFORM BACKGROUNDS
========================================================= */

function AnimatedSineWave() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(185,20,30,0.055),transparent_72%)]" />

      <svg
        viewBox="0 0 2400 180"
        preserveAspectRatio="none"
        className="absolute left-0 top-1/2 h-32 w-[2400px] min-w-[200%] -translate-y-1/2 sm:w-[2400px]"
        aria-hidden="true"
      >
        <motion.g
          initial={{ x: 0 }}
          animate={{ x: -1200 }}
          transition={{
            duration: 8,
            ease: "linear",
            repeat: Infinity,
            repeatType: "loop",
          }}
        >
          <path
            d="M0 90 C50 20 100 20 150 90 S250 160 300 90 S400 20 450 90 S550 160 600 90 S700 20 750 90 S850 160 900 90 S1000 20 1050 90 S1150 160 1200 90"
            fill="none"
            stroke="rgba(185,28,38,0.62)"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M1200 90 C1250 20 1300 20 1350 90 S1450 160 1500 90 S1600 20 1650 90 S1750 160 1800 90 S1900 20 1950 90 S2050 160 2100 90 S2200 20 2250 90 S2350 160 2400 90"
            fill="none"
            stroke="rgba(185,28,38,0.62)"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </motion.g>
      </svg>
    </div>
  );
}

function AnimatedSquareWave() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(185,20,30,0.055),transparent_72%)]" />

      <svg
        viewBox="0 0 2400 180"
        preserveAspectRatio="none"
        className="absolute left-0 top-1/2 h-32 w-[2400px] min-w-[200%] -translate-y-1/2 sm:w-[2400px]"
        aria-hidden="true"
      >
        <motion.g
          initial={{ x: 0 }}
          animate={{ x: -1200 }}
          transition={{
            duration: 7,
            ease: "linear",
            repeat: Infinity,
            repeatType: "loop",
          }}
        >
          <path
            d="M0 120 H80 V55 H180 V120 H280 V55 H380 V120 H480 V55 H580 V120 H680 V55 H780 V120 H880 V55 H980 V120 H1080 V55 H1180 V120 H1200"
            fill="none"
            stroke="rgba(185,28,38,0.62)"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M1200 120 H1280 V55 H1380 V120 H1480 V55 H1580 V120 H1680 V55 H1780 V120 H1880 V55 H1980 V120 H2080 V55 H2180 V120 H2280 V55 H2380 V120 H2400"
            fill="none"
            stroke="rgba(185,28,38,0.62)"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </motion.g>
      </svg>
    </div>
  );
}

/* =========================================================
   SHARED CINEMATIC SCROLL CANVAS
   Frames 001 → Frames 257 is used on BOTH desktop and mobile.
========================================================= */
function ResponsiveScrollCanvas() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      <div
        className="h-full w-full [transform:translateZ(0)] [backface-visibility:hidden]"
        style={{ contain: "layout paint style" }}
      >
        <ScrollCanvas />
      </div>
    </div>
  );
}


/* =========================================================
   MAIN PORTFOLIO
========================================================= */

export default function Portfolio() {

  const [activeSection, setActiveSection] =
    useState("home");

  /* ADDITIVE MOBILE MENU STATE */

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  /* Mobile detection: the heavy 3D project carousel is not mounted on phones. */
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobileView(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  /* EDUCATION ACCORDION STATE */
  const [educationOpen, setEducationOpen] =
    useState(false);


  /* =======================================================
     EXISTING ACTIVE SECTION LOGIC
  ======================================================= */

  useEffect(() => {
    const sectionIds = [
      "home",
      "about",
      "education",
      "services",
      "projects",
      "awards",
      "skills",
      "experience",
      "gallery",
      "contact",
    ];

    const updateActiveSection = () => {
      const activationLine =
        window.scrollY + 160;

      let currentSection = "home";

      for (const id of sectionIds) {
        const section =
          document.getElementById(id);

        if (!section) continue;

        const top =
          section.getBoundingClientRect().top +
          window.scrollY;

        if (top <= activationLine) {
          currentSection = id;
        }
      }

      setActiveSection(currentSection);
    };

    // Desktop keeps the active-section indicator. Mobile intentionally
    // does not listen to scroll, preventing navigation flicker and extra
    // layout work during touch scrolling.
    if (window.innerWidth > 767) {
      updateActiveSection();

      window.addEventListener(
        "scroll",
        updateActiveSection,
        { passive: true }
      );

      window.addEventListener(
        "resize",
        updateActiveSection
      );
    }

    return () => {
      window.removeEventListener(
        "scroll",
        updateActiveSection
      );

      window.removeEventListener(
        "resize",
        updateActiveSection
      );
    };
  }, []);


  /* =======================================================
     ADDITIVE MOBILE KEYBOARD CONTROL
  ======================================================= */

  useEffect(() => {
    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);


  /* =======================================================
     ADDITIVE MOBILE SCROLL LOCK
  ======================================================= */

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);


  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#0a0404] text-white md:cursor-none">

      {/* ===================================================
          EXISTING SPIDEY CURSOR
      =================================================== */}

      <div className="pointer-events-none fixed inset-0 z-[9999] hidden md:block">
        <SpideyCursor />
      </div>


      {/* ===================================================
          ADDITIONAL CYBER SYSTEMS
      =================================================== */}

      <MotionConfig reducedMotion="never">

      <ScrollProgress />

      <CyberHUD />

      <CyberAmbientLines />


      {/* ===================================================
          FIXED CINEMATIC BACKGROUND
      =================================================== */}

      <div className="pointer-events-none fixed inset-0 -z-20 bg-[#080303]" />

      <div
        className="
          pointer-events-none
          fixed
          -right-[18%]
          -top-[12%]
          -z-20
          h-[700px]
          w-[700px]
          rounded-full
          bg-red-700/[0.12]
          blur-[190px]
        "
      />

      <div
        className="
          pointer-events-none
          fixed
          -left-[22%]
          top-[28%]
          -z-20
          h-[600px]
          w-[600px]
          rounded-full
          bg-red-800/[0.10]
          blur-[180px]
        "
      />

      <div
        className="
          pointer-events-none
          fixed
          bottom-[-25%]
          right-[15%]
          -z-20
          h-[600px]
          w-[600px]
          rounded-full
          bg-red-700/[0.08]
          blur-[180px]
        "
      />

      <div
        className="
          pointer-events-none
          fixed
          inset-0
          -z-20
          bg-[radial-gradient(circle_at_75%_25%,rgba(180,0,20,0.14),transparent_34%),radial-gradient(circle_at_18%_70%,rgba(120,0,15,0.10),transparent_32%),linear-gradient(180deg,#0d0303_0%,#080303_50%,#040202_100%)]
        "
      />

      <div
        className="
          pointer-events-none
          fixed
          left-0
          right-0
          top-[38%]
          -z-20
          h-px
          bg-gradient-to-r
          from-transparent
          via-red-600/20
          to-transparent
        "
      />


      {/* ===================================================
          ADDITIVE SPIDER WEB ATMOSPHERE
      =================================================== */}

      <div className="pointer-events-none fixed inset-0 -z-[5] overflow-hidden opacity-[0.16]">

        <svg
          viewBox="0 0 1000 700"
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0 0 L240 210 L470 0 M240 210 L100 450 L0 600 M240 210 L420 430 L650 700 M240 210 L700 160 L1000 0 M240 210 L820 350 L1000 520"
            fill="none"
            stroke="rgba(255,255,255,0.09)"
            strokeWidth="0.7"
          />

          <path
            d="M70 0 Q240 210 420 0 M0 150 Q240 210 560 40 M80 350 Q240 210 760 90 M0 520 Q240 210 940 210 M0 680 Q240 210 1000 400"
            fill="none"
            stroke="rgba(239,68,68,0.10)"
            strokeWidth="0.7"
          />
        </svg>

      </div>


      {/* GRID */}

      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />


      {/* GRAIN */}

      <div className="pointer-events-none fixed inset-0 -z-10 opacity-[0.035] [background-image:url('data:image/svg+xml,%3Csvg viewBox=%220 0 180 180%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%223%22 stitchTiles=%22stitch%22%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%22.7%22/%3E%3C/svg%3E')]" />


      {/* ===================================================
          SCROLL CANVAS
      =================================================== */}

      <ResponsiveScrollCanvas />


      {/* ===================================================
          ORIGINAL NAVIGATION
      =================================================== */}

      <nav
        className="
          fixed
          left-1/2
          top-5
          z-[100]
          flex
          w-[96vw]
          max-w-[1700px]
          -translate-x-1/2
          items-center
          justify-between
          gap-4
          rounded-full
          border
          border-white/10
          bg-black/55
          px-3
          py-2
          shadow-2xl
          backdrop-blur-xl
        "
      >

        {/* BRAND */}

        <a
          href="#home"
          className="group flex min-w-fit items-center gap-2 rounded-full px-3 py-2"
        >
          <span className="h-2 w-2 shrink-0 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]" />

          <span className="flex flex-col leading-none">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-white md:text-[11px]">
              BOOPESH K
            </span>

            <span className="mt-1 hidden font-mono text-[7px] uppercase tracking-[0.12em] text-white/40 sm:block md:text-[8px]">
              ECE STUDENT • FULL-STACK DEVELOPER
            </span>
          </span>
        </a>


        {/* LINKS */}

        <div className="min-w-0 flex-1 overflow-x-auto scrollbar-none">

          <div className="ml-auto flex w-max items-center gap-1">

            {[
              ["Home", "home"],
              ["About", "about"],
              ["Education", "education"],
              ["Services", "services"],
              ["Projects", "projects"],
              ["Awards", "awards"],
              ["Skills", "skills"],
              ["Experience", "experience"],
              ["Gallery", "gallery"],
              ["Contact", "contact"],
            ].map(([label, id]) => (
              <a
                key={id}
                href={`#${id}`}
                className={`
                  group
                  relative
                  flex
                  flex-none
                  items-center
                  gap-2
                  whitespace-nowrap
                  rounded-full
                  px-3
                  py-2
                  text-[10px]
                  font-medium
                  uppercase
                  tracking-[0.08em]
                  transition-all
                  duration-200
                  md:px-4
                  md:py-2.5
                  md:text-xs
                  ${
                    activeSection === id
                      ? "text-white"
                      : "text-white/55 hover:text-white"
                  }
                `}
              >

                <span
                  className={`
                    pointer-events-none
                    absolute
                    inset-0
                    rounded-full
                    bg-red-600
                    shadow-[0_0_20px_rgba(239,68,68,0.35)]
                    transition-opacity
                    duration-150
                    ${
                      activeSection === id
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                    }
                  `}
                />

                <span
                  className={`
                    relative
                    z-10
                    h-1.5
                    w-1.5
                    shrink-0
                    rounded-full
                    ${
                      activeSection === id
                        ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]"
                        : "bg-white/30 group-hover:bg-white"
                    }
                  `}
                />

                <span className="relative z-10">
                  {label}
                </span>

              </a>
            ))}

          </div>

        </div>

      </nav>


      {/* ===================================================
          ADDITIVE MOBILE NAVIGATION
      =================================================== */}

      <MobileCyberNavigation
        activeSection={activeSection}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        setActiveSection={setActiveSection}
      />


      {/* ===================================================
          MOVABLE PAGE CONTENT
      =================================================== */}

      <div
        style={{
          transform: `translate(${LAYOUT.horizontal}, ${LAYOUT.vertical})`,
          transformOrigin: "top center",
          width: "100%",
        }}
      >


        {/* ===================================================
            HOME
        =================================================== */}

        <section
          id="home"
          className="relative min-h-screen overflow-hidden"
        >

          {/* HERO GRID */}

          <div
            className="pointer-events-none absolute inset-0 opacity-[0.045]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
              `,
              backgroundSize: "60px 60px",
            }}
          />


          {/* HERO CONTENT */}

          <div
            className="relative z-10 mx-auto flex min-h-screen items-center px-5 pb-20 pt-32 md:px-8 lg:px-10"
            style={{
              width: LAYOUT.pageWidth,
              maxWidth: LAYOUT.maxWidth,
            }}
          >

            <div
              className="grid w-full items-center gap-16 lg:grid-cols-[minmax(0,1fr)_400px] xl:grid-cols-[minmax(0,1fr)_430px]"
              style={{
                columnGap: LAYOUT.heroGap,
              }}
            >

              {/* LEFT */}

              <motion.div
                initial={{
                  opacity: 0,
                  x: -30,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  duration: 0.8,
                }}
              >

                <div
                  className="hero-text-control relative w-full"
                  style={{
                    maxWidth:
                      LAYOUT.heroWidth,
                    transform: `translate(${LAYOUT.heroX}, ${LAYOUT.heroY})`,
                  }}
                >

                  <p className="font-script text-[2rem] leading-none text-white/90 md:text-[2.5rem]">
                    Hello, I’m
                  </p>


                  <h1
                    className="mt-4 whitespace-nowrap text-[clamp(5rem,11vw,11rem)] uppercase leading-[0.78] tracking-[-0.02em] text-white"
                    style={{
                      fontFamily:
                        "var(--font-bebas), sans-serif",
                      fontWeight: 400,
                    }}
                  >
                    BOOPESH
                    <span className="text-red-500"> k
                  
                    </span>
                  </h1>


                  <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[11px] font-semibold uppercase tracking-[0.28em] md:text-sm">

                    <span className="text-red-500">
                      Electronics
                    </span>

                    <span className="text-white/25">
                      /
                    </span>

                    <span className="text-red-500">
                      Embedded
                    </span>

                    <span className="text-white/25">
                      /
                    </span>

                    <span className="text-red-500">
                      VLSI
                    </span>

                    <span className="text-white/25">
                      /
                    </span>

                    <span className="text-red-500">
                     IOT
                    </span>

                  </div>


                  <p className="mt-7 max-w-2xl text-base leading-8 text-white/55 md:text-lg">

                    Electronics & Communication Engineering
                    student blending{" "}

                    <span className="text-white/90">
                      Embedded Systems, IoT, PCB Design,
                      Robotics
                    </span>{" "}

                    and communication technologies with
                    creative digital skills to build
                    practical and innovative solutions.

                  </p>

                </div>

{/* BUTTONS + LOCATION */}

<div className="mt-9 flex flex-wrap items-center gap-4">

  {/* GET IN TOUCH */}

  <a
    href="#contact"
    className="group relative inline-flex overflow-hidden rounded-full p-[1px]"
  >
    <span className="laser-border pointer-events-none absolute inset-[-150%]" />

    <span
      className="relative z-10 flex items-center gap-2 rounded-full border border-white/10 bg-black/80 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-xl transition-all duration-300 group-hover:bg-black/90 group-hover:shadow-[0_0_30px_rgba(239,68,68,0.30)]"
    >
      Get in Touch

      <ArrowUpRight
        size={17}
        className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
      />
    </span>
  </a>


  <a
  href="/Boopesh_K_Resume.pdf"
  download="Boopesh_K_Resume.pdf"
  className="group relative inline-flex overflow-hidden rounded-full p-[1px]"
>
  <span className="laser-border pointer-events-none absolute inset-[-150%]" />

  <span
    className="relative z-10 flex items-center gap-2 rounded-full border border-white/10 bg-black/80 px-6 py-3.5 text-sm font-medium text-white/80 backdrop-blur-xl transition-all duration-300 group-hover:bg-black/90 group-hover:text-white group-hover:shadow-[0_0_30px_rgba(239,68,68,0.30)]"
  >
    Download Resume

    <Download
      size={16}
      className="transition-transform duration-300 group-hover:translate-y-0.5"
    />
  </span>
</a>


  {/* INDIA / LOCATION */}

  <div className="group relative inline-flex overflow-hidden rounded-full p-[1px]">

    <span className="laser-border pointer-events-none absolute inset-[-150%]" />

    <span
      className="relative z-10 flex items-center gap-2 rounded-full border border-white/10 bg-black/80 px-5 py-3.5 text-sm font-medium text-white/80 backdrop-blur-xl transition-all duration-300 group-hover:bg-black/90 group-hover:text-white group-hover:shadow-[0_0_30px_rgba(239,68,68,0.30)]"
    >
      <MapPin
        size={16}
        className="text-red-400"
      />

      <span>Salem, India</span>
    </span>

  </div>

</div>


{/* SHARED LASER ANIMATION */}

<style jsx>{`
  .laser-border {
    position: absolute;
    inset: -150%;

    background: conic-gradient(
      from 0deg,
      transparent 0deg,
      transparent 300deg,
      #ef4444 325deg,
      #ff1f35 345deg,
      #ffffff 355deg,
      transparent 360deg
    );

    animation: sharedLaser 4.5s linear infinite;

    transform-origin: center center;

    will-change: transform;

    filter:
      drop-shadow(0 0 4px rgba(239, 68, 68, 0.8))
      drop-shadow(0 0 10px rgba(239, 68, 68, 0.45));
  }

  @keyframes sharedLaser {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }
`}</style>
                {/* QUICK STATS */}

                <div className="mt-10 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">

                  {[
                    ["ECE", "ENGINEERING"],
                    ["IoT", "SYSTEMS"],
                    ["FULL STACK", "DESIGNER"],
                    ["VLSI", "TECH"],
                  ].map(([value, label]) => (

                    <motion.div
                      key={label}
                      whileHover={{
                        y: -4,
                      }}
                      className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl"
                    >

                      <p className="text-2xl font-black text-white">
                        {value}
                      </p>

                      <p className="mt-1 font-mono text-[8px] tracking-wider text-white/30">
                        {label}
                      </p>

                    </motion.div>

                  ))}

                </div>

              </motion.div>


              {/* RIGHT — ID CARD */}

              <motion.div
                initial={{
                  opacity: 0,
                  x: 40,
                  scale: 0.96,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: 1,
                }}
                transition={{
                  duration: 0.9,
                  delay: 0.25,
                }}
                className="relative flex justify-center lg:justify-end"
              >

                <IdentityCard />


                {/* CURRENT FOCUS */}

                <motion.div
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -right-2 top-16 hidden w-44 rounded-2xl border border-white/10 bg-black/75 p-4 shadow-2xl backdrop-blur-xl xl:block"
                >

                  <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/30">
                    Current Focus
                  </p>

                  <p className="mt-2 text-sm font-medium text-white/80">
                    Full Stack Developer
                  </p>

                  <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">

                    <motion.div
                      animate={{
                        x: ["-100%", "0%"],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="h-full w-full bg-red-500"
                    />

                  </div>

                </motion.div>

              </motion.div>

            </div>

          </div>


          {/* SCROLL INDICATOR */}

          <motion.div className="absolute bottom-2 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-3">

            <span className="whitespace-nowrap font-mono text-[8px] font-medium uppercase tracking-[0.4em] text-white/40">
              Scroll to explore
            </span>

            <motion.span
              className="block h-10 w-[2px] bg-red-500"
              animate={{
                y: [0, 5, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

          </motion.div>

        </section>


        {/* ===================================================
    ABOUT — PREMIUM INTERACTIVE SECTION
=================================================== */}

<section
  id="about"
  className="
    group/about relative w-full scroll-mt-28
    overflow-hidden
    border-t border-white/10
    px-6 pb-16 pt-24
    sm:px-8 sm:pb-20
    md:px-16 md:pb-24 md:pt-32
    lg:px-24
  "
>
  {/* BACKGROUND GRID */}
  <div
    className="
      pointer-events-none absolute inset-0
      opacity-[0.035]
    "
    style={{
      backgroundImage: `
        linear-gradient(
          rgba(255,255,255,0.8) 1px,
          transparent 1px
        ),
        linear-gradient(
          90deg,
          rgba(255,255,255,0.8) 1px,
          transparent 1px
        )
      `,
      backgroundSize: "70px 70px",
    }}
  />

  {/* LARGE RED ATMOSPHERIC GLOW */}
  <motion.div
    className="
      pointer-events-none absolute
      left-[-180px] top-[15%]
      h-[500px] w-[500px]
      rounded-full
      bg-red-600/[0.045]
      blur-[150px]
    "
    animate={{
      x: [0, 70, 0],
      y: [0, 35, 0],
      scale: [1, 1.12, 1],
      opacity: [0.35, 0.65, 0.35],
    }}
    transition={{
      duration: 9,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />

  <motion.div
    className="
      pointer-events-none absolute
      right-[-200px] bottom-[5%]
      h-[420px] w-[420px]
      rounded-full
      bg-red-500/[0.035]
      blur-[140px]
    "
    animate={{
      x: [0, -60, 0],
      y: [0, -40, 0],
      scale: [1, 1.08, 1],
    }}
    transition={{
      duration: 10,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />

  {/* TOP SCAN LINE */}
  <motion.div
    className="
      pointer-events-none absolute
      left-0 top-0
      h-px w-[25%]
      bg-gradient-to-r
      from-transparent
      via-red-500
      to-transparent
    "
    animate={{
      x: ["-100%", "500%"],
    }}
    transition={{
      duration: 7,
      repeat: Infinity,
      ease: "linear",
    }}
  />

  {/* MAIN CONTAINER */}
  <div
    className="relative z-10 mx-auto w-full"
    style={{
      width: LAYOUT.pageWidth,
      maxWidth: LAYOUT.maxWidth,
    }}
  >
    {/* SECTION LABEL */}
    <motion.div
      initial={{
        opacity: 0,
        x: -25,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
      }}
      viewport={{
        once: true,
        amount: 0.5,
      }}
      transition={{
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="mb-8 flex items-center gap-3"
    >
      <motion.span
        className="
          h-2 w-2 rounded-full
          bg-red-500
          shadow-[0_0_12px_rgba(239,68,68,0.8)]
        "
        animate={{
          scale: [1, 1.45, 1],
          opacity: [0.65, 1, 0.65],
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <span
        className="
          font-mono text-xs
          uppercase tracking-[0.28em]
          text-red-500
        "
      >
        01 — About Me
      </span>

      <motion.span
        className="
          ml-2 h-px w-16
          bg-gradient-to-r
          from-red-500/60
          to-transparent
        "
        initial={{
          width: 0,
        }}
        whileInView={{
          width: 64,
        }}
        viewport={{
          once: true,
        }}
        transition={{
          duration: 0.8,
          delay: 0.25,
        }}
      />
    </motion.div>

    {/* TITLE */}
    <motion.h2
      initial={{
        opacity: 0,
        y: 50,
        filter: "blur(8px)",
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
      }}
      viewport={{
        once: true,
        amount: 0.35,
      }}
      transition={{
        duration: 1,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="
        relative max-w-5xl
        font-display text-5xl
        uppercase leading-[0.88]
        tracking-[-0.04em]
        text-white
        sm:text-6xl
        md:text-8xl
      "
    >
      Building ideas

      <br />

      <motion.span
        initial={{
          opacity: 0,
          x: -30,
        }}
        whileInView={{
          opacity: 1,
          x: 0,
        }}
        viewport={{
          once: true,
        }}
        transition={{
          duration: 0.9,
          delay: 0.25,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="
          inline-block
          text-white/35
        "
      >
        into reality.
      </motion.span>
    </motion.h2>

    {/* DECORATIVE LINE */}
    <motion.div
      initial={{
        width: 0,
        opacity: 0,
      }}
      whileInView={{
        width: "100%",
        opacity: 1,
      }}
      viewport={{
        once: true,
        amount: 0.5,
      }}
      transition={{
        duration: 1.1,
        delay: 0.25,
      }}
      className="
        mt-8 h-px
        bg-gradient-to-r
        from-red-500/50
        via-white/10
        to-transparent
      "
    />

    {/* CONTENT GRID */}
    <div
      className="
        mt-10 grid gap-10
        md:grid-cols-[1.2fr_0.8fr]
        md:gap-16
      "
    >
      {/* LEFT — DESCRIPTION */}
      <motion.div
        initial={{
          opacity: 0,
          y: 35,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{
          once: true,
          amount: 0.3,
        }}
        transition={{
          duration: 0.8,
          delay: 0.15,
        }}
      >
        <p
          className="
            max-w-3xl
            text-base
            leading-8
            text-white/65
            sm:text-lg
            md:text-xl
            md:leading-9
          "
        >
          I’m passionate about electronics, embedded systems, IoT, full-stack development, and modern computing. I enjoy exploring technology from the circuit level to complete connected systems, bridging hardware and software to transform ideas into smart, practical, and real-world solutions
        </p>

        {/* TECHNICAL STATUS BAR */}
        <div
          className="
            mt-10 flex max-w-xl
            items-center gap-4
            rounded-full
            border border-white/10
            bg-white/[0.025]
            px-4 py-3
            backdrop-blur-sm
          "
        >
          <motion.span
            className="
              h-2 w-2 shrink-0
              rounded-full
              bg-red-500
              shadow-[0_0_12px_rgba(239,68,68,0.8)]
            "
            animate={{
              opacity: [0.35, 1, 0.35],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
          />

          <span
            className="
              font-mono text-[9px]
              uppercase tracking-[0.2em]
              text-white/40
            "
          >
            SYSTEM STATUS
          </span>

          <span
            className="
              ml-auto font-mono text-[9px]
              uppercase tracking-[0.2em]
              text-red-400
            "
          >
            LEARNING / BUILDING
          </span>
        </div>

        {/* SMALL TECH MARKERS */}
        <div
          className="
            mt-8 flex flex-wrap
            gap-x-6 gap-y-3
          "
        >
          {[
            "ELECTRONICS",
            "EMBEDDED",
            "VLSI",
            "AI",
          ].map((item, index) => (
            <motion.span
              key={item}
              initial={{
                opacity: 0,
                y: 10,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                delay: 0.3 + index * 0.08,
                duration: 0.5,
              }}
              whileHover={{
                color: "#ef4444",
                y: -2,
              }}
              className="
                cursor-default
                font-mono text-[9px]
                uppercase tracking-[0.2em]
                text-white/25
                transition-colors
              "
            >
              + {item}
            </motion.span>
          ))}
        </div>
      </motion.div>

      {/* RIGHT — INTERACTIVE CARDS */}
      <div className="space-y-5">

        {/* FOCUS CARD */}
        <motion.div
          initial={{
            opacity: 0,
            x: 45,
            rotateX: 8,
          }}
          whileInView={{
            opacity: 1,
            x: 0,
            rotateX: 0,
          }}
          viewport={{
            once: true,
            amount: 0.3,
          }}
          transition={{
            duration: 0.9,
            delay: 0.15,
            ease: [0.22, 1, 0.36, 1],
          }}
          whileHover={{
            y: -6,
            scale: 1.015,
          }}
          className="
            group relative
            overflow-hidden
            rounded-2xl
            border border-white/10
            bg-white/[0.035]
            p-6
            backdrop-blur-md
            transition-colors
            duration-500
            hover:border-red-500/40
          "
        >
          <div
            className="
              pointer-events-none
              absolute
              -right-20
              -top-20
              h-40 w-40
              rounded-full
              bg-red-500/[0.07]
              blur-3xl
              transition-all
              duration-700
              group-hover:bg-red-500/[0.14]
            "
          />

          <motion.div
            className="
              pointer-events-none
              absolute left-0 top-0
              h-px w-full
              bg-gradient-to-r
              from-transparent
              via-red-500/70
              to-transparent
            "
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          <AnimatedSineWave />

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <p
                className="
                  font-mono text-[10px]
                  uppercase tracking-[0.25em]
                  text-red-500
                "
              >
                Focus
              </p>

              <span
                className="
                  font-mono text-[8px]
                  tracking-[0.18em]
                  text-white/20
                "
              >
                01
              </span>
            </div>

            <p
              className="
                mt-3 text-lg
                text-white/80
              "
            >
              Electronics • Embedded • Full stack developer • AI
            </p>

            <div
              className="
                mt-5 h-px w-full
                bg-gradient-to-r
                from-red-500/30
                to-transparent
              "
            />
          </div>
        </motion.div>

        {/* APPROACH CARD */}
        <motion.div
          initial={{
            opacity: 0,
            x: 45,
            rotateX: 8,
          }}
          whileInView={{
            opacity: 1,
            x: 0,
            rotateX: 0,
          }}
          viewport={{
            once: true,
            amount: 0.3,
          }}
          transition={{
            duration: 0.9,
            delay: 0.3,
            ease: [0.22, 1, 0.36, 1],
          }}
          whileHover={{
            y: -6,
            scale: 1.015,
          }}
          className="
            group relative
            overflow-hidden
            rounded-2xl
            border border-white/10
            bg-white/[0.035]
            p-6
            backdrop-blur-md
            transition-colors
            duration-500
            hover:border-red-500/40
          "
        >
          <div
            className="
              pointer-events-none
              absolute
              -left-20
              -bottom-20
              h-40 w-40
              rounded-full
              bg-red-500/[0.05]
              blur-3xl
              transition-all
              duration-700
              group-hover:bg-red-500/[0.13]
            "
          />

          <motion.div
            className="
              pointer-events-none
              absolute left-0 top-0
              h-px w-full
              bg-gradient-to-r
              from-transparent
              via-red-500/70
              to-transparent
            "
            animate={{
              x: ["100%", "-100%"],
            }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          <AnimatedSquareWave />

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <p
                className="
                  font-mono text-[10px]
                  uppercase tracking-[0.25em]
                  text-red-500
                "
              >
                Approach
              </p>

              <span
                className="
                  font-mono text-[8px]
                  tracking-[0.18em]
                  text-white/20
                "
              >
                02
              </span>
            </div>

            <p
              className="
                mt-3 text-lg
                text-white/80
              "
            >
              Learn → Build → Test → Improve
            </p>

            <div
              className="
                mt-5 h-px w-full
                bg-gradient-to-r
                from-red-500/30
                to-transparent
              "
            />
          </div>
        </motion.div>

      </div>
    </div>

    {/* BOTTOM TECHNICAL INDICATOR */}
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
      }}
      transition={{
        duration: 0.7,
        delay: 0.35,
      }}
      className="
        mt-14 flex
        items-center
        justify-between
        border-t border-white/10
        pt-5
      "
    >
      <span
        className="
          font-mono text-[8px]
          uppercase tracking-[0.25em]
          text-white/20
        "
      >
        “Bridging electronics, IoT, embedded systems, and full-stack development to turn ideas into intelligent, practical solutions.”
      </span>

      <div className="flex items-center gap-3">
        <motion.span
          className="
            h-px w-12
            bg-red-500/40
          "
          animate={{
            width: [30, 55, 30],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <span
          className="
            font-mono text-[8px]
            tracking-[0.2em]
            text-red-500/60
          "
        >
          01
        </span>
      </div>
    </motion.div>

  </div>

  {/* RED EDGE LIGHT */}
  <motion.div
    className="
      pointer-events-none absolute
      bottom-0 left-1/2
      h-px
      w-[35%]
      -translate-x-1/2
      bg-gradient-to-r
      from-transparent
      via-red-500/40
      to-transparent
    "
    animate={{
      opacity: [0.25, 0.7, 0.25],
      width: ["25%", "40%", "25%"],
    }}
    transition={{
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
</section>


{/* ===================================================
    EDUCATION — CONNECTED DIRECTLY TO ABOUT
=================================================== */}

<section
  id="education"
  className="
    relative w-full scroll-mt-28
    border-t border-white/10
    bg-transparent
    px-6
    pb-24
    pt-0
    sm:px-8
    md:px-16
    md:pb-32
    md:pt-0
    lg:px-24
  "
>
  <div
    className="mx-auto w-full"
    style={{
      width: LAYOUT.pageWidth,
      maxWidth: LAYOUT.maxWidth,
    }}
  >

    {/* EDUCATION HEADER */}

    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.4,
      }}
      transition={{
        duration: 0.7,
      }}
      className="
        flex items-center gap-3
        pt-8
        md:pt-10
      "
    >
      <motion.span
        className="
          h-2 w-2 rounded-full
          bg-red-500
          shadow-[0_0_12px_rgba(239,68,68,0.8)]
        "
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <p
        className="
          font-mono text-xs
          uppercase
          tracking-[0.28em]
          text-red-500
        "
      >
        02 — Education
      </p>

      <span
        className="
          ml-2 h-px w-16
          bg-gradient-to-r
          from-red-500/60
          to-transparent
        "
      />
    </motion.div>


    {/* =================================================
        EDUCATION CARDS
    ================================================= */}

    <div
      className="
        mt-8 grid
        w-full
        grid-cols-1
        gap-6
        md:grid-cols-2
      "
    >

      {/* =================================================
          EDUCATION CARD
      ================================================= */}

      <motion.div
        initial={
          isMobileView
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: 35 }
        }
        whileInView={
          isMobileView
            ? { opacity: 1, y: 0 }
            : { opacity: 1, y: 0 }
        }
        viewport={{
          once: true,
          amount: 0.25,
        }}
        transition={
          isMobileView
            ? { duration: 0 }
            : { duration: 0.8 }
        }
        className={`
          group overflow-hidden
          rounded-3xl
          border
          bg-white/[0.03]
          shadow-2xl
          mobile-no-blur mobile-scroll-card backdrop-blur-md
          transition-all
          duration-500
          ${
            educationOpen
              ? "border-red-500/60 bg-white/[0.05]"
              : "border-white/15 hover:-translate-y-2 hover:border-red-500/60 hover:bg-white/[0.05]"
          }
        `}
      >

        {/* CLICKABLE HEADER */}

        <button
          type="button"
          onClick={() => setEducationOpen(!educationOpen)}
          aria-expanded={educationOpen}
          className="
            w-full
            cursor-pointer
            p-7
            text-left
            sm:p-8
          "
        >
          <div
            className="
              flex
              items-start
              justify-between
              gap-5
            "
          >

            <div className="min-w-0 flex-1">

              {/* ICON */}

              <div
                className={`
                  mb-6
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  transition-all
                  duration-500
                  ${
                    educationOpen
                      ? "rotate-3 border-red-500/60 bg-red-500/20"
                      : "border-red-500/30 bg-red-500/10"
                  }
                `}
              >
                <Cpu
                  size={32}
                  strokeWidth={1.8}
                  className="text-red-500"
                />
              </div>

              {/* TITLE */}

              <h3
                className="
                  text-xl
                  font-bold
                  leading-tight
                  text-white
                  transition-colors
                  duration-300
                  group-hover:text-red-400
                  sm:text-2xl
                "
              >
                Electronics & Communication Engineering
              </h3>

              {/* SUBTITLE */}

              <p
                className="
                  mt-3
                  text-sm
                  font-medium
                  uppercase
                  tracking-wider
                  text-white/50
                "
              >
                Engineering Student
              </p>

              {/* DESCRIPTION */}

              <p
                className="
                  mt-6
                  text-sm
                  leading-7
                  text-white/65
                  sm:text-base
                "
              >
                Focused on electronics, communication
                systems, embedded technology, VLSI and
                processor architecture.
              </p>

            </div>


            {/* PLUS */}

            <div
              className={`
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                border
                text-2xl
                font-light
                transition-all
                duration-500
                ${
                  educationOpen
                    ? "rotate-45 border-red-500/60 bg-red-500/10 text-red-500"
                    : "rotate-0 border-white/15 bg-white/5 text-white/60"
                }
              `}
            >
              +
            </div>

          </div>
        </button>


        {/* =================================================
            EDUCATION DETAILS
        ================================================= */}

        <div
          className={`
            grid
            transition-all
            duration-700
            ease-[cubic-bezier(0.22,1,0.36,1)]
            ${
              educationOpen
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
            }
          `}
        >
          <div className="min-h-0 overflow-hidden">

            <div
              className={`
                border-t
                border-white/10
                px-7
                pb-7
                pt-6
                transition-all
                duration-700
                sm:px-8
                sm:pb-8
                ${
                  educationOpen
                    ? "translate-y-0"
                    : "-translate-y-6"
                }
              `}
            >

              {/* ACADEMIC PROFILE */}

              <div className="mb-6 flex items-center gap-3">

                <div
                  className="
                    h-px
                    flex-1
                    bg-gradient-to-r
                    from-red-500/70
                    to-transparent
                  "
                />

                <span
                  className="
                    whitespace-nowrap
                    font-mono
                    text-[9px]
                    uppercase
                    tracking-[0.3em]
                    text-red-500
                  "
                >
                  Academic Profile
                </span>

                <div
                  className="
                    h-px
                    flex-1
                    bg-gradient-to-l
                    from-red-500/70
                    to-transparent
                  "
                />

              </div>


              {/* =================================================
                  01 — ENGINEERING
              ================================================= */}

              <div
                className="
                  relative
                  overflow-hidden
                  rounded-2xl
                  border
                  border-red-500/25
                  bg-black/30
                  p-5
                  transition-all
                  duration-500
                  hover:-translate-y-2
                  hover:scale-[1.012]
                  hover:border-red-500/60
                  hover:shadow-[0_18px_50px_rgba(239,68,68,0.12)]
                "
              >

                <div
                  className="
                    absolute
                    left-0
                    top-0
                    h-full
                    w-[2px]
                    bg-red-500
                  "
                />

                <div className="pl-2">

                  <div
                    className="
                      flex
                      items-start
                      justify-between
                      gap-3
                    "
                  >

                    <div>

                      <p
                        className="
                          font-mono
                          text-[9px]
                          uppercase
                          tracking-[0.3em]
                          text-red-500
                        "
                      >
                        01 / Engineering
                      </p>

                      <h4
                        className="
                          mt-2
                          text-lg
                          font-bold
                          text-white
                        "
                      >
                        Electronics & Communication Engineering
                      </h4>

                    </div>

                    <span
                      className="
                        shrink-0
                        rounded-full
                        border
                        border-red-500/20
                        bg-red-500/10
                        px-2
                        py-1
                        font-mono
                        text-[8px]
                        text-red-400
                      "
                    >
                      ECE
                    </span>

                  </div>


                  {/* COLLEGE + LOCATION */}

                  <div
                    className="
                      mt-5
                      grid
                      grid-cols-1
                      gap-3
                      sm:grid-cols-2
                    "
                  >

                    {/* COLLEGE */}

                    <div
                      className="
                        rounded-xl
                        border
                        border-white/10
                        bg-white/[0.03]
                        p-4
                      "
                    >

                      <div className="flex items-center gap-2">

                        <GraduationCap
                          size={15}
                          className="text-red-500"
                        />

                        <p
                          className="
                            font-mono
                            text-[8px]
                            uppercase
                            tracking-[0.25em]
                            text-white/35
                          "
                        >
                          Institution
                        </p>

                      </div>

                      <p
                        className="
                          mt-2
                          text-sm
                          font-medium
                          text-white/80
                        "
                      >
                        Government College of Engineering, Salem
                      </p>

                    </div>


                    {/* LOCATION */}

                    <a
                      href="https://www.google.com/maps?q=11.7132778,78.0873611"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Open college location in Google Maps"
                      className="
                        group/location
                        block
                        rounded-xl
                        border
                        border-white/10
                        bg-white/[0.03]
                        p-4
                        cursor-pointer
                        transition-all
                        duration-300
                        hover:-translate-y-1
                        hover:border-red-500/50
                        hover:bg-red-500/[0.05]
                      "
                    >

                      <div className="flex items-center gap-2">

                        <MapPin
                          size={14}
                          className="text-red-500"
                        />

                        <p
                          className="
                            font-mono
                            text-[8px]
                            uppercase
                            tracking-[0.25em]
                            text-white/35
                          "
                        >
                          Location
                        </p>

                      </div>

                      <p
                        className="
                          mt-2
                          text-sm
                          font-medium
                          text-white/80
                          transition-colors
                          duration-300
                          group-hover/location:text-red-400
                        "
                      >
                        Salem, Tamil Nadu, India
                      </p>

                      <p
                        className="
                          mt-1
                          font-mono
                          text-[8px]
                          text-white/30
                        "
                      >
                        11°42'47.8&quot;N 78°05'14.5&quot;E
                      </p>

                      <p
                        className="
                          mt-3
                          font-mono
                          text-[8px]
                          uppercase
                          tracking-[0.18em]
                          text-red-500/60
                          transition-colors
                          duration-300
                          group-hover/location:text-red-400
                        "
                      >
                        OPEN IN GOOGLE MAPS ↗
                      </p>

                    </a>

                  </div>

                </div>

              </div>


              {/* =================================================
                  02 — DIPLOMA
              ================================================= */}

              <div
                className="
                  relative
                  mt-4
                  overflow-hidden
                  rounded-2xl
                  border
                  border-white/10
                  bg-black/20
                  p-5
                  transition-all
                  duration-500
                  hover:-translate-y-2
                  hover:scale-[1.012]
                  hover:border-red-500/50
                  hover:bg-white/[0.04]
                  hover:shadow-[0_18px_50px_rgba(239,68,68,0.10)]
                "
              >

                <div
                  className="
                    absolute
                    left-0
                    top-0
                    h-full
                    w-[2px]
                    bg-white/20
                  "
                />

                <div className="pl-2">

                  <p
                    className="
                      font-mono
                      text-[9px]
                      uppercase
                      tracking-[0.3em]
                      text-red-500
                    "
                  >
                    02 / Diploma
                  </p>

                  <h4
                    className="
                      mt-2
                      text-lg
                      font-bold
                      text-white
                    "
                  >
                    Diploma Education
                  </h4>

                  <div
                    className="
                      mt-4
                      grid
                      grid-cols-1
                      gap-3
                      sm:grid-cols-2
                    "
                  >

                    <div
                      className="
                        rounded-xl
                        border
                        border-white/10
                        bg-white/[0.03]
                        p-4
                      "
                    >

                      <p
                        className="
                          font-mono
                          text-[8px]
                          uppercase
                          tracking-[0.25em]
                          text-white/35
                        "
                      >
                        Institution
                      </p>

                      <p
                        className="
                          mt-2
                          text-sm
                          text-white/75
                        "
                      >
                        Thiagarajar Polytechnic College, Salem
                      </p>

                    </div>


                    <div
                      className="
                        rounded-xl
                        border
                        border-white/10
                        bg-white/[0.03]
                        p-4
                      "
                    >

                      <div className="flex items-center gap-2">

                        <MapPin
                          size={14}
                          className="text-red-500"
                        />

                        <p
                          className="
                            font-mono
                            text-[8px]
                            uppercase
                            tracking-[0.25em]
                            text-white/35
                          "
                        >
                          Location
                        </p>

                      </div>

                      <a
                        href="https://www.google.com/maps?q=11.6758333333,78.1252777778"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Open diploma location in Google Maps"
                        className="
                          mt-2
                          block
                          cursor-pointer
                          font-mono
                          text-[10px]
                          text-white/75
                          transition-colors
                          duration-300
                          hover:text-red-400
                        "
                      >
                        11°40'33.0&quot;N 78°07'31.0&quot;E
                        <span className="ml-2 text-red-500/70">
                          ↗
                        </span>
                      </a>

                    </div>

                  </div>

                </div>

              </div>


              {/* =================================================
                  03 — SCHOOLING
              ================================================= */}

              <div
                className="
                  relative
                  mt-4
                  overflow-hidden
                  rounded-2xl
                  border
                  border-white/10
                  bg-black/20
                  p-5
                  transition-all
                  duration-500
                  hover:-translate-y-2
                  hover:scale-[1.012]
                  hover:border-red-500/50
                  hover:bg-white/[0.04]
                  hover:shadow-[0_18px_50px_rgba(239,68,68,0.10)]
                "
              >

                <div
                  className="
                    absolute
                    left-0
                    top-0
                    h-full
                    w-[2px]
                    bg-white/20
                  "
                />

                <div className="pl-2">

                  <p
                    className="
                      font-mono
                      text-[9px]
                      uppercase
                      tracking-[0.3em]
                      text-red-500
                    "
                  >
                    03 / Schooling
                  </p>

                  <h4
                    className="
                      mt-2
                      text-lg
                      font-bold
                      text-white
                    "
                  >
                    School Education
                  </h4>

                  <div
                    className="
                      mt-4
                      grid
                      grid-cols-1
                      gap-3
                      sm:grid-cols-2
                    "
                  >

                    <div
                      className="
                        rounded-xl
                        border
                        border-white/10
                        bg-white/[0.03]
                        p-4
                      "
                    >

                      <p
                        className="
                          font-mono
                          text-[8px]
                          uppercase
                          tracking-[0.25em]
                          text-white/35
                        "
                      >
                        Institution
                      </p>

                      <p
                        className="
                          mt-2
                          text-sm
                          text-white/75
                        "
                      >
                        St. Vincent Pallotti Matriculation Higher Secondary School
                      </p>

                    </div>


                    <div
                      className="
                        rounded-xl
                        border
                        border-white/10
                        bg-white/[0.03]
                        p-4
                      "
                    >

                      <div className="flex items-center gap-2">

                        <MapPin
                          size={14}
                          className="text-red-500"
                        />

                        <p
                          className="
                            font-mono
                            text-[8px]
                            uppercase
                            tracking-[0.25em]
                            text-white/35
                          "
                        >
                          Location
                        </p>

                      </div>

                      <a
                        href="https://www.google.com/maps?q=11.6732222222,78.0684722222"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Open school location in Google Maps"
                        className="
                          mt-2
                          block
                          cursor-pointer
                          font-mono
                          text-[10px]
                          text-white/75
                          transition-colors
                          duration-300
                          hover:text-red-400
                        "
                      >
                        11°40'23.6&quot;N 78°04'06.5&quot;E
                        <span className="ml-2 text-red-500/70">
                          ↗
                        </span>
                      </a>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>
        </div>

      </motion.div>


      {/* =================================================
          TECHNICAL LEARNING
      ================================================= */}

      <motion.div
        initial={{
          opacity: 0,
          y: 35,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{
          once: true,
          amount: 0.25,
        }}
        transition={{
          duration: 0.8,
          delay: 0.1,
        }}
        className={`
          group overflow-hidden
          rounded-3xl
          border
          bg-white/[0.03]
          shadow-2xl
          mobile-no-blur mobile-scroll-card backdrop-blur-md
          transition-all
          duration-500
          ${
            educationOpen
              ? "border-red-500/60 bg-white/[0.05]"
              : "border-white/15 hover:-translate-y-2 hover:border-red-500/60 hover:bg-white/[0.05]"
          }
        `}
      >

        <div className="p-7 sm:p-8">

          <div className="flex items-start justify-between gap-5">

            <div className="min-w-0 flex-1">

              <div
                className={`
                  mb-6
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  transition-all
                  duration-500
                  ${
                    educationOpen
                      ? "rotate-3 border-red-500/60 bg-red-500/20"
                      : "border-red-500/30 bg-red-500/10"
                  }
                `}
              >

                <CircuitBoard
                  size={32}
                  strokeWidth={1.8}
                  className="text-red-500"
                />

              </div>

              <h3
                className="
                  text-xl
                  font-bold
                  leading-tight
                  text-white
                  transition-colors
                  duration-300
                  group-hover:text-red-400
                  sm:text-2xl
                "
              >
                Technical Learning
              </h3>

              <p
                className="
                  mt-3
                  text-sm
                  font-medium
                  uppercase
                  tracking-wider
                  text-white/50
                "
              >
                Continuous Development
              </p>

              <p
                className="
                  mt-6
                  text-sm
                  leading-7
                  text-white/65
                  sm:text-base
                "
              >
                Developing practical knowledge through
                projects, experiments, programming and
                modern digital tools.
              </p>

            </div>

          </div>

        </div>


        {/* TECHNICAL DETAILS */}

        <div
          className={`
            grid
            transition-all
            duration-700
            ease-[cubic-bezier(0.22,1,0.36,1)]
            ${
              educationOpen
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
            }
          `}
        >

          <div className="min-h-0 overflow-hidden">

            <div
              className={`
                border-t
                border-white/10
                px-7
                pb-7
                pt-6
                transition-all
                duration-700
                sm:px-8
                sm:pb-8
                ${
                  educationOpen
                    ? "translate-y-0"
                    : "-translate-y-6"
                }
              `}
            >

              {/* TECHNICAL CATEGORIES */}

              <div className="mt-2 space-y-4">

                {/* AFTER EFFECTS */}

                <div
                  className="
                    overflow-hidden
                    rounded-2xl
                    border
                    border-white/10
                    bg-black/30
                    transition-all
                    duration-500
                    hover:-translate-y-2
                    hover:scale-[1.012]
                    hover:border-red-500/50
                    hover:shadow-[0_18px_50px_rgba(239,68,68,0.12)]
                  "
                >

                  <div className="relative overflow-hidden">

                    <img
                      src="/images/TECHNICAL CATEGORIES/after-effects.jpg"
                      alt="After Effects"
                      className="
                        h-44
                        w-full
                        object-cover
                        transition-transform
                        duration-700
                        hover:scale-105
                      "
                    />

                    <div
                      className="
                        absolute
                        inset-0
                        bg-gradient-to-t
                        from-black
                        via-black/20
                        to-transparent
                      "
                    />

                    <div className="absolute bottom-4 left-4">

                      <p
                        className="
                          font-mono
                          text-[9px]
                          uppercase
                          tracking-[0.3em]
                          text-red-500
                        "
                      >
                        01 / Motion Graphics
                      </p>

                      <h4
                        className="
                          mt-1
                          text-lg
                          font-bold
                          text-white
                        "
                      >
                        After Effects
                      </h4>

                    </div>

                  </div>

                  <div className="p-5">

                    <p
                      className="
                        text-sm
                        leading-6
                        text-white/60
                      "
                    >
                      Learning motion graphics, visual
                      effects, animation and cinematic
                      compositions.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">

                      <span
                        className="
                          rounded-full
                          border
                          border-red-500/20
                          bg-red-500/10
                          px-3
                          py-1
                          font-mono
                          text-[9px]
                          text-red-400
                        "
                      >
                        Motion
                      </span>

                      <span
                        className="
                          rounded-full
                          border
                          border-white/10
                          bg-white/[0.03]
                          px-3
                          py-1
                          font-mono
                          text-[9px]
                          text-white/50
                        "
                      >
                        VFX
                      </span>

                    </div>

                  </div>

                </div>


                {/* PREMIERE PRO */}

                <div
                  className="
                    overflow-hidden
                    rounded-2xl
                    border
                    border-white/10
                    bg-black/30
                    transition-all
                    duration-500
                    hover:-translate-y-2
                    hover:scale-[1.012]
                    hover:border-red-500/50
                    hover:shadow-[0_18px_50px_rgba(239,68,68,0.12)]
                  "
                >

                  <div className="relative overflow-hidden">

                    <img
                      src="/images/TECHNICAL CATEGORIES/premierepro.jpg"
                      alt="Premiere Pro"
                      className="
                        h-44
                        w-full
                        object-cover
                        transition-transform
                        duration-700
                        hover:scale-105
                      "
                    />

                    <div
                      className="
                        absolute
                        inset-0
                        bg-gradient-to-t
                        from-black
                        via-black/20
                        to-transparent
                      "
                    />

                    <div className="absolute bottom-4 left-4">

                      <p
                        className="
                          font-mono
                          text-[9px]
                          uppercase
                          tracking-[0.3em]
                          text-red-500
                        "
                      >
                        02 / Video Production
                      </p>

                      <h4
                        className="
                          mt-1
                          text-lg
                          font-bold
                          text-white
                        "
                      >
                        Premiere Pro
                      </h4>

                    </div>

                  </div>

                  <div className="p-5">

                    <p
                      className="
                        text-sm
                        leading-6
                        text-white/60
                      "
                    >
                      Developing skills in video editing,
                      cinematic storytelling, transitions
                      and post-production.
                    </p>

                  </div>

                </div>


                {/* VISUAL STUDIO CODE */}

                <div
                  className="
                    overflow-hidden
                    rounded-2xl
                    border
                    border-white/10
                    bg-black/30
                    transition-all
                    duration-500
                    hover:-translate-y-2
                    hover:scale-[1.012]
                    hover:border-red-500/50
                    hover:shadow-[0_18px_50px_rgba(239,68,68,0.12)]
                  "
                >

                  <div className="relative overflow-hidden">

                    <img
                      src="/images/TECHNICAL CATEGORIES/visual-studio-code.jpg"
                      alt="Visual Studio Code"
                      className="
                        h-44
                        w-full
                        object-cover
                        transition-transform
                        duration-700
                        hover:scale-105
                      "
                    />

                    <div
                      className="
                        absolute
                        inset-0
                        bg-gradient-to-t
                        from-black
                        via-black/20
                        to-transparent
                      "
                    />

                    <div className="absolute bottom-4 left-4">

                      <p
                        className="
                          font-mono
                          text-[9px]
                          uppercase
                          tracking-[0.3em]
                          text-red-500
                        "
                      >
                        03 / Development
                      </p>

                      <h4
                        className="
                          mt-1
                          text-lg
                          font-bold
                          text-white
                        "
                      >
                        Visual Studio Code
                      </h4>

                    </div>

                  </div>

                  <div className="p-5">

                    <p
                      className="
                        text-sm
                        leading-6
                        text-white/60
                      "
                    >
                      Building websites, applications and
                      technical projects using modern
                      development tools.
                    </p>

                  </div>

                </div>


                {/* PYTHON */}

                <div
                  className="
                    overflow-hidden
                    rounded-2xl
                    border
                    border-white/10
                    bg-black/30
                    transition-all
                    duration-500
                    hover:-translate-y-2
                    hover:scale-[1.012]
                    hover:border-red-500/50
                    hover:shadow-[0_18px_50px_rgba(239,68,68,0.12)]
                  "
                >

                  <div className="relative overflow-hidden">

                    <img
                      src="/images/TECHNICAL CATEGORIES/python.jpg"
                      alt="Python Programming"
                      className="
                        h-44
                        w-full
                        object-cover
                        transition-transform
                        duration-700
                        hover:scale-105
                      "
                    />

                    <div
                      className="
                        absolute
                        inset-0
                        bg-gradient-to-t
                        from-black
                        via-black/20
                        to-transparent
                      "
                    />

                    <div className="absolute bottom-4 left-4">

                      <p
                        className="
                          font-mono
                          text-[9px]
                          uppercase
                          tracking-[0.3em]
                          text-red-500
                        "
                      >
                        04 / Programming
                      </p>

                      <h4
                        className="
                          mt-1
                          text-lg
                          font-bold
                          text-white
                        "
                      >
                        Python
                      </h4>

                    </div>

                  </div>

                  <div className="p-5">

                    <p
                      className="
                        text-sm
                        leading-6
                        text-white/60
                      "
                    >
                      Exploring Python programming,
                      automation, problem solving and
                      practical development.
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </motion.div>

    </div>

  </div>

</section>

              
       {/* ===================================================
    SERVICES / CAPABILITIES
=================================================== */}

<section
  id="services"
  className="relative w-full scroll-mt-28 overflow-hidden border-t border-white/10 bg-transparent px-5 py-24 sm:px-8 md:px-16 md:py-32 lg:px-24"
>
  {/* =================================================
      AMBIENT BACKGROUND GLOW
  ================================================= */}

  <motion.div
    aria-hidden="true"
    className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/[0.035] blur-[120px]"
    animate={{
      scale: [1, 1.12, 1],
      opacity: [0.25, 0.5, 0.25],
    }}
    transition={{
      duration: 7,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />

  <div
    className="relative z-10 mx-auto w-full"
    style={{
      width: LAYOUT.pageWidth,
      maxWidth: LAYOUT.maxWidth,
    }}
  >

    {/* =================================================
        SECTION LABEL
    ================================================= */}

    <motion.div
      className="flex items-center gap-3"
      initial={{
        opacity: 0,
        x: -40,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
      }}
      viewport={{
        once: false,
        amount: 0.5,
      }}
      transition={{
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {/* Pulsing red dot */}

      <motion.span
        className="h-2 w-2 shrink-0 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]"
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <p className="font-mono text-xs font-medium uppercase tracking-[0.28em] text-red-500">
        03 / Capabilities
      </p>
    </motion.div>


    {/* =================================================
        MAIN HEADING
    ================================================= */}

    <motion.h2
      className="mt-4 text-5xl font-black uppercase leading-[0.9] tracking-tight text-white sm:text-6xl md:text-8xl"
      initial={{
        opacity: 0,
        y: 80,
        scale: 0.94,
        filter: "blur(14px)",
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
      }}
      viewport={{
        once: false,
        amount: 0.45,
      }}
      transition={{
        duration: 1,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      What I Build
    </motion.h2>


    {/* =================================================
        SERVICES GRID
    ================================================= */}



    {/* =================================================
        MOBILE CAPABILITIES
        Lightweight native layout — no 3D transforms,
        no hover animation and no expensive blur effects.
        Desktop version above remains unchanged.
    ================================================= */}
    <div className="mt-10 grid grid-cols-1 gap-3 md:hidden">
      {services.map((service, index) => {
        const Icon = service.icon;

        return (
          <article
            key={`mobile-${service.title}`}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/25 p-5"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-500">
                <Icon size={22} strokeWidth={1.8} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="font-mono text-[9px] tracking-[0.22em] text-white/25">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-red-500/60">
                    AVAILABLE
                  </span>
                </div>

                <h3 className="text-base font-bold leading-tight text-white">
                  {service.title}
                </h3>

                <p className="mt-2 text-[13px] leading-5 text-white/50">
                  {service.description}
                </p>
              </div>
            </div>

            <div className="mt-4 h-px w-full bg-white/10">
              <div className="h-px w-1/3 bg-red-500" />
            </div>
          </article>
        );
      })}
    </div>


    <div className="mt-12 hidden grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:grid">

      {services.map((service, index) => {
        const Icon = service.icon;

        return (
          <motion.div
            key={service.title}

            /* =========================================
               ENTER ANIMATION
            ========================================= */

            initial={{
              opacity: 0,
              y: 100,
              scale: 0.88,
              rotateX: 12,
              filter: "blur(10px)",
            }}

            whileInView={{
              opacity: 1,
              y: 0,
              scale: 1,
              rotateX: 0,
              filter: "blur(0px)",
            }}

            viewport={{
              once: false,
              amount: 0.25,
            }}

            transition={{
              duration: 0.8,
              delay: index * 0.14,
              ease: [0.16, 1, 0.3, 1],
            }}

            /* =========================================
               HOVER ANIMATION
            ========================================= */

            whileHover={{
              y: -12,
              scale: 1.025,
              transition: {
                duration: 0.3,
                ease: [0.22, 1, 0.36, 1],
              },
            }}

            style={{
              transformPerspective: 1000,
            }}

            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-transparent p-6 transition-colors duration-500 hover:border-red-500/50 hover:bg-white/[0.035] sm:p-7"
          >

            {/* =========================================
                CARD GLOW
            ========================================= */}

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{
                boxShadow:
                  "inset 0 0 40px rgba(239,68,68,0.08), 0 0 40px rgba(239,68,68,0.06)",
              }}
            />


            {/* =========================================
                MOVING LIGHT SWEEP
            ========================================= */}

            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute -left-[120%] top-0 h-[150%] w-[70%] rotate-[18deg] bg-gradient-to-r from-transparent via-red-500/[0.08] to-transparent"
              whileHover={{
                left: "140%",
              }}
              transition={{
                duration: 0.9,
                ease: "easeInOut",
              }}
            />


            {/* =========================================
                TOP ROW
            ========================================= */}

            <div className="relative z-10 mb-7 flex items-center justify-between">

              {/* Number */}

              <motion.span
                className="font-mono text-xs text-white/25"
                whileHover={{
                  color: "rgba(239,68,68,0.8)",
                }}
              >
                {String(index + 1).padStart(2, "0")}
              </motion.span>


              {/* Arrow */}

              <motion.div
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10"
                whileHover={{
                  scale: 1.15,
                  rotate: 8,
                  borderColor: "rgba(239,68,68,0.6)",
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 15,
                }}
              >
                <ArrowUpRight
                  size={16}
                  strokeWidth={1.5}
                  className="text-white/30 transition-colors duration-300 group-hover:text-red-500"
                />
              </motion.div>

            </div>


            {/* =========================================
                ICON
            ========================================= */}

            <motion.div
              className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 text-red-500 transition-all duration-500 group-hover:border-red-500/70 group-hover:bg-red-500/[0.15]"
              whileHover={{
                scale: 1.12,
                rotate: -5,
              }}
              transition={{
                type: "spring",
                stiffness: 280,
                damping: 14,
              }}
            >

              {/* Glow behind icon */}

              <motion.div
                aria-hidden="true"
                className="absolute inset-0 rounded-2xl bg-red-500/20 blur-xl"
                initial={{
                  opacity: 0,
                  scale: 0.7,
                }}
                whileHover={{
                  opacity: 1,
                  scale: 1.4,
                }}
                transition={{
                  duration: 0.3,
                }}
              />

              <motion.div
                whileHover={{
                  scale: 1.1,
                  rotate: 10,
                }}
              >
                <Icon
                  size={28}
                  strokeWidth={1.8}
                  className="relative z-10 text-red-500"
                />
              </motion.div>

            </motion.div>


            {/* =========================================
                SERVICE TITLE
            ========================================= */}

            <motion.h3
              className="relative z-10 mt-7 text-lg font-bold leading-tight text-white sm:text-xl"
              whileHover={{
                x: 5,
              }}
              transition={{
                duration: 0.25,
              }}
            >
              {service.title}
            </motion.h3>


            {/* =========================================
                DESCRIPTION
            ========================================= */}

            <p className="relative z-10 mt-3 text-sm leading-6 text-white/55 transition-colors duration-300 group-hover:text-white/75">
              {service.description}
            </p>


            {/* =========================================
                ANIMATED LINE
            ========================================= */}

            <div className="relative z-10 mt-7 h-px w-full overflow-hidden bg-white/10">

              <motion.div
                className="h-full w-full origin-left bg-red-500"
                initial={{
                  scaleX: 0,
                }}
                whileInView={{
                  scaleX: 1,
                }}
                viewport={{
                  once: false,
                  amount: 0.4,
                }}
                transition={{
                  duration: 0.8,
                  delay: 0.25 + index * 0.14,
                  ease: [0.16, 1, 0.3, 1],
                }}
              />

            </div>


            {/* =========================================
                STATUS
            ========================================= */}

            <div className="relative z-10 mt-4 flex items-center justify-between">

              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/20 transition-colors duration-300 group-hover:text-red-500/60">
                Available
              </span>

              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-red-500"
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.2,
                  ease: "easeInOut",
                }}
              />

            </div>

          </motion.div>
        );
      })}

    </div>

  </div>
</section>
      {/* ===================================================
    PROJECTS — 3D PERSPECTIVE CAROUSEL
=================================================== */}

<section
  id="projects"
  className="
    relative z-20 w-full scroll-mt-28 overflow-hidden
    border-t border-white/10 bg-transparent
    px-5 py-20 sm:px-8 sm:py-24
    md:px-16 md:py-28 lg:px-24
  "
>
  <div
    className="mx-auto w-full"
    style={{
      width: LAYOUT.pageWidth,
      maxWidth: LAYOUT.maxWidth,
    }}
  >

    {/* =================================================
        SECTION LABEL
    ================================================= */}

    <div className="mb-6 flex items-center gap-3">
      <span
        className="
          h-2 w-2 shrink-0 rounded-full bg-red-500
          shadow-[0_0_14px_rgba(239,68,68,0.9)]
        "
      />

      <p
        className="
          font-mono text-xs font-medium uppercase
          tracking-[0.28em] text-red-500
        "
      >
        04 / Selected Work
      </p>
    </div>


    {/* =================================================
        TITLE
    ================================================= */}

    <h2
      className="
        relative z-30 max-w-6xl
        text-5xl font-black uppercase
        leading-[0.85] tracking-[-0.04em]
        text-white sm:text-6xl md:text-8xl
        lg:text-[9rem]
      "
    >
      Projects
    </h2>


    {/* =================================================
        DESCRIPTION
    ================================================= */}

    <p
      className="
        relative z-30 mt-8 max-w-2xl
        text-base leading-7 text-white/60
        sm:text-lg sm:leading-8
      "
    >
      A collection of engineering, embedded systems, AI,
      communication and software projects built through
      experimentation and practical development.
    </p>


    {/* =================================================
        PROJECT HEADER
    ================================================= */}

    <div
      className="
        relative z-30 mt-10 flex items-center
        justify-between pb-4
      "
    >
      <span
        className="
          font-mono text-xs uppercase
          tracking-[0.25em] text-white/40
        "
      >
        Featured Projects
      </span>

      <span className="font-mono text-xs text-red-500">
        {projects.length.toString().padStart(2, "0")} PROJECTS
      </span>
    </div>


    {/* =================================================
        CONNECTION LINE
    ================================================= */}

    <div
      className="
        relative h-px w-full overflow-hidden
        bg-white/10
      "
    >
      <motion.div
        className="
          absolute left-0 top-0 h-px w-1/4
          bg-gradient-to-r from-transparent
          via-red-500 to-transparent
        "
        animate={{
          x: ["-100%", "500%"],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>


    {/* =================================================
        CAROUSEL
    ================================================= */}

    <div className="hidden md:block">

    {(() => {
      const ProjectCarousel = () => {

        const [activeIndex, setActiveIndex] =
          useState<number>(
            Math.max(
              0,
              Math.floor(projects.length / 2)
            )
          );

        const total = projects.length;

        if (!total) {
          return null;
        }


        /* =================================================
           PREVIOUS
        ================================================= */

        const movePrevious = () => {
          setActiveIndex((current) =>
            current <= 0
              ? total - 1
              : current - 1
          );
        };


        /* =================================================
           NEXT
        ================================================= */

        const moveNext = () => {
          setActiveIndex((current) =>
            current >= total - 1
              ? 0
              : current + 1
          );
        };


        /* =================================================
           SELECT PROJECT
        ================================================= */

        const selectProject = (index: number) => {
          setActiveIndex(index);
        };


        /* =================================================
           KEYBOARD NAVIGATION

           IMPORTANT:
           Uses native KeyboardEvent instead of
           React.KeyboardEvent to avoid TS2315.
        ================================================= */

        const handleKeyDown = (
          event: KeyboardEvent
        ) => {
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            movePrevious();
          }

          if (event.key === "ArrowRight") {
            event.preventDefault();
            moveNext();
          }
        };


        return (
          <div className="relative mt-0 w-full">

            {/* =================================================
                CAROUSEL STAGE
            ================================================= */}

            <div
             tabIndex={0}
             onKeyDown={(event) => {
               if (event.key === "ArrowLeft") {
                 event.preventDefault();
                 movePrevious();
               }
             
               if (event.key === "ArrowRight") {
                 event.preventDefault();
                 moveNext();
               }
             }}
             className="
                project-carousel-stage
                relative
                h-[680px]
                w-full
                overflow-hidden
                outline-none
                sm:h-[710px]
                md:h-[730px]
              "
              style={{
                perspective: "1800px",
                perspectiveOrigin: "50% 50%",
              }}
            >

              {/* =================================================
                  MAIN RED GLOW
              ================================================= */}

              <div
                className="
                  pointer-events-none
                  absolute
                  left-1/2
                  top-1/2
                  z-0
                  h-[520px]
                  w-[520px]
                  -translate-x-1/2
                  -translate-y-1/2
                  rounded-full
                  bg-red-500/[0.07]
                  blur-[150px]
                "
              />


              {/* =================================================
                  SECONDARY GLOW
              ================================================= */}

              <motion.div
                className="
                  pointer-events-none
                  absolute
                  left-1/2
                  top-1/2
                  z-0
                  h-[300px]
                  w-[760px]
                  -translate-x-1/2
                  -translate-y-1/2
                  rounded-full
                  bg-red-900/[0.06]
                  blur-[110px]
                "
                animate={{
                  opacity: [0.35, 0.7, 0.35],
                  scale: [0.95, 1.05, 0.95],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />


              {/* =================================================
                  CARD STAGE

                  FIX:
                  Every card starts from exactly the same
                  center point.

                  translateY(-50%) is handled by CSS so
                  perspective does not make cards appear
                  uneven vertically.
              ================================================= */}

              <div
                className="
                  absolute
                  left-1/2
                  top-1/2
                  z-10
                  h-0
                  w-0
                "
                style={{
                  transformStyle: "preserve-3d",
                }}
              >

                {projects.map((project, index) => {

                  /* =================================================
                     CIRCULAR OFFSET
                  ================================================= */

                  let offset = index - activeIndex;

                  if (offset > total / 2) {
                    offset -= total;
                  }

                  if (offset < -total / 2) {
                    offset += total;
                  }


                  const distance = Math.abs(offset);


                  /* =================================================
                     HORIZONTAL POSITION

                     Increased spacing for larger cards.
                  ================================================= */

                  const x =
                    offset === 0
                      ? 0
                      : offset * 410;


                  /* =================================================
                     VERTICAL POSITION

                     IMPORTANT:
                     Every card has EXACTLY the same Y.

                     No vertical offset is applied to side cards.
                  ================================================= */

                  const y = 0;


                  /* =================================================
                     3D ROTATION
                  ================================================= */

                  const rotateY =
                    offset * -30;


                  /* =================================================
                     SCALE
                  ================================================= */

                  const scale =
                    distance === 0
                      ? 1
                      : distance === 1
                        ? 0.84
                        : distance === 2
                          ? 0.68
                          : 0.55;


                  /* =================================================
                     OPACITY
                  ================================================= */

                  const opacity =
                    distance === 0
                      ? 1
                      : distance === 1
                        ? 0.72
                        : distance === 2
                          ? 0.28
                          : 0;


                  /* =================================================
                     Z-INDEX
                  ================================================= */

                  const zIndex =
                    100 - distance * 10;


                  return (
                    <motion.article
                      key={`${project.title}-${index}`}

                      initial={false}

                      animate={{
                        x,
                        y,
                        rotateY,
                        scale,
                        opacity,
                      }}

                      transition={{
                        type: "spring",
                        stiffness: 90,
                        damping: 20,
                        mass: 0.85,
                      }}

                      onClick={() =>
                        selectProject(index)
                      }

                      style={{
                        zIndex,
                        transformStyle: "preserve-3d",
                        transformOrigin: "center center",

                        /*
                         * CRITICAL ALIGNMENT FIX
                         *
                         * The card is positioned from its
                         * exact center instead of its top-left
                         * corner.
                         */
                        left: "-215px",
                        top: "-275px",
                      }}

                      className="
                        group
                        absolute
                        flex
                        flex-col

                        h-[550px]
                        w-[430px]

                        cursor-pointer
                        overflow-hidden
                        rounded-[1.5rem]

                        border
                        border-white/10

                        bg-[#070707]

                        shadow-[0_35px_100px_rgba(0,0,0,0.85)]

                        transition-colors
                        duration-500

                        hover:border-red-500/40

                        sm:h-[570px]
                        sm:w-[445px]

                        md:h-[590px]
                        md:w-[460px]
                      "
                    >

                      {/* =================================================
                          PROJECT IMAGE
                      ================================================= */}

                      <div
                        className="
                          relative
                          h-[290px]
                          w-full
                          shrink-0
                          overflow-hidden

                          sm:h-[305px]

                          md:h-[315px]
                        "
                      >

                        <img
                          src={project.image}
                          alt={project.title}
                          draggable={false}

                          className="
                            h-full
                            w-full
                            select-none
                            object-cover
                            opacity-90

                            transition-transform
                            duration-700
                            ease-out

                            group-hover:scale-110
                          "

                          onError={(event) => {
                            event.currentTarget.style.opacity = "0";
                          }}
                        />


                        {/* IMAGE GRADIENT */}

                        <div
                          className="
                            pointer-events-none
                            absolute
                            inset-0
                            bg-gradient-to-t
                            from-black
                            via-black/20
                            to-transparent
                          "
                        />


                        {/* RED HOVER */}

                        <div
                          className="
                            pointer-events-none
                            absolute
                            inset-0
                            bg-red-500/0
                            transition-all
                            duration-500
                            group-hover:bg-red-500/[0.08]
                          "
                        />


                        {/* PROJECT NUMBER */}

                        <div
                          className="
                            absolute
                            left-5
                            top-5
                            rounded-full
                            border
                            border-white/10
                            bg-black/70
                            px-3
                            py-1.5
                            font-mono
                            text-[10px]
                            tracking-[0.2em]
                            text-white/70
                            backdrop-blur-md
                          "
                        >
                          {String(index + 1).padStart(2, "0")}
                        </div>


                        {/* CATEGORY */}

                        <div
                          className="
                            absolute
                            bottom-5
                            left-5
                          "
                        >
                          <span
                            className="
                              rounded-full
                              border
                              border-red-500/30
                              bg-black/75
                              px-3
                              py-1.5
                              font-mono
                              text-[9px]
                              uppercase
                              tracking-[0.2em]
                              text-red-400
                              backdrop-blur-md
                            "
                          >
                            {project.category}
                          </span>
                        </div>

                      </div>


                      {/* =================================================
                          CARD CONTENT
                      ================================================= */}

                      <div
                        className="
                          flex
                          flex-1
                          flex-col
                          p-6

                          sm:p-7

                          md:p-8
                        "
                      >

                        {/* TITLE */}

                        <h3
                          className="
                            text-xl
                            font-bold
                            uppercase
                            leading-tight
                            tracking-tight
                            text-white

                            sm:text-2xl

                            md:text-[1.65rem]
                          "
                        >
                          {project.title}
                        </h3>


                        {/* DESCRIPTION */}

                        <p
                          className="
                            mt-4
                            line-clamp-5
                            flex-1
                            text-sm
                            leading-6
                            text-white/50

                            sm:text-[15px]
                            sm:leading-7
                          "
                        >
                          {project.description}
                        </p>


                        {/* =================================================
                            CARD FOOTER
                        ================================================= */}

                        <div
                          className="
                            mt-6
                            flex
                            items-center
                            justify-between
                            border-t
                            border-white/10
                            pt-5
                          "
                        >

                          <span
                            className="
                              font-mono
                              text-[9px]
                              uppercase
                              tracking-[0.22em]
                              text-white/35
                              transition-colors
                              duration-300
                              group-hover:text-red-400
                            "
                          >
                            View Project
                          </span>


                          <div
                            className="
                              flex
                              h-10
                              w-10
                              items-center
                              justify-center
                              rounded-full
                              border
                              border-white/10
                              transition-all
                              duration-300
                              group-hover:border-red-500/50
                              group-hover:bg-red-500/10
                            "
                          >
                            <ArrowUpRight
                              size={18}
                              strokeWidth={1.5}
                              className="
                                text-red-500
                                transition-transform
                                duration-300
                                group-hover:translate-x-0.5
                                group-hover:-translate-y-0.5
                              "
                            />
                          </div>

                        </div>

                      </div>


                      {/* =================================================
                          ACTIVE CARD BORDER
                      ================================================= */}

                      {distance === 0 && (
                        <motion.div
                          initial={{
                            opacity: 0,
                          }}

                          animate={{
                            opacity: 1,
                          }}

                          transition={{
                            duration: 0.35,
                          }}

                          className="
                            pointer-events-none
                            absolute
                            inset-0
                            rounded-[1.5rem]
                            border
                            border-red-500/35
                            shadow-[inset_0_0_50px_rgba(239,68,68,0.07)]
                          "
                        />
                      )}

                    </motion.article>
                  );
                })}

              </div>


              {/* =================================================
                  LEFT FADE
              ================================================= */}

              <div
                className="
                  pointer-events-none
                  absolute
                  inset-y-0
                  left-0
                  z-30
                  w-16
                  bg-gradient-to-r
                  from-black/80
                  to-transparent

                  sm:w-28
                  md:w-40
                "
              />


              {/* =================================================
                  RIGHT FADE
              ================================================= */}

              <div
                className="
                  pointer-events-none
                  absolute
                  inset-y-0
                  right-0
                  z-30
                  w-16
                  bg-gradient-to-l
                  from-black/80
                  to-transparent

                  sm:w-28
                  md:w-40
                "
              />


              {/* =================================================
                  NAVIGATION CONTROLLER
              ================================================= */}

              <div
                className="
                  absolute
                  bottom-7
                  left-1/2
                  z-[100]

                  flex
                  -translate-x-1/2
                  items-center
                  gap-2

                  rounded-full

                  border
                  border-red-500/25

                  bg-[#050505]/95

                  px-2
                  py-2

                  shadow-[0_0_35px_rgba(239,68,68,0.16)]

                  backdrop-blur-xl
                "
              >

                {/* =================================================
                    PREVIOUS
                ================================================= */}

                <button
                  type="button"
                  aria-label="Previous project"
                  onClick={movePrevious}

                  className="
                    group
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-full

                    border
                    border-red-500/50

                    bg-red-500/10

                    text-red-500

                    transition-all
                    duration-300

                    hover:border-red-500
                    hover:bg-red-500
                    hover:text-white

                    hover:shadow-[0_0_25px_rgba(239,68,68,0.45)]

                    active:scale-90
                  "
                >
                  <ChevronLeft
                    size={20}
                    strokeWidth={2}

                    className="
                      transition-transform
                      duration-300

                      group-hover:-translate-x-1
                    "
                  />
                </button>


                {/* =================================================
                    PROJECT DOTS
                ================================================= */}

                <div
                  className="
                    flex
                    max-w-[180px]
                    items-center
                    justify-center
                    gap-2
                    overflow-hidden
                    px-2
                  "
                >
                  {projects.map((project, index) => (
                    <button
                      key={`project-dot-${index}`}
                      type="button"
                      aria-label={`Show ${project.title}`}
                      aria-current={
                        activeIndex === index
                          ? "true"
                          : undefined
                      }

                      onClick={() =>
                        selectProject(index)
                      }

                      className={`
                        h-2
                        shrink-0
                        rounded-full
                        transition-all
                        duration-500

                        ${
                          activeIndex === index
                            ? "w-7 bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.85)]"
                            : "w-2 bg-white/30 hover:bg-red-500/70"
                        }
                      `}
                    />
                  ))}
                </div>


                {/* =================================================
                    NEXT
                ================================================= */}

                <button
                  type="button"
                  aria-label="Next project"
                  onClick={moveNext}

                  className="
                    group
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-full

                    border
                    border-red-500/50

                    bg-red-500/10

                    text-red-500

                    transition-all
                    duration-300

                    hover:border-red-500
                    hover:bg-red-500
                    hover:text-white

                    hover:shadow-[0_0_25px_rgba(239,68,68,0.45)]

                    active:scale-90
                  "
                >
                  <ChevronRight
                    size={20}
                    strokeWidth={2}

                    className="
                      transition-transform
                      duration-300

                      group-hover:translate-x-1
                    "
                  />
                </button>

              </div>

            </div>


            {/* =================================================
                MOBILE HINT
            ================================================= */}

            <div
              className="
                mt-1
                text-center
                font-mono
                text-[8px]
                uppercase
                tracking-[0.28em]
                text-white/20
                md:hidden
              "
            >
              Use ← → or tap a project
            </div>

          </div>
        );
      };


      /* =================================================
         MOBILE PROJECT PRESENTATION
         Lightweight native-flow cards. The 3D carousel is not mounted.
      ================================================= */
      const MobileProjectList = () => (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {projects.map((project, index) => (
            <article
              key={`mobile-project-${project.title}-${index}`}
              className="overflow-hidden rounded-2xl border border-white/10 bg-black/70 shadow-[0_12px_35px_rgba(0,0,0,0.45)]"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  loading={index < 2 ? "eager" : "lazy"}
                  decoding="async"
                  draggable={false}
                  className="h-full w-full select-none object-cover opacity-90"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
                <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/75 px-2.5 py-1 font-mono text-[8px] tracking-[0.18em] text-white/70">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="absolute bottom-3 left-3 rounded-full border border-red-500/30 bg-black/80 px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.16em] text-red-400">
                  {project.category}
                </span>
              </div>
              <div className="p-4">
                <h3 className="text-base font-bold uppercase leading-tight tracking-tight text-white">
                  {project.title}
                </h3>
                <p className="mt-2 text-xs leading-5 text-white/50">
                  {project.description}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                  <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/30">
                    Project {String(index + 1).padStart(2, "0")}
                  </span>
                  <ArrowUpRight size={15} strokeWidth={1.6} className="text-red-500" />
                </div>
              </div>
            </article>
          ))}
        </div>
      );

      return isMobileView ? <MobileProjectList /> : <ProjectCarousel />;
    })()}

    </div>

    {/* =================================================
        MOBILE PROJECTS
        Lightweight image cards. The desktop 3D carousel is
        not mounted on mobile, removing the heavy spring/
        perspective rendering that caused mobile lag.
    ================================================= */}
    <div className="mt-8 grid grid-cols-1 gap-4 md:hidden">
      {projects.map((project, index) => (
        <article
          key={`mobile-project-${project.title}`}
          className="overflow-hidden rounded-2xl border border-white/10 bg-black/35"
        >
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
            <img
              src={project.image}
              alt={project.title}
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
              draggable={false}
              className="h-full w-full select-none object-cover"
              onError={(event) => {
                event.currentTarget.style.opacity = "0";
              }}
            />

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />

            <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/70 px-2.5 py-1 font-mono text-[9px] tracking-[0.18em] text-white/70">
              {String(index + 1).padStart(2, "0")}
            </span>

            <span className="absolute bottom-3 left-3 rounded-full border border-red-500/30 bg-black/75 px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.18em] text-red-400">
              {project.category}
            </span>
          </div>

          <div className="p-5">
            <h3 className="text-lg font-bold uppercase leading-tight tracking-tight text-white">
              {project.title}
            </h3>
            <p className="mt-3 text-[13px] leading-5 text-white/50">
              {project.description}
            </p>

            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
              <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/30">
                Selected Work
              </span>
              <ArrowUpRight size={17} strokeWidth={1.6} className="text-red-500" />
            </div>
          </div>
        </article>
      ))}
    </div>

  </div>
</section>
       {/* ===================================================
    ACHIEVEMENTS
=================================================== */}

<section
  id="awards"
  className="relative z-20 w-full scroll-mt-28 overflow-hidden border-t border-white/10 bg-transparent px-5 py-24 sm:px-8 md:px-16 md:py-32 lg:px-24"
>
  <div
    className="mx-auto w-full"
    style={{
      width: LAYOUT.pageWidth,
      maxWidth: LAYOUT.maxWidth,
    }}
  >

    {/* SECTION LABEL */}
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="mb-6 flex items-center gap-3"
    >
      <motion.span
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{
          delay: 0.15,
          duration: 0.5,
          type: "spring",
          stiffness: 180,
        }}
        className="h-2 w-2 shrink-0 rounded-full bg-red-500 shadow-[0_0_14px_rgba(239,68,68,0.9)]"
      />

      <p className="font-mono text-xs uppercase tracking-[0.28em] text-red-500">
        05 / Recognition
      </p>
    </motion.div>


    {/* HEADING */}
    <motion.h2
      initial={{
        opacity: 0,
        y: 70,
        filter: "blur(12px)",
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
      }}
      viewport={{
        once: true,
        amount: 0.3,
      }}
      transition={{
        duration: 1,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="text-5xl font-black uppercase leading-[0.85] tracking-[-0.04em] text-white sm:text-6xl md:text-8xl"
    >
      Achievements
    </motion.h2>


    {/* ===================================================
        ACHIEVEMENT CARDS
    =================================================== */}

    <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {[
        {
          number: "01",
          title: "Blockchain for Healthcare Security",
          description:
            "Technical paper presentation focused on blockchain technology for protecting healthcare information, improving data integrity, strengthening privacy, and creating secure digital health records.",
          points: [
            "Healthcare data security",
            "Blockchain architecture",
            "Privacy and data integrity",
          ],
        },
        {
          number: "02",
          title: "PCB Design Internship",
          description:
            "Practical experience in PCB design and electronics development, including circuit planning, component placement, routing, schematic understanding, and hardware-oriented problem solving.",
          points: [
            "PCB layout and routing",
            "Circuit design concepts",
            "Hardware development",
          ],
        },
        {
          number: "03",
          title: "Industrial Training Experience",
          description:
            "Industrial training experience focused on understanding professional engineering workflows, practical implementation, technical documentation, teamwork, and real-world problem solving.",
          points: [
            "Industrial workflow",
            "Technical practices",
            "Engineering problem solving",
          ],
        },
        {
          number: "04",
          title: "Technical Project Presenter",
          description:
            "Presented technical projects by explaining their concepts, system architecture, implementation approach, technical challenges, and potential real-world applications.",
          points: [
            "Project architecture",
            "Technical communication",
            "Problem solving",
          ],
        },
        {
          number: "05",
          title: "Robotics & IoT Development",
          description:
            "Hands-on exploration of robotics and IoT concepts involving embedded systems, sensors, microcontrollers, automation, connected devices, and intelligent hardware solutions.",
          points: [
            "Embedded systems",
            "IoT development",
            "Robotics concepts",
          ],
        },
        {
          number: "06",
          title: "Technical Events & Workshops",
          description:
            "Participation in technical events and workshops to develop practical knowledge, explore emerging technologies, strengthen teamwork, and gain exposure to modern engineering concepts.",
          points: [
            "Technical learning",
            "Emerging technologies",
            "Team collaboration",
          ],
        },
      ].map((item, index) => (
        <motion.article
          key={item.number}
          initial={{
            opacity: 0,
            y: 120,
            scale: 0.9,
            rotateX: 10,
            filter: "blur(6px)",
          }}
          whileInView={{
            opacity: 1,
            y: 0,
            scale: 1,
            rotateX: 0,
            filter: "blur(0px)",
          }}
          viewport={{
            once: true,
            amount: 0.18,
          }}
          transition={{
            duration: 0.85,
            delay: index * 0.12,
            ease: [0.16, 1, 0.3, 1],
          }}
          whileHover={{
            y: -10,
            scale: 1.02,
            transition: {
              duration: 0.35,
              ease: [0.16, 1, 0.3, 1],
            },
          }}
          style={{
            transformPerspective: 1000,
          }}
          className="group relative min-h-[390px] overflow-hidden rounded-3xl border border-white/10 bg-black/60 p-6 shadow-2xl mobile-no-blur backdrop-blur-xl transform-gpu transition-colors duration-500 hover:border-red-500/40 sm:p-7"
        >
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.8,
            }}
            whileHover={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              duration: 0.5,
            }}
            className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-red-600/[0.08] blur-3xl"
            aria-hidden="true"
          />

          <span
            className="pointer-events-none absolute left-5 top-5 h-6 w-6 border-l border-t border-red-500/60 transition-all duration-500 group-hover:h-9 group-hover:w-9"
            aria-hidden="true"
          />

          <span
            className="pointer-events-none absolute right-5 top-5 h-6 w-6 border-r border-t border-red-500/60 transition-all duration-500 group-hover:h-9 group-hover:w-9"
            aria-hidden="true"
          />

          <span
            className="pointer-events-none absolute bottom-5 left-5 h-6 w-6 border-b border-l border-red-500/60 transition-all duration-500 group-hover:h-9 group-hover:w-9"
            aria-hidden="true"
          />

          <span
            className="pointer-events-none absolute bottom-5 right-5 h-6 w-6 border-b border-r border-red-500/60 transition-all duration-500 group-hover:h-9 group-hover:w-9"
            aria-hidden="true"
          />

          <div className="relative z-10 flex h-full flex-col">
            <motion.div
              initial={{
                opacity: 0,
                x: -20,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 0.5,
                delay: 0.25 + index * 0.12,
              }}
              className="flex items-center justify-between"
            >
              <span className="rounded-full border border-white/15 bg-black/50 px-3 py-1.5 font-mono text-xs tracking-[0.2em] text-white/60 mobile-no-blur backdrop-blur-md">
                {item.number}
              </span>

              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-red-500/60">
                Achievement
              </span>
            </motion.div>

            <motion.div
              initial={{
                opacity: 0,
                y: 35,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                amount: 0.2,
              }}
              transition={{
                duration: 0.7,
                delay: 0.28 + index * 0.12,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mt-10 flex min-h-[90px] items-center justify-center text-center"
            >
              <h3 className="max-w-[280px] text-xl font-black leading-7 tracking-tight text-white transition-all duration-500 group-hover:text-red-50 sm:text-2xl">
                {item.title}
              </h3>
            </motion.div>

            <motion.div
              initial={{
                width: "25%",
              }}
              whileInView={{
                width: "45%",
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 0.7,
                delay: 0.4 + index * 0.12,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mx-auto mt-4 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent"
            />

            <motion.p
              initial={{
                opacity: 0,
                y: 25,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                amount: 0.2,
              }}
              transition={{
                duration: 0.65,
                delay: 0.45 + index * 0.12,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mt-6 text-center text-sm leading-6 text-white/50"
            >
              {item.description}
            </motion.p>

            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 0.6,
                delay: 0.55 + index * 0.12,
              }}
              className="mt-auto flex flex-wrap justify-center gap-2 pt-6"
            >
              {item.points.map((point) => (
                <span
                  key={point}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] font-medium tracking-wide text-white/45 transition-all duration-300 group-hover:border-red-500/25 group-hover:text-white/70"
                >
                  {point}
                </span>
              ))}
            </motion.div>

            <motion.div
              initial={{
                width: "30%",
              }}
              whileInView={{
                width: "50%",
              }}
              viewport={{
                once: true,
              }}
              whileHover={{
                width: "100%",
              }}
              transition={{
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mx-auto mt-6 h-px bg-gradient-to-r from-transparent via-red-500/70 to-transparent"
            />
          </div>

          <motion.div
            initial={{
              x: "-150%",
              opacity: 0,
            }}
            whileInView={{
              x: "150%",
              opacity: [0, 0.22, 0],
            }}
            viewport={{
              once: true,
              amount: 0.2,
            }}
            transition={{
              duration: 1.4,
              delay: 0.5 + index * 0.12,
              ease: "easeInOut",
            }}
            className="pointer-events-none absolute inset-y-0 left-0 z-0 w-1/4 skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/10 to-transparent blur-xl"
            aria-hidden="true"
          />
        </motion.article>
      ))}
    </div>

  </div>
</section>

        {/* ===================================================
            SKILLS — SCROLL ANIMATION ONLY
        =================================================== */}

        <section
          id="skills"
          className="relative z-20 w-full scroll-mt-28 border-t border-white/10 bg-transparent px-5 py-24 sm:px-8 md:px-16 md:py-32 lg:px-24"
        >
          <div className="mx-auto w-full" style={{ width: LAYOUT.pageWidth, maxWidth: LAYOUT.maxWidth }}>
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="mb-6 flex items-center gap-3">
              <motion.span initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.15, duration: 0.5, type: "spring", stiffness: 180 }} className="h-2 w-2 shrink-0 rounded-full bg-red-500 shadow-[0_0_14px_rgba(239,68,68,0.9)]" />
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-red-500">06 / Toolkit</p>
            </motion.div>

            <motion.h2 initial={{ opacity: 0, y: 35, filter: "blur(8px)" }} whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="text-5xl font-black uppercase leading-[0.85] tracking-[-0.04em] text-white sm:text-6xl md:text-8xl">Skills</motion.h2>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.12 }} variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } } }} className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {skills.map((skill, index) => {
                const Icon = skill.icon;
                const CustomIcon = skill.customIcon;
                return (
                  <motion.div key={skill.name} variants={{ hidden: { opacity: 0, y: 40, scale: 0.94, filter: "blur(5px)" }, visible: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" } }} whileHover={{ y: -7, scale: 1.02 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] p-5 text-center backdrop-blur-sm transition-all duration-300 hover:border-red-500/50 hover:bg-red-500/[0.05] hover:shadow-[0_0_35px_rgba(239,68,68,0.12)]">
                    <span className="absolute right-4 top-3 font-mono text-[8px] tracking-[0.2em] text-white/15 transition-colors duration-300 group-hover:text-red-500/50">{String(index + 1).padStart(2, "0")}</span>
                    <motion.div initial={{ scale: 0.75, rotate: -8 }} whileInView={{ scale: 1, rotate: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ delay: 0.15 + index * 0.05, duration: 0.5, type: "spring", stiffness: 170 }} className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/25 bg-red-500/[0.07] text-red-500 transition-all duration-300 group-hover:scale-110 group-hover:border-red-500/60 group-hover:bg-red-500/10 group-hover:shadow-[0_0_25px_rgba(239,68,68,0.18)]">
                      {skill.short ? <span className="text-xl font-black tracking-tight">{skill.short}</span> : CustomIcon ? <div className="h-8 w-8"><CustomIcon /></div> : Icon ? <Icon size={32} strokeWidth={1.6} /> : null}
                    </motion.div>
                    <motion.h3 initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ delay: 0.25 + index * 0.05, duration: 0.45 }} className="mt-5 text-sm font-semibold leading-5 text-white/65 transition-colors duration-300 group-hover:text-white">{skill.name}</motion.h3>
                    <div className="absolute bottom-0 left-1/2 h-px w-0 -translate-x-1/2 bg-red-500 transition-all duration-300 group-hover:w-2/3" />
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

<section
  id="experience"
  className="
    relative z-20 w-full scroll-mt-28
    overflow-hidden border-t border-white/10
    bg-transparent px-5 py-24
    sm:px-8 md:px-16 md:py-32 lg:px-24
  "
>
  <div
    className="mx-auto w-full"
    style={{
      width: LAYOUT.pageWidth,
      maxWidth: LAYOUT.maxWidth,
    }}
  >

    {/* =================================================
        SECTION LABEL
    ================================================= */}

    <motion.div
      initial={{ opacity: 0, x: -25 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="mb-6 flex items-center gap-3"
    >
      <motion.span
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{
          delay: 0.15,
          duration: 0.5,
          type: "spring",
          stiffness: 180,
        }}
        className="
          h-2 w-2 shrink-0 rounded-full
          bg-red-500
          shadow-[0_0_14px_rgba(239,68,68,0.9)]
        "
      />

      <p
        className="
          font-mono text-xs uppercase
          tracking-[0.28em] text-red-500
        "
      >
        07 / Journey
      </p>
    </motion.div>


    {/* =================================================
        TITLE
    ================================================= */}

    <motion.h2
      initial={{
        opacity: 0,
        y: 35,
        filter: "blur(8px)",
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
      }}
      viewport={{
        once: true,
        amount: 0.25,
      }}
      transition={{
        duration: 0.9,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="
        relative z-10
        text-5xl font-black uppercase
        leading-[0.85]
        tracking-[-0.04em]
        text-white
        sm:text-6xl
        md:text-8xl
      "
    >
      Experience
    </motion.h2>


    {/* =================================================
        SUBTLE DESCRIPTION
    ================================================= */}

    <motion.p
      initial={{
        opacity: 0,
        y: 20,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.25,
      }}
      transition={{
        delay: 0.15,
        duration: 0.7,
      }}
      className="
        mt-8 max-w-2xl
        text-base leading-7
        text-white/50
        sm:text-lg sm:leading-8
      "
    >
      A timeline of academic growth, technical exposure,
      engineering practice and hands-on development.
    </motion.p>


    {/* =================================================
        TIMELINE
    ================================================= */}

    <div className="relative mt-14 space-y-5 md:mt-16">

      {/* =================================================
          MAIN TIMELINE
      ================================================= */}

      <div
        className="
          absolute bottom-8 left-[19px]
          top-8 hidden w-px overflow-hidden
          bg-white/10 md:block
        "
      >

        {/* STATIC RED LINE */}

        <div
          className="
            absolute left-0 top-0
            h-full w-px
            bg-gradient-to-b
            from-red-500
            via-red-500/40
            to-transparent
          "
        />

        {/* MOVING LIGHT */}

        <motion.div
          className="
            absolute left-[-1px]
            h-24 w-[3px]
            rounded-full
            bg-red-500
            shadow-[0_0_15px_rgba(239,68,68,0.9)]
          "
          animate={{
            y: ["-100%", "700%"],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
          }}
        />

      </div>


      {/* =================================================
          EXPERIENCE ITEMS
      ================================================= */}

      {[
        {
          title:
            "B.E Electronics & Communication Engineering",
          description:
            "Academic journey focused on electronics, communication systems, embedded systems and practical engineering.",
        },
        {
          title: "PCB Design Internship",
          description:
            "Hands-on exposure to PCB design concepts, electronic circuits and practical hardware development.",
        },
        {
          title: "Industrial Training Experience",
          description:
            "Industrial exposure connecting engineering concepts with real-world technical systems.",
        },
        {
          title: "Technical Project Presenter",
          description:
            "Presented technical concepts and projects through academic events and technical activities.",
        },
        {
          title: "Robotics & IoT Development",
          description:
            "Hands-on experimentation with Arduino, sensors, embedded systems and IoT concepts.",
        },
      ].map((item, index) => (

        <motion.article
          key={item.title}

          initial={
            isMobileView
              ? { opacity: 1, y: 0, x: 0 }
              : { opacity: 0, y: 35, x: -20 }
          }

          whileInView={
            isMobileView
              ? { opacity: 1, y: 0, x: 0 }
              : { opacity: 1, y: 0, x: 0 }
          }

          viewport={{
            once: true,
            amount: 0.2,
          }}

          transition={
            isMobileView
              ? { duration: 0 }
              : {
                  delay: index * 0.1,
                  duration: 0.7,
                  ease: [0.22, 1, 0.36, 1],
                }
          }

          whileHover={{
            x: 8,
          }}

          className="
            group relative
            flex gap-5
            overflow-hidden
            rounded-[24px]
            border border-white/10
            bg-[#050505]/40
            p-6
            backdrop-blur-sm
            transition-all duration-500
            hover:border-red-500/35
            hover:bg-red-500/[0.025]
            hover:shadow-[0_20px_60px_rgba(0,0,0,0.35)]
            md:gap-6
            md:pl-8
          "
        >

          {/* =================================================
              HOVER SCAN LINE
          ================================================= */}

          <motion.div
            className="
              pointer-events-none
              absolute left-0 top-0
              h-px w-full
              bg-gradient-to-r
              from-transparent
              via-red-500
              to-transparent
              opacity-0
              group-hover:opacity-100
            "
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />


          {/* =================================================
              NUMBER NODE
          ================================================= */}

          <div className="relative z-10 shrink-0">

            <motion.div
              whileHover={{
                scale: 1.12,
              }}
              className="
                relative
                flex h-10 w-10
                items-center justify-center
                rounded-full
                border border-red-500/40
                bg-[#070707]
                font-mono
                text-[9px]
                text-red-500
                transition-all duration-500
                group-hover:border-red-500
                group-hover:bg-red-500/10
                group-hover:shadow-[0_0_25px_rgba(239,68,68,0.3)]
              "
            >

              {/* NODE GLOW */}

              <span
                className="
                  absolute inset-[-5px]
                  rounded-full
                  border border-red-500/0
                  transition-all duration-500
                  group-hover:border-red-500/20
                  group-hover:animate-pulse
                "
              />

              {String(index + 1).padStart(2, "0")}

            </motion.div>

          </div>


          {/* =================================================
              CONTENT
          ================================================= */}

          <div className="min-w-0 flex-1">

            {/* TOP META */}

            <div className="mb-2 flex items-center gap-3">

              <span
                className="
                  font-mono text-[8px]
                  uppercase tracking-[0.2em]
                  text-red-500/60
                "
              >
                0{index + 1}
              </span>

              <span className="h-px w-8 bg-white/10" />

              <span
                className="
                  font-mono text-[8px]
                  uppercase tracking-[0.2em]
                  text-white/25
                "
              >
                EXPERIENCE
              </span>

            </div>


            {/* TITLE */}

            <h3
              className="
                text-lg font-semibold
                leading-tight text-white
                transition-colors duration-300
                group-hover:text-red-50
                sm:text-xl
              "
            >
              {item.title}
            </h3>


            {/* DESCRIPTION */}

            <p
              className="
                mt-3 max-w-3xl
                text-sm leading-7
                text-white/40
                transition-colors duration-300
                group-hover:text-white/55
              "
            >
              {item.description}
            </p>


            {/* BOTTOM LINE */}

            <div
              className="
                mt-5 flex items-center
                gap-3
              "
            >

              <div
                className="
                  h-px w-10
                  bg-red-500/30
                  transition-all duration-500
                  group-hover:w-20
                  group-hover:bg-red-500/70
                "
              />

              <span
                className="
                  font-mono text-[7px]
                  uppercase tracking-[0.25em]
                  text-white/20
                  transition-colors duration-300
                  group-hover:text-red-500/60
                "
              >
                Technical Journey
              </span>

            </div>

          </div>


          {/* =================================================
              RIGHT ARROW
          ================================================= */}

          <div
            className="
              hidden shrink-0
              items-center
              justify-center
              md:flex
            "
          >

            <motion.span
              initial={{
                opacity: 0,
                x: -5,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
              }}
              className="
                text-lg
                text-white/10
                transition-all duration-300
                group-hover:translate-x-1
                group-hover:text-red-500
              "
            >
              →
            </motion.span>

          </div>


          {/* =================================================
              CARD EDGE GLOW
          ================================================= */}

          <div
            className="
              pointer-events-none
              absolute inset-y-0 left-0
              w-px
              bg-gradient-to-b
              from-transparent
              via-red-500/0
              to-transparent
              transition-all duration-500
              group-hover:via-red-500/70
            "
          />

        </motion.article>

      ))}

    </div>


    {/* =================================================
        FOOTER STATUS
    ================================================= */}

    <motion.div
      initial={{
        opacity: 0,
      }}
      whileInView={{
        opacity: 1,
      }}
      viewport={{
        once: true,
        amount: 0.3,
      }}
      transition={{
        delay: 0.4,
        duration: 0.8,
      }}
      className="
        mt-10 flex items-center
        justify-center gap-3
        font-mono text-[8px]
        uppercase tracking-[0.28em]
        text-white/20
      "
    >

      <span
        className="
          h-1.5 w-1.5 rounded-full
          bg-red-500
          shadow-[0_0_10px_rgba(239,68,68,0.8)]
        "
      />

      <span>
        Journey continues...
      </span>

    </motion.div>

  </div>
</section>

       {/* ===================================================
    GALLERY — COMPACT RIPPLE ARCHIVE
=================================================== */}

<section
  id="gallery"
  className="
    relative z-20 w-full scroll-mt-28
    overflow-hidden border-t border-white/10
    bg-transparent
    px-5 py-20
    sm:px-8 sm:py-24
    md:px-16 md:py-28
    lg:px-24
  "
>
  <div
    className="mx-auto w-full"
    style={{
      width: LAYOUT.pageWidth,
      maxWidth: LAYOUT.maxWidth,
    }}
  >

    {/* =================================================
        SECTION LABEL
    ================================================= */}

    <div className="mb-6 flex items-center gap-3">
      <span
        className="
          h-2 w-2 shrink-0 rounded-full
          bg-red-500
          shadow-[0_0_14px_rgba(239,68,68,0.9)]
        "
      />

      <p
        className="
          font-mono text-xs font-medium
          uppercase tracking-[0.28em]
          text-red-500
        "
      >
        08 / Visual Archive
      </p>
    </div>


    {/* =================================================
        TITLE
    ================================================= */}

    <h2
      className="
        relative z-30
        text-5xl font-black uppercase
        leading-[0.85]
        tracking-[-0.04em]
        text-white
        sm:text-6xl
        md:text-8xl
        lg:text-[9rem]
      "
    >
      Gallery
    </h2>


    {/* =================================================
        DESCRIPTION
    ================================================= */}

    <p
      className="
        relative z-30
        mt-8 max-w-2xl
        text-base leading-7
        text-white/60
        sm:text-lg sm:leading-8
      "
    >
      A visual collection of selected work, experiments,
      designs and engineering moments.
    </p>


    {/* =================================================
        FOUR COMPACT PHOTO CARDS
    ================================================= */}

    <div
      className="
        mt-12 grid
        grid-cols-1 gap-4
        sm:grid-cols-2
        lg:grid-cols-4
      "
    >

      {/* =================================================
    PHOTO 01 — COLLEGE PRESENTATION
================================================= */}

<article className="gallery-ripple-card group">

<div className="gallery-ripple-image">

  <img
    src="/gallery/college-presentation.jpg"
    alt="College presentation and engineering event"
    draggable={false}
    loading="lazy"
  />

  {/* RIPPLE */}

  <div className="gallery-ripple-effect" />

  {/* DARK GRADIENT */}

  <div
    className="
      pointer-events-none
      absolute inset-0 z-10
      bg-gradient-to-t
      from-black/95
      via-black/25
      to-transparent
    "
  />

  {/* NUMBER */}

  <span
    className="
      pointer-events-none
      absolute right-4 top-3 z-20
      font-mono text-5xl
      text-white/[0.10]
      transition-all duration-500
      group-hover:text-red-500/[0.16]
    "
  >
    01
  </span>

  {/* BOTTOM CONTENT */}

  <div
    className="
      absolute bottom-0 left-0
      right-0 z-30
      flex items-end
      justify-between
      gap-3
      p-4
      sm:p-5
    "
  >

    <div className="min-w-0">

      <p
        className="
          font-mono text-[8px]
          uppercase
          tracking-[0.22em]
          text-red-500
        "
      >
        COLLEGE / 01
      </p>

      <h3
        className="
          mt-1.5
          truncate
          text-base
          font-bold
          uppercase
          tracking-tight
          text-white
          sm:text-lg
        "
      >
        College Presentation
      </h3>

    </div>


    {/* VIEW ARROW */}

    <div
      className="
        flex h-9 w-9
        shrink-0
        items-center
        justify-center
        rounded-full
        border border-white/15
        bg-black/50
        text-red-500
        backdrop-blur-md
        transition-all duration-500
        group-hover:translate-x-1
        group-hover:border-red-500/60
        group-hover:bg-red-500/10
        group-hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]
      "
    >
      <ArrowUpRight
        size={16}
        strokeWidth={1.8}
        className="
          transition-transform duration-300
          group-hover:translate-x-0.5
          group-hover:-translate-y-0.5
        "
      />
    </div>

  </div>

</div>

</article>
      {/* =================================================
          PHOTO 02
      ================================================= */}

      <article className="gallery-ripple-card group">

        <div className="gallery-ripple-image">

          <img
            src="/gallery/photo-02.jpg"
            alt="Gallery project 02"
            draggable={false}
          />

          <div className="gallery-ripple-effect" />

          <div
            className="
              pointer-events-none
              absolute inset-0 z-10
              bg-gradient-to-t
              from-black/95
              via-black/25
              to-transparent
            "
          />

          <span
            className="
              pointer-events-none
              absolute right-4 top-3 z-20
              font-mono text-5xl
              text-white/[0.10]
              transition-all duration-500
              group-hover:text-red-500/[0.16]
            "
          >
            02
          </span>

          <div
            className="
              absolute bottom-0 left-0
              right-0 z-30
              flex items-end
              justify-between
              gap-3
              p-4
              sm:p-5
            "
          >

            <div className="min-w-0">

              <p
                className="
                  font-mono text-[8px]
                  uppercase
                  tracking-[0.22em]
                  text-red-500
                "
              >
                DESIGN / 02
              </p>

              <h3
                className="
                  mt-1.5
                  truncate
                  text-base font-bold
                  uppercase
                  tracking-tight
                  text-white
                  sm:text-lg
                "
              >
                Creative Work
              </h3>

            </div>

            <div
              className="
                flex h-9 w-9
                shrink-0
                items-center justify-center
                rounded-full
                border border-white/15
                bg-black/50
                text-red-500
                backdrop-blur-md
                transition-all duration-500
                group-hover:translate-x-1
                group-hover:border-red-500/60
                group-hover:bg-red-500/10
                group-hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]
              "
            >
              <ArrowUpRight
                size={16}
                strokeWidth={1.8}
                className="
                  transition-transform duration-300
                  group-hover:translate-x-0.5
                  group-hover:-translate-y-0.5
                "
              />
            </div>

          </div>

        </div>

      </article>


      {/* =================================================
          PHOTO 03
      ================================================= */}

      <article className="gallery-ripple-card group">

        <div className="gallery-ripple-image">

          <img
            src="/gallery/photo-03.jpg"
            alt="Gallery project 03"
            draggable={false}
          />

          <div className="gallery-ripple-effect" />

          <div
            className="
              pointer-events-none
              absolute inset-0 z-10
              bg-gradient-to-t
              from-black/95
              via-black/25
              to-transparent
            "
          />

          <span
            className="
              pointer-events-none
              absolute right-4 top-3 z-20
              font-mono text-5xl
              text-white/[0.10]
              transition-all duration-500
              group-hover:text-red-500/[0.16]
            "
          >
            03
          </span>

          <div
            className="
              absolute bottom-0 left-0
              right-0 z-30
              flex items-end
              justify-between
              gap-3
              p-4
              sm:p-5
            "
          >

            <div className="min-w-0">

              <p
                className="
                  font-mono text-[8px]
                  uppercase
                  tracking-[0.22em]
                  text-red-500
                "
              >
                HARDWARE / 03
              </p>

              <h3
                className="
                  mt-1.5
                  truncate
                  text-base font-bold
                  uppercase
                  tracking-tight
                  text-white
                  sm:text-lg
                "
              >
                Engineering
              </h3>

            </div>

            <div
              className="
                flex h-9 w-9
                shrink-0
                items-center justify-center
                rounded-full
                border border-white/15
                bg-black/50
                text-red-500
                backdrop-blur-md
                transition-all duration-500
                group-hover:translate-x-1
                group-hover:border-red-500/60
                group-hover:bg-red-500/10
                group-hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]
              "
            >
              <ArrowUpRight
                size={16}
                strokeWidth={1.8}
                className="
                  transition-transform duration-300
                  group-hover:translate-x-0.5
                  group-hover:-translate-y-0.5
                "
              />
            </div>

          </div>

        </div>

      </article>


      {/* =================================================
          PHOTO 04
      ================================================= */}

      <article className="gallery-ripple-card group">

        <div className="gallery-ripple-image">

          <img
            src="/gallery/photo-04.jpg"
            alt="Gallery project 04"
            draggable={false}
          />

          <div className="gallery-ripple-effect" />

          <div
            className="
              pointer-events-none
              absolute inset-0 z-10
              bg-gradient-to-t
              from-black/95
              via-black/25
              to-transparent
            "
          />

          <span
            className="
              pointer-events-none
              absolute right-4 top-3 z-20
              font-mono text-5xl
              text-white/[0.10]
              transition-all duration-500
              group-hover:text-red-500/[0.16]
            "
          >
            04
          </span>

          <div
            className="
              absolute bottom-0 left-0
              right-0 z-30
              flex items-end
              justify-between
              gap-3
              p-4
              sm:p-5
            "
          >

            <div className="min-w-0">

              <p
                className="
                  font-mono text-[8px]
                  uppercase
                  tracking-[0.22em]
                  text-red-500
                "
              >
                CREATIVE / 04
              </p>

              <h3
                className="
                  mt-1.5
                  truncate
                  text-base font-bold
                  uppercase
                  tracking-tight
                  text-white
                  sm:text-lg
                "
              >
                Visual Study
              </h3>

            </div>

            <div
              className="
                flex h-9 w-9
                shrink-0
                items-center justify-center
                rounded-full
                border border-white/15
                bg-black/50
                text-red-500
                backdrop-blur-md
                transition-all duration-500
                group-hover:translate-x-1
                group-hover:border-red-500/60
                group-hover:bg-red-500/10
                group-hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]
              "
            >
              <ArrowUpRight
                size={16}
                strokeWidth={1.8}
                className="
                  transition-transform duration-300
                  group-hover:translate-x-0.5
                  group-hover:-translate-y-0.5
                "
              />
            </div>

          </div>

        </div>

      </article>

    </div>


    {/* =================================================
        FOOTER
    ================================================= */}

    <p
      className="
        mt-10 text-center
        font-hand text-2xl
        text-white/30
        sm:text-3xl
      "
    >
      Your projects. Your process. Your visual story.
    </p>

  </div>


  {/* =================================================
      GALLERY ANIMATION
  ================================================= */}

  <style>{`

    /* -----------------------------------------------
       CARD
    ----------------------------------------------- */

    #gallery .gallery-ripple-card {
      position: relative;
      width: 100%;
      min-width: 0;
      overflow: hidden;

      border-radius: 18px;
      border: 1px solid rgba(255,255,255,0.10);

      background: #050505;

      isolation: isolate;

      transition:
        transform 0.55s cubic-bezier(0.22,1,0.36,1),
        border-color 0.45s ease,
        box-shadow 0.45s ease;
    }


    /* -----------------------------------------------
       HOVER CARD
    ----------------------------------------------- */

    #gallery .gallery-ripple-card:hover {
      transform: translateY(-6px);

      border-color:
        rgba(239,68,68,0.45);

      box-shadow:
        0 18px 45px rgba(0,0,0,0.55),
        0 0 28px rgba(239,68,68,0.10);
    }


    /* -----------------------------------------------
       IMAGE FRAME
    ----------------------------------------------- */

    #gallery .gallery-ripple-image {
      position: relative;

      width: 100%;

      /*
        Compact rectangle.
        This keeps all four images
        exactly the same size.
      */
      aspect-ratio: 16 / 10;

      overflow: hidden;

      background: #050505;
    }


    /* -----------------------------------------------
       IMAGE
    ----------------------------------------------- */

    #gallery .gallery-ripple-image img {
      position: absolute;
      inset: 0;

      width: 100%;
      height: 100%;

      object-fit: cover;

      user-select: none;
      pointer-events: none;

      opacity: 0.84;

      transform:
        scale(1)
        translate3d(0,0,0);

      filter:
        saturate(0.90)
        contrast(1.04);

      transition:
        transform 0.9s cubic-bezier(0.22,1,0.36,1),
        filter 0.7s ease,
        opacity 0.5s ease;
    }


    /* -----------------------------------------------
       RIPPLE
    ----------------------------------------------- */

    #gallery .gallery-ripple-effect {
      position: absolute;

      inset: -40%;

      z-index: 15;

      pointer-events: none;

      opacity: 0;

      background:
        repeating-radial-gradient(
          circle at center,

          transparent 0%,
          transparent 7%,

          rgba(239,68,68,0.14) 7.5%,

          transparent 8.5%,

          transparent 15%
        );

      transform: scale(0.35);

      transition:
        opacity 0.35s ease,
        transform 1.2s
          cubic-bezier(0.16,1,0.3,1);
    }


    /* -----------------------------------------------
       RIPPLE ON HOVER
    ----------------------------------------------- */

    #gallery
      .gallery-ripple-card:hover
      .gallery-ripple-effect {

      opacity: 1;

      transform: scale(1.35);

      animation:
        galleryRippleAnimation
        2.2s
        cubic-bezier(0.22,1,0.36,1)
        infinite;
    }


    /* -----------------------------------------------
       IMAGE HOVER
    ----------------------------------------------- */

    #gallery
      .gallery-ripple-card:hover
      .gallery-ripple-image img {

      transform:
        scale(1.08)
        translate3d(0,-3px,0);

      filter:
        saturate(1.10)
        contrast(1.08)
        brightness(1.06);

      opacity: 1;
    }


    /* -----------------------------------------------
       RIPPLE KEYFRAMES
    ----------------------------------------------- */

    @keyframes galleryRippleAnimation {

      0% {
        opacity: 0;

        transform:
          scale(0.40);
      }

      20% {
        opacity: 0.75;
      }

      55% {
        opacity: 0.35;
      }

      100% {
        opacity: 0;

        transform:
          scale(1.45);
      }

    }


    /* -----------------------------------------------
       ENTRANCE
    ----------------------------------------------- */

    #gallery .gallery-ripple-card {
      animation:
        galleryCardEntrance
        0.75s
        cubic-bezier(0.22,1,0.36,1)
        both;
    }


    #gallery
      .gallery-ripple-card:nth-child(1) {
      animation-delay: 0.05s;
    }

    #gallery
      .gallery-ripple-card:nth-child(2) {
      animation-delay: 0.12s;
    }

    #gallery
      .gallery-ripple-card:nth-child(3) {
      animation-delay: 0.19s;
    }

    #gallery
      .gallery-ripple-card:nth-child(4) {
      animation-delay: 0.26s;
    }


    @keyframes galleryCardEntrance {

      from {
        opacity: 0;

        transform:
          translateY(22px)
          scale(0.98);
      }

      to {
        opacity: 1;

        transform:
          translateY(0)
          scale(1);
      }

    }


    /* -----------------------------------------------
       MOBILE
    ----------------------------------------------- */

    @media (max-width: 640px) {

      #gallery .gallery-ripple-image {
        aspect-ratio: 16 / 10;
      }

      #gallery .gallery-ripple-card:hover {
        transform:
          translateY(-4px);
      }

      #gallery .gallery-ripple-card:hover
        .gallery-ripple-effect {

        animation-duration: 2.8s;
      }

    }


    /* -----------------------------------------------
       REDUCED MOTION
    ----------------------------------------------- */

    @media (prefers-reduced-motion: reduce) {

      #gallery .gallery-ripple-card {
        animation: none;
      }

      #gallery .gallery-ripple-card:hover {
        transform: none;
      }

      #gallery
        .gallery-ripple-card:hover
        .gallery-ripple-effect {

        animation: none !important;
        opacity: 0;
      }

      #gallery
        .gallery-ripple-card:hover
        .gallery-ripple-image img {

        transform: none;
      }

    }

  `}</style>

</section>

        {/* ===================================================
            CONTACT
        =================================================== */}

        <section
          id="contact"
          className="relative z-20 w-full scroll-mt-28 border-t border-white/10 bg-transparent px-5 py-24 sm:px-8 md:px-16 md:py-32 lg:px-24"
        >

          <div
            className="mx-auto w-full"
            style={{
              width: LAYOUT.pageWidth,
              maxWidth: LAYOUT.maxWidth,
            }}
          >

            <div className="mb-6 flex items-center gap-3">

              <span className="h-2 w-2 shrink-0 rounded-full bg-red-500 shadow-[0_0_14px_rgba(239,68,68,0.9)]" />

              <p className="font-mono text-xs uppercase tracking-[0.28em] text-red-500">
                09 / Connect
              </p>

            </div>


            <h2 className="text-5xl font-black uppercase leading-[0.85] tracking-[-0.04em] text-white sm:text-6xl md:text-8xl">
              Let's Build
            </h2>


            <div className="mt-12 rounded-[32px] border border-white/10 bg-transparent p-6 backdrop-blur-sm sm:p-8 md:p-12">

              <div className="grid gap-12 lg:grid-cols-2">

                {/* LEFT */}

                <div>

                  <p className="max-w-xl text-2xl leading-relaxed text-white/70 md:text-3xl">
                    Have an embedded idea, digital product,
                    creative project or technical challenge?
                  </p>


                  <a
                    href="mailto:007boopesh@gmail.com"
                    className="mt-8 inline-block text-lg text-red-500 underline underline-offset-8 transition-colors hover:text-red-400 sm:text-xl"
                  >
                    007boopesh@gmail.com
                  </a>


                  <div className="mt-10 space-y-4">

                    <a
                      href="https://www.linkedin.com/in/boopesh007"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-white/45 transition-colors hover:text-white"
                    >
                      <Linkedin size={17} />
                      <span>LinkedIn</span>
                      <ExternalLink size={12} />
                    </a>


                    <a
                      href="https://github.com/007boopesh"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-white/45 transition-colors hover:text-white"
                    >
                      <Github size={17} />
                      <span>GitHub</span>
                      <ExternalLink size={12} />
                    </a>


                    <a
                      href="https://www.instagram.com/toxic_boopesh"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-white/45 transition-colors hover:text-white"
                    >
                      <Instagram size={17} />
                      <span>Instagram</span>
                      <ExternalLink size={12} />
                    </a>

                  </div>

                </div>


                {/* FORM */}

                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    const form = event.currentTarget;
                    const data = new FormData(form);
                    const subject = String(data.get("subject") || "Portfolio Contact");
                    const body = [
                      `Name: ${String(data.get("name") || "")}`,
                      `Email: ${String(data.get("email") || "")}`,
                      "",
                      String(data.get("message") || ""),
                    ].join("\n");
                    window.location.href = `mailto:007boopesh@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                  }}
                  className="space-y-3"
                >

                  <input
                    name="name"
                    placeholder="Name"
                    required
                    className="w-full rounded-2xl border border-white/10 bg-transparent p-4 text-white outline-none placeholder:text-white/30 focus:border-red-500"
                  />


                  <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    required
                    className="w-full rounded-2xl border border-white/10 bg-transparent p-4 text-white outline-none placeholder:text-white/30 focus:border-red-500"
                  />


                  <input
                    name="subject"
                    placeholder="Subject"
                    className="w-full rounded-2xl border border-white/10 bg-transparent p-4 text-white outline-none placeholder:text-white/30 focus:border-red-500"
                  />


                  <textarea
                    name="message"
                    placeholder="Tell me about your idea..."
                    rows={5}
                    required
                    className="w-full resize-none rounded-2xl border border-white/10 bg-transparent p-4 text-white outline-none placeholder:text-white/30 focus:border-red-500"
                  />


                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-red-600 p-4 font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-red-500 hover:shadow-[0_10px_35px_rgba(239,68,68,0.25)]"
                  >

                    Send Message

                    <ArrowUpRight
                      className="ml-1 inline"
                      size={17}
                    />

                  </button>

                </form>

              </div>

            </div>

          </div>

        </section>


        {/* ===================================================
            FOOTER
        =================================================== */}

        <footer className="relative z-20 border-t border-white/10 bg-transparent px-5 py-12 pb-32 text-center sm:px-8">

          <p className="font-display text-4xl text-white sm:text-5xl">

            BOOPESH
            <span className="text-red-500">
              _K
            </span>

          </p>


          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/30">
            Electronics & Communication • Embedded •
            IoT • Creative Technology
          </p>


          <div className="mx-auto mt-8 h-px w-24 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />


          <p className="mt-6 font-mono text-[9px] uppercase tracking-[0.25em] text-white/20">
            © 2026 Boopesh K • All Rights Reserved
          </p>

        </footer>

      </div>


      {/* ===================================================
          ADMIN
      =================================================== */}

      <a
        href="/spidey.html"
        className="fixed bottom-5 right-5 z-[100] hidden rounded-full border border-white/10 bg-black/70 px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-white/55 backdrop-blur-xl transition-colors hover:text-red-500 md:block"
      >
        Admin
      </a>


      {/* ===================================================
          SOCIAL DOCK
      =================================================== */}

      <SocialDock />

      {/* ===================================================
          MOBILE NAV + RESPONSIVE ALIGNMENT FIX
          Desktop layout remains unchanged.
      =================================================== */}

      <style>{`
        /*
         * The section containers already have horizontal padding.
         * Using 95vw inside them makes the content wider than the
         * available mobile content box and causes the right edge to clip.
         */
        html,
        body {
          max-width: 100%;
          overflow-x: hidden;
        }

        main {
          width: 100%;
          max-width: 100%;
          overflow-x: clip;
          box-sizing: border-box;
        }

        @media (max-width: 767px) {
          /* Frames 001 → Frames 257 remains active on mobile. */
          html,
          body {
            touch-action: pan-y;
            overflow-x: hidden;
          }

          #hero-canvas {
            width: 100vw !important;
            max-width: 100vw !important;
            pointer-events: none !important;
            transform: translateZ(0) !important;
            backface-visibility: hidden !important;
            -webkit-backface-visibility: hidden !important;
          }

          #projects {
            contain: layout paint style;
          }

          #projects img {
            content-visibility: auto;
          }

          /*
           * Mobile performance: the education/achievement cards used heavy
           * backdrop-filter + layered blur effects. On phones these effects
           * can force expensive GPU recomposition while scrolling. Keep the
           * cyber glass look on desktop, but use an opaque/translucent panel
           * on mobile for smooth scrolling.
           */
          @media (max-width: 767px) {
            .mobile-no-blur,
            #education,
            #education *,
            #awards,
            #awards *,
            #experience,
            #experience * {
              -webkit-backdrop-filter: none !important;
              backdrop-filter: none !important;
            }

            .mobile-scroll-card {
              contain: layout paint;
              transform: translateZ(0);
              -webkit-transform: translateZ(0);
              will-change: auto;
            }

            #education .blur-3xl,
            #education .blur-xl,
            #awards .blur-3xl,
            #awards .blur-xl {
              display: none !important;
            }

            #education article,
            #awards article {
              transform: none !important;
              will-change: auto !important;
              contain: layout paint;
            }
          }

          /* Mobile navigation replaces the desktop navigation. */
          main > nav {
            display: none !important;
          }

          /*
           * All section wrappers use the full width of the padded section.
           * This fixes the left/right imbalance visible on phones.
           */
          #home > .relative.z-10.mx-auto,
          #about > .mx-auto,
          #education > .mx-auto,
          #services > .mx-auto,
          #projects > .mx-auto,
          #awards > .mx-auto,
          #skills > .mx-auto,
          #experience > .mx-auto,
          #gallery > .mx-auto,
          #contact > .mx-auto {
            width: 100% !important;
            max-width: 100% !important;
            margin-left: auto !important;
            margin-right: auto !important;
            box-sizing: border-box !important;
          }

          /*
           * Desktop hero offset/oversizing must not be applied on mobile.
           */
          #home .hero-text-control {
            width: 100% !important;
            max-width: 100% !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
            transform: none !important;
            box-sizing: border-box !important;
          }

          /* Stop any child grid from creating a wider layout. */
          #home .grid,
          #about .grid,
          #education .grid,
          #services .grid,
          #projects .grid,
          #awards .grid,
          #skills .grid,
          #experience .grid,
          #gallery .grid,
          #contact .grid {
            min-width: 0;
            max-width: 100%;
          }

          /* Long headings/text stay inside the viewport. */
          #home h1,
          #about h2,
          #education h3,
          #services h3,
          #projects h3,
          #awards h3,
          #skills h3,
          #experience h3,
          #gallery h3,
          #contact h3 {
            max-width: 100%;
          }
        }

        @media (max-width: 380px) {
          #home .hero-text-control {
            transform: none !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            scroll-behavior: auto !important;
          }
        }

        @media (hover: none) and (pointer: coarse) {
          main > nav {
            display: none !important;
          }
        }
      `}</style>

      </MotionConfig>
    </main>
  );
}
