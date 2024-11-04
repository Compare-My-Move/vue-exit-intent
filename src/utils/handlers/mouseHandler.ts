import type { MouseHandler } from '@/types';

interface MousePosition {
  x: number | null;
  y: number | null;
}

interface Velocity {
  x: number;
  y: number;
}

interface Boundaries {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Creates an enhanced mouse listener that reliably detects when the user intends to leave the document
 * from any edge of the viewport. Will only trigger once unless explicitly reset.
 *
 * @param {Function} callback - The callback function to trigger when exit intent is detected
 * @param {Object} options - Configuration options
 * @param {number} options.sensitivity - Sensitivity for velocity detection (default: 8)
 * @param {number} options.threshold - Distance from edges to start monitoring (default: 50px)
 * @returns {MouseHandler} - An object containing functions to add and remove the mouse listener
 */
export function mouseHandler(
  callback: () => void,
  options = { sensitivity: 8, threshold: 50 }
): MouseHandler & { reset: () => void } {
  let mousePosition: MousePosition = { x: null, y: null };
  let lastX = 0;
  let lastY = 0;
  let velocity: Velocity = { x: 0, y: 0 };
  let velocityTimer: number | null = null;
  let mouseLeaveTimeout: number | null = null;
  let hasTriggered = false;

  let boundaries: Boundaries = {
    top: 0,
    right: window.innerWidth,
    bottom: window.innerHeight,
    left: 0
  };

  const updateBoundaries = () => {
    boundaries = {
      top: 0,
      right: window.innerWidth,
      bottom: window.innerHeight,
      left: 0
    };
  };

  const isNearEdge = (x: number, y: number): boolean => {
    return (
      y <= boundaries.top + options.threshold || // Top edge
      x >= boundaries.right - options.threshold || // Right edge
      y >= boundaries.bottom - options.threshold || // Bottom edge
      x <= boundaries.left + options.threshold // Left edge
    );
  };

  const isMovingTowardsEdge = (x: number, y: number): boolean => {
    if (y <= boundaries.top + options.threshold) {
      return velocity.y > options.sensitivity && velocity.x < velocity.y * 2;
    }
    if (x >= boundaries.right - options.threshold) {
      return velocity.x > options.sensitivity && velocity.y < velocity.x * 2;
    }
    if (y >= boundaries.bottom - options.threshold) {
      return velocity.y > options.sensitivity && velocity.x < velocity.y * 2;
    }
    if (x <= boundaries.left + options.threshold) {
      return velocity.x > options.sensitivity && velocity.y < velocity.x * 2;
    }
    return false;
  };

  const triggerCallback = () => {
    if (!hasTriggered) {
      hasTriggered = true;
      callback();
      removeMouseLeaveListeners(); // Automatically remove listeners after triggering
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (hasTriggered) return;

    mousePosition = { x: e.clientX, y: e.clientY };

    // Calculate velocity
    velocity = {
      x: Math.abs(e.clientX - lastX),
      y: Math.abs(e.clientY - lastY)
    };

    lastX = e.clientX;
    lastY = e.clientY;

    // Reset velocity after a short delay
    if (velocityTimer) window.clearTimeout(velocityTimer);
    velocityTimer = window.setTimeout(() => {
      velocity = { x: 0, y: 0 };
    }, 50);

    // Check for rapid movement near any edge
    if (isNearEdge(e.clientX, e.clientY) && isMovingTowardsEdge(e.clientX, e.clientY)) {
      triggerCallback();
    }
  };

  const handleMouseLeave = (e: MouseEvent) => {
    if (hasTriggered) return;

    // Ignore if the relatedTarget is within the document
    if (e.relatedTarget) return;

    // Check if mouse left from any edge
    if (isNearEdge(e.clientX, e.clientY)) {
      if (mouseLeaveTimeout) window.clearTimeout(mouseLeaveTimeout);

      mouseLeaveTimeout = window.setTimeout(() => {
        // Verify mouse is still outside using modern MouseEvent constructor
        const mouseEvent = new MouseEvent('mousemove', {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: 0,
          clientY: 0
        });

        document.dispatchEvent(mouseEvent);

        if (!mousePosition.x && !mousePosition.y) {
          triggerCallback();
        }
      }, 100);
    }
  };

  const handleVisibilityChange = () => {
    if (document.hidden && !hasTriggered) {
      triggerCallback();
    }
  };

  const handleResize = () => {
    updateBoundaries();
  };

  const addMouseListener = () => {
    updateBoundaries();
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('resize', handleResize);
  };

  const removeMouseLeaveListeners = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseleave', handleMouseLeave);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('resize', handleResize);

    if (velocityTimer) window.clearTimeout(velocityTimer);
    if (mouseLeaveTimeout) window.clearTimeout(mouseLeaveTimeout);
  };

  const reset = () => {
    hasTriggered = false;
    addMouseListener(); // Re-add listeners after reset
  };

  return {
    addMouseListener,
    removeMouseLeaveListeners,
    reset
  };
}