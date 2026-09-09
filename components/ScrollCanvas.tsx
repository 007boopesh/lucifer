"use client";

import { useCallback, useEffect, useRef } from "react";

const FRAME_COUNT = 257;
const FRAME_PATH = (index: number) =>
  `./frames/frame_${String(index + 1).padStart(3, "0")}.jpg`;

const MOBILE_MAX_DPR = 1.5;
const DESKTOP_MAX_DPR = 2;
const TARGET_FPS = 30;
const FRAME_INTERVAL = 1000 / TARGET_FPS;

const MOBILE_RADIUS = 10;
const DESKTOP_RADIUS = 18;
const MOBILE_CONCURRENCY = 3;
const DESKTOP_CONCURRENCY = 6;
const FALLBACK_SEARCH_RADIUS = 24;

type FrameState = "idle" | "loading" | "ready" | "error";

export default function ScrollCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const imagesRef = useRef<Array<HTMLImageElement | null>>(
    Array(FRAME_COUNT).fill(null),
  );
  const statesRef = useRef<FrameState[]>(
    Array(FRAME_COUNT).fill("idle"),
  );

  const targetFrameRef = useRef(0);
  const currentFrameRef = useRef(-1);

  const rafRef = useRef<number | null>(null);
  const lastRenderRef = useRef(0);
  const resizeTimerRef = useRef<number | null>(null);
  const destroyedRef = useRef(false);

  const loadQueueRef = useRef<number[]>([]);
  const queuedRef = useRef<Set<number>>(new Set());
  const activeLoadsRef = useRef(0);

  const isMobileRef = useRef(false);

  const getViewport = useCallback(() => {
    if (typeof window === "undefined") {
      return { width: 1, height: 1 };
    }

    // Use layout viewport for the canvas. This avoids jumps caused by
    // mobile browser URL-bar changes in visualViewport dimensions.
    return {
      width: Math.max(1, window.innerWidth),
      height: Math.max(1, window.innerHeight),
    };
  }, []);

  const getDpr = useCallback(() => {
    if (typeof window === "undefined") return 1;

    const limit = isMobileRef.current
      ? MOBILE_MAX_DPR
      : DESKTOP_MAX_DPR;

    return Math.min(window.devicePixelRatio || 1, limit);
  }, []);

  const calculateProgress = useCallback(() => {
    if (typeof window === "undefined") return 0;

    const maxScroll = Math.max(
      1,
      document.documentElement.scrollHeight - window.innerHeight,
    );

    const scrollTop = Math.max(0, window.scrollY || 0);
    return Math.max(0, Math.min(1, scrollTop / maxScroll));
  }, []);

  const frameFromProgress = useCallback((progress: number) => {
    const safe = Math.max(0, Math.min(1, progress));
    return Math.round(safe * (FRAME_COUNT - 1));
  }, []);

  const drawFrame = useCallback(
    (frameIndex: number) => {
      if (destroyedRef.current) return false;

      const canvas = canvasRef.current;
      const image = imagesRef.current[frameIndex];

      if (!canvas || !image || statesRef.current[frameIndex] !== "ready") {
        return false;
      }

      const width = getViewport().width;
      const height = getViewport().height;

      if (
        width <= 0 ||
        height <= 0 ||
        image.naturalWidth <= 0 ||
        image.naturalHeight <= 0
      ) {
        return false;
      }

      const dpr = getDpr();
      const physicalWidth = Math.max(1, Math.round(width * dpr));
      const physicalHeight = Math.max(1, Math.round(height * dpr));

      if (
        canvas.width !== physicalWidth ||
        canvas.height !== physicalHeight
      ) {
        canvas.width = physicalWidth;
        canvas.height = physicalHeight;
      }

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const context = canvas.getContext("2d");
      if (!context) return false;

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.globalAlpha = 1;
      context.filter = "none";
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";

      context.clearRect(0, 0, width, height);

      const imageRatio = image.naturalWidth / image.naturalHeight;
      const viewportRatio = width / height;

      let drawWidth: number;
      let drawHeight: number;
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

      // Keep the original cinematic black/red-compatible treatment,
      // but avoid a heavy filter on every frame where possible.
      context.filter =
        "brightness(0.94) contrast(1.08) saturate(0.88)";

      context.drawImage(
        image,
        offsetX,
        offsetY,
        drawWidth,
        drawHeight,
      );

      context.filter = "none";

      const overlay = context.createLinearGradient(
        0,
        0,
        0,
        height,
      );

      overlay.addColorStop(0, "rgba(0,0,0,0.10)");
      overlay.addColorStop(0.45, "rgba(0,0,0,0)");
      overlay.addColorStop(1, "rgba(0,0,0,0.16)");

      context.fillStyle = overlay;
      context.fillRect(0, 0, width, height);

      const vignette = context.createRadialGradient(
        width / 2,
        height / 2,
        Math.min(width, height) * 0.30,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.72,
      );

      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(0.72, "rgba(0,0,0,0.03)");
      vignette.addColorStop(1, "rgba(0,0,0,0.24)");

      context.fillStyle = vignette;
      context.fillRect(0, 0, width, height);

      context.globalAlpha = 1;
      context.filter = "none";

      currentFrameRef.current = frameIndex;
      return true;
    },
    [getDpr, getViewport],
  );

  const findReadyFrame = useCallback((requested: number) => {
    const clamped = Math.max(
      0,
      Math.min(FRAME_COUNT - 1, requested),
    );

    if (statesRef.current[clamped] === "ready") {
      return clamped;
    }

    for (let distance = 1; distance <= FALLBACK_SEARCH_RADIUS; distance++) {
      const forward = clamped + distance;
      const backward = clamped - distance;

      if (
        forward < FRAME_COUNT &&
        statesRef.current[forward] === "ready"
      ) {
        return forward;
      }

      if (
        backward >= 0 &&
        statesRef.current[backward] === "ready"
      ) {
        return backward;
      }
    }

    return currentFrameRef.current >= 0
      ? currentFrameRef.current
      : -1;
  }, []);

  const scheduleRenderRef = useRef<() => void>(() => {});

  const enqueueFrame = useCallback((index: number, priority = false) => {
    if (
      index < 0 ||
      index >= FRAME_COUNT ||
      destroyedRef.current ||
      statesRef.current[index] === "ready" ||
      statesRef.current[index] === "loading" ||
      queuedRef.current.has(index)
    ) {
      return;
    }

    queuedRef.current.add(index);

    if (priority) {
      loadQueueRef.current.unshift(index);
    } else {
      loadQueueRef.current.push(index);
    }
  }, []);

  const pumpLoader = useCallback(() => {
    if (destroyedRef.current) return;

    const limit = isMobileRef.current
      ? MOBILE_CONCURRENCY
      : DESKTOP_CONCURRENCY;

    while (
      activeLoadsRef.current < limit &&
      loadQueueRef.current.length > 0
    ) {
      const index = loadQueueRef.current.shift()!;
      queuedRef.current.delete(index);

      if (
        statesRef.current[index] === "ready" ||
        statesRef.current[index] === "loading"
      ) {
        continue;
      }

      const image = new Image();
      image.decoding = "async";
      image.loading = "eager";

      if ("fetchPriority" in image) {
        image.fetchPriority =
          index === targetFrameRef.current ? "high" : "auto";
      }

      imagesRef.current[index] = image;
      statesRef.current[index] = "loading";
      activeLoadsRef.current += 1;

      let finished = false;

      const finish = (state: FrameState) => {
        if (finished) return;
        finished = true;

        activeLoadsRef.current = Math.max(
          0,
          activeLoadsRef.current - 1,
        );

        statesRef.current[index] = state;

        image.onload = null;
        image.onerror = null;

        if (state === "ready") {
          if (index === targetFrameRef.current) {
            scheduleRenderRef.current();
          }
        }

        pumpLoader();
      };

      image.onload = async () => {
        if (destroyedRef.current) {
          finish("error");
          return;
        }

        try {
          if (typeof image.decode === "function") {
            await image.decode();
          }
        } catch {
          // Some browsers reject decode() after onload even though
          // the image is perfectly drawable. onload is sufficient.
        }

        if (
          image.naturalWidth > 0 &&
          image.naturalHeight > 0
        ) {
          finish("ready");
        } else {
          finish("error");
        }
      };

      image.onerror = () => finish("error");

      image.src = FRAME_PATH(index);
    }
  }, []);

  const requestNeighborhood = useCallback(
    (center: number) => {
      const radius = isMobileRef.current
        ? MOBILE_RADIUS
        : DESKTOP_RADIUS;

      // Exact requested frame gets highest priority.
      enqueueFrame(center, true);

      // Then load in both directions. This is important for reverse
      // scrolling and prevents the old sequential 1 -> 257 bottleneck.
      for (let distance = 1; distance <= radius; distance++) {
        const forward = center + distance;
        const backward = center - distance;

        if (forward < FRAME_COUNT) {
          enqueueFrame(forward);
        }

        if (backward >= 0) {
          enqueueFrame(backward);
        }
      }

      pumpLoader();
    },
    [enqueueFrame, pumpLoader],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    destroyedRef.current = false;
    isMobileRef.current = window.matchMedia(
      "(max-width: 767px)",
    ).matches;

    // Clear any previous state if React remounts this component.
    imagesRef.current = Array(FRAME_COUNT).fill(null);
    statesRef.current = Array(FRAME_COUNT).fill("idle");
    loadQueueRef.current = [];
    queuedRef.current.clear();
    activeLoadsRef.current = 0;
    currentFrameRef.current = -1;
    targetFrameRef.current = 0;
    lastRenderRef.current = 0;

    const render = (time: number) => {
      rafRef.current = null;

      if (destroyedRef.current) return;

      const elapsed = time - lastRenderRef.current;

      if (elapsed < FRAME_INTERVAL) {
        rafRef.current = window.requestAnimationFrame(render);
        return;
      }

      const requested = targetFrameRef.current;
      const available = findReadyFrame(requested);

      if (available >= 0 && available !== currentFrameRef.current) {
        drawFrame(available);
      }

      lastRenderRef.current = time;

      // Keep the loop alive while the requested frame is not ready.
      // This removes the previous "render loop stops" failure mode.
      if (
        currentFrameRef.current !== targetFrameRef.current ||
        statesRef.current[targetFrameRef.current] === "loading" ||
        statesRef.current[targetFrameRef.current] === "idle"
      ) {
        rafRef.current = window.requestAnimationFrame(render);
      }
    };

    scheduleRenderRef.current = () => {
      if (destroyedRef.current || rafRef.current !== null) return;
      rafRef.current = window.requestAnimationFrame(render);
    };

    const resizeCanvas = () => {
      if (destroyedRef.current) return;

      const { width, height } = getViewport();
      const dpr = getDpr();

      const physicalWidth = Math.max(
        1,
        Math.round(width * dpr),
      );
      const physicalHeight = Math.max(
        1,
        Math.round(height * dpr),
      );

      if (
        canvas.width !== physicalWidth ||
        canvas.height !== physicalHeight
      ) {
        canvas.width = physicalWidth;
        canvas.height = physicalHeight;
      }

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const context = canvas.getContext("2d");
      if (context) {
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
      }

      const current = currentFrameRef.current;
      if (
        current >= 0 &&
        statesRef.current[current] === "ready"
      ) {
        drawFrame(current);
      } else {
        scheduleRenderRef.current();
      }
    };

    const handleScroll = () => {
      if (destroyedRef.current) return;

      const next = frameFromProgress(calculateProgress());

      if (next !== targetFrameRef.current) {
        targetFrameRef.current = next;
      }

      requestNeighborhood(next);
      scheduleRenderRef.current();
    };

    const handleResize = () => {
      if (resizeTimerRef.current !== null) {
        window.clearTimeout(resizeTimerRef.current);
      }

      resizeTimerRef.current = window.setTimeout(() => {
        resizeTimerRef.current = null;

        if (destroyedRef.current) return;

        isMobileRef.current = window.matchMedia(
          "(max-width: 767px)",
        ).matches;

        resizeCanvas();

        const next = frameFromProgress(
          calculateProgress(),
        );

        targetFrameRef.current = next;
        requestNeighborhood(next);
        scheduleRenderRef.current();
      }, isMobileRef.current ? 100 : 50);
    };

    resizeCanvas();

    // Always start with frame 001.
    targetFrameRef.current = 0;
    enqueueFrame(0, true);
    requestNeighborhood(0);
    pumpLoader();
    scheduleRenderRef.current();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    window.addEventListener("resize", handleResize, {
      passive: true,
    });

    window.visualViewport?.addEventListener(
      "resize",
      handleResize,
    );

    return () => {
      destroyedRef.current = true;

      window.removeEventListener(
        "scroll",
        handleScroll,
      );

      window.removeEventListener(
        "resize",
        handleResize,
      );

      window.visualViewport?.removeEventListener(
        "resize",
        handleResize,
      );

      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      if (resizeTimerRef.current !== null) {
        window.clearTimeout(resizeTimerRef.current);
        resizeTimerRef.current = null;
      }

      queuedRef.current.clear();
      loadQueueRef.current = [];

      imagesRef.current.forEach((image) => {
        if (image) {
          image.onload = null;
          image.onerror = null;
          image.src = "";
        }
      });

      imagesRef.current = [];
      statesRef.current = [];

      const context = canvas.getContext("2d");
      if (context) {
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.filter = "none";
        context.globalAlpha = 1;
        context.clearRect(
          0,
          0,
          canvas.width,
          canvas.height,
        );
      }

      activeLoadsRef.current = 0;
      scheduleRenderRef.current = () => {};
    };
  }, [
    calculateProgress,
    drawFrame,
    enqueueFrame,
    findReadyFrame,
    frameFromProgress,
    getDpr,
    getViewport,
    pumpLoader,
    requestNeighborhood,
  ]);

  return (
    <canvas
      ref={canvasRef}
      id="hero-canvas"
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 block h-screen w-screen"
      style={{
        width: "100vw",
        height: "100vh",
        display: "block",
        background: "transparent",
        backgroundColor: "transparent",
        border: "0",
        outline: "0",
        boxShadow: "none",
        opacity: 1,
        transform: "translate3d(0, 0, 0)",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        imageRendering: "auto",
        touchAction: "pan-y",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    />
  );
}
