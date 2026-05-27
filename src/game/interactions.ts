import { Application, Container } from "pixi.js";

export interface CameraController {
  /** Smoothly pan+zoom the camera to a world coordinate */
  zoomTo: (x: number, y: number, scaleLevel: number) => void;
  /** Reset camera to default overview */
  reset: () => void;
  /** Called every frame by the ticker */
  update: (delta: number) => void;
  /** Attach pointer/wheel listeners to a canvas element */
  attachToCanvas: (canvas: HTMLCanvasElement, app: Application) => () => void;
  /** When true, programmatic zoomTo calls are honoured; when false they are ignored */
  setAutoFocus: (enabled: boolean) => void;
}

const MIN_SCALE = 0.35;
const MAX_SCALE = 3.2;
const LERP_SPEED = 0.14;   // fraction per frame towards target

export function createCameraController(
  stage: Container,
  width: number,
  height: number
): CameraController {
  // ── Smooth-target state (auto-focus / programmatic) ────────────────────────
  let targetX     = 0;
  let targetY     = 0;
  let targetScale = 1.0;
  let autoFocus   = true;

  // ── Manual drag state ──────────────────────────────────────────────────────
  let isDragging     = false;
  let dragStartX     = 0;
  let dragStartY     = 0;
  let stageStartX    = 0;
  let stageStartY    = 0;

  // ── Momentum / inertia ─────────────────────────────────────────────────────
  let velX = 0;
  let velY = 0;
  let lastMoveX = 0;
  let lastMoveY = 0;
  let lastMoveTime = 0;

  // ── Pinch-to-zoom state ────────────────────────────────────────────────────
  let pinchDist0    = 0;
  let pinchScale0   = 1;
  let pinchMidX     = 0;
  let pinchMidY     = 0;
  let activeTouches: PointerEvent[] = [];

  // ── Helpers ────────────────────────────────────────────────────────────────
  function clampScale(s: number) {
    return Math.max(MIN_SCALE, Math.min(MAX_SCALE, s));
  }

  /** Zoom around a screen-space pivot point (px, py) */
  function zoomAroundPivot(pivotX: number, pivotY: number, newScale: number) {
    const clamped = clampScale(newScale);
    const ratio   = clamped / stage.scale.x;
    stage.x       = pivotX - (pivotX - stage.x) * ratio;
    stage.y       = pivotY - (pivotY - stage.y) * ratio;
    stage.scale.set(clamped);
    // Sync targets so auto-lerp doesn't fight manual zoom
    targetX     = stage.x;
    targetY     = stage.y;
    targetScale = clamped;
  }

  // ── Public API ─────────────────────────────────────────────────────────────
  const controller: CameraController = {
    setAutoFocus(enabled) {
      autoFocus = enabled;
    },

    zoomTo(x, y, scaleLevel) {
      if (!autoFocus) return;
      targetScale = clampScale(scaleLevel);
      targetX     = width  / 2 - x * targetScale;
      targetY     = height / 2 - y * targetScale;
    },

    reset() {
      targetX     = 0;
      targetY     = 0;
      targetScale = 1.0;
    },

    update(delta) {
      if (isDragging) return; // don't fight the user while dragging

      // Apply momentum when not dragging
      if (!isDragging && (Math.abs(velX) > 0.2 || Math.abs(velY) > 0.2)) {
        stage.x += velX;
        stage.y += velY;
        targetX  = stage.x;
        targetY  = stage.y;
        velX    *= 0.88; // friction
        velY    *= 0.88;
      }

      // Smooth lerp towards targets (only when auto-focus is active)
      const spd = LERP_SPEED * delta;
      stage.scale.x += (targetScale - stage.scale.x) * spd;
      stage.scale.y += (targetScale - stage.scale.y) * spd;
      stage.x       += (targetX - stage.x) * spd;
      stage.y       += (targetY - stage.y) * spd;
    },

    attachToCanvas(canvas, _app) {
      // ── Mouse / Pointer drag ───────────────────────────────────────────────
      function onPointerDown(e: PointerEvent) {
        if (e.pointerType === "touch") {
          activeTouches.push(e);
          if (activeTouches.length === 2) {
            // Begin pinch
            const [t1, t2] = activeTouches;
            pinchDist0  = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
            pinchScale0 = stage.scale.x;
            pinchMidX   = (t1.clientX + t2.clientX) / 2;
            pinchMidY   = (t1.clientY + t2.clientY) / 2;
            return;
          }
        }

        if (e.button !== 0 && e.button !== 1) return;
        isDragging   = true;
        dragStartX   = e.clientX;
        dragStartY   = e.clientY;
        stageStartX  = stage.x;
        stageStartY  = stage.y;
        velX = velY  = 0;
        lastMoveX    = e.clientX;
        lastMoveY    = e.clientY;
        lastMoveTime = performance.now();
        canvas.style.cursor = "grabbing";
        canvas.setPointerCapture(e.pointerId);
      }

      function onPointerMove(e: PointerEvent) {
        // Update pinch touches
        if (e.pointerType === "touch") {
          const idx = activeTouches.findIndex(t => t.pointerId === e.pointerId);
          if (idx >= 0) activeTouches[idx] = e;

          if (activeTouches.length === 2) {
            const [t1, t2] = activeTouches;
            const dist    = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
            const midX    = (t1.clientX + t2.clientX) / 2;
            const midY    = (t1.clientY + t2.clientY) / 2;
            const newScale = clampScale(pinchScale0 * (dist / pinchDist0));
            // Pan + pinch simultaneously
            const rect    = canvas.getBoundingClientRect();
            zoomAroundPivot(midX - rect.left, midY - rect.top, newScale);
            // Also pan
            stage.x += (midX - pinchMidX);
            stage.y += (midY - pinchMidY);
            targetX  = stage.x;
            targetY  = stage.y;
            pinchMidX = midX;
            pinchMidY = midY;
            return;
          }
        }

        if (!isDragging) return;
        const dx = e.clientX - dragStartX;
        const dy = e.clientY - dragStartY;
        stage.x  = stageStartX + dx;
        stage.y  = stageStartY + dy;
        targetX  = stage.x;
        targetY  = stage.y;

        // Track velocity for momentum
        const now  = performance.now();
        const dt   = now - lastMoveTime;
        if (dt > 0) {
          velX = (e.clientX - lastMoveX) * (16 / dt); // normalise to ~60fps
          velY = (e.clientY - lastMoveY) * (16 / dt);
        }
        lastMoveX    = e.clientX;
        lastMoveY    = e.clientY;
        lastMoveTime = now;
      }

      function onPointerUp(e: PointerEvent) {
        activeTouches = activeTouches.filter(t => t.pointerId !== e.pointerId);
        if (activeTouches.length < 2) pinchDist0 = 0;
        if (!isDragging) return;
        isDragging = false;
        canvas.style.cursor = "grab";
        // Clamp momentum to a sane max
        const maxVel = 28;
        velX = Math.max(-maxVel, Math.min(maxVel, velX));
        velY = Math.max(-maxVel, Math.min(maxVel, velY));
      }

      // ── Scroll-wheel zoom ──────────────────────────────────────────────────
      function onWheel(e: WheelEvent) {
        e.preventDefault();
        const rect    = canvas.getBoundingClientRect();
        const pivotX  = e.clientX - rect.left;
        const pivotY  = e.clientY - rect.top;
        const factor  = e.deltaY < 0 ? 1.12 : 0.89;
        zoomAroundPivot(pivotX, pivotY, stage.scale.x * factor);
      }

      // ── Double-click to zoom in ────────────────────────────────────────────
      function onDblClick(e: MouseEvent) {
        const rect   = canvas.getBoundingClientRect();
        const pivotX = e.clientX - rect.left;
        const pivotY = e.clientY - rect.top;
        const next   = stage.scale.x > 1.4 ? 1.0 : stage.scale.x * 1.7;
        zoomAroundPivot(pivotX, pivotY, next);
      }

      canvas.addEventListener("pointerdown",  onPointerDown,  { passive: false });
      canvas.addEventListener("pointermove",  onPointerMove,  { passive: false });
      canvas.addEventListener("pointerup",    onPointerUp,    { passive: false });
      canvas.addEventListener("pointercancel",onPointerUp,    { passive: false });
      canvas.addEventListener("wheel",        onWheel,        { passive: false });
      canvas.addEventListener("dblclick",     onDblClick);
      canvas.style.cursor = "grab";

      // Return cleanup
      return () => {
        canvas.removeEventListener("pointerdown",  onPointerDown);
        canvas.removeEventListener("pointermove",  onPointerMove);
        canvas.removeEventListener("pointerup",    onPointerUp);
        canvas.removeEventListener("pointercancel",onPointerUp);
        canvas.removeEventListener("wheel",        onWheel);
        canvas.removeEventListener("dblclick",     onDblClick);
      };
    },
  };

  return controller;
}
