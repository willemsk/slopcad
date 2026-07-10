import type {RefObject} from 'preact';
import {useEffect, useRef} from 'preact/hooks';
import type {Vec2} from '../core/types';
import type {ViewportMath} from '../core/viewport-math';
import {triggerRenderSignal} from '../state/ui-state';

/**
 * Hook to manage viewport panning and zooming via mouse, wheel, and spacebar gestures.
 */
export function useViewportInteraction(
  canvasRef: RefObject<HTMLCanvasElement>,
  viewportRef: RefObject<ViewportMath>,
) {
  const isPanningRef = useRef(false);
  const lastMousePosRef = useRef<Vec2>({x: 0, y: 0});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      if (!viewportRef.current) return;
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const screenPos = {x: e.clientX - rect.left, y: e.clientY - rect.top};
      const zoomFactor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      viewportRef.current.zoomAt(screenPos, zoomFactor);
      triggerRenderSignal.value = {};
    };

    canvas.addEventListener('wheel', handleWheel, {passive: false});
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [canvasRef, viewportRef]);

  const startPanning = (e: MouseEvent, screenPos: Vec2): boolean => {
    const canvas = canvasRef.current;
    if (!canvas) return false;

    lastMousePosRef.current = screenPos;
    // Middle button or Space+LeftClick pans

    const isSpacePressed = window.isSpacePressed;
    if (e.button === 1 || (e.button === 0 && isSpacePressed)) {
      isPanningRef.current = true;
      canvas.style.cursor = 'grabbing';
      return true;
    }
    return false;
  };

  const updatePanning = (dx: number, dy: number): boolean => {
    if (isPanningRef.current && viewportRef.current) {
      viewportRef.current.pan(dx, dy);
      triggerRenderSignal.value = {};
      return true;
    }
    return false;
  };

  const stopPanning = (): boolean => {
    const canvas = canvasRef.current;
    if (!canvas) return false;

    if (isPanningRef.current) {
      isPanningRef.current = false;

      const isSpacePressed = window.isSpacePressed;
      canvas.style.cursor = isSpacePressed ? 'grab' : 'default';
      return true;
    }
    return false;
  };

  return {
    isPanningRef,
    lastMousePosRef,
    startPanning,
    updatePanning,
    stopPanning,
  };
}
