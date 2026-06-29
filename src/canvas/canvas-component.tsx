import {h} from 'preact';
import {useEffect, useRef, useState} from 'preact/hooks';
import {ViewportMath} from '../core/viewport-math';
import {toolsMap} from '../tools/tool-registry';
import {render, RenderState} from './renderer';
import {Entity, SnapResult} from '../core/types';
import {findEntityAt} from '../core/hit-test';
import {computeEventSnap} from './snap-helper';
import {useViewportInteraction} from './use-viewport-interaction';
import {useKeyboardShortcuts} from './use-keyboard-shortcuts';
import {
  projectSignal,
  layerMap,
  entityMap,
  visibleEntitiesSignal,
  entitiesByTypeSignal,
} from '../state/project-state';
import {
  activeToolNameSignal,
  snapEnabledSignal,
  gridEnabledSignal,
  showConstraintsSignal,
  gridSpacingSignal,
  previewEntitySignal,
  hoveredEntityIdSignal,
  renderDirtySignal,
  overlayPageIndexSignal,
  mouseCoordsSignal,
} from '../state/ui-state';
import {selectionSignal} from '../state/selection-state';
import {viewportSignal} from '../state/viewport-state';

/**
 * Main CAD canvas rendering component. Handles dimensions, render loops,
 * and mouse event dispatching.
 */
export function CanvasComponent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({width: 800, height: 600});

  // Viewport instance
  const viewportRef = useRef<ViewportMath>(viewportSignal.value);

  // Hook up hooks
  const {
    isPanningRef,
    lastMousePosRef,
    startPanning,
    updatePanning,
    stopPanning,
  } = useViewportInteraction(canvasRef, viewportRef);

  const activeTool = toolsMap[activeToolNameSignal.value];

  useKeyboardShortcuts(
    activeTool,
    () => {
      renderDirtySignal.value = true;
    },
    canvasRef,
    isPanningRef,
  );

  // Track window resizing
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width,
          height: rect.height,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial measurement

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update canvas sizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    canvas.style.width = `${dimensions.width}px`;
    canvas.style.height = `${dimensions.height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      renderDirtySignal.value = true;
    }
  }, [dimensions]);

  // Main drawing caller
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const project = projectSignal.value;
    const activePage = project.pages[project.activePageIndex];

    const currentMousePosScreen = lastMousePosRef.current;
    const currentMousePosWorld = viewportRef.current.screenToWorld(
      currentMousePosScreen,
    );

    const visibleEntities = visibleEntitiesSignal.value;

    const {activeSnap: snapRes} = computeEventSnap(
      currentMousePosWorld,
      viewportRef.current,
      visibleEntities,
      snapEnabledSignal.value,
      gridSpacingSignal.value,
      gridEnabledSignal.value,
      activeTool?.name,
      entityMap.value,
    );

    const overlayIdx = overlayPageIndexSignal.value;
    const overlayEntities =
      overlayIdx !== null && project.pages[overlayIdx]
        ? project.pages[overlayIdx].entities
        : undefined;

    const renderState: RenderState = {
      ctx,
      width: dimensions.width,
      height: dimensions.height,
      viewport: viewportRef.current,
      entitiesByType: entitiesByTypeSignal.value,
      entityMap: entityMap.value,
      constraints: activePage.constraints,
      layers: project.layers,
      layerMap: layerMap.value,
      selection: selectionSignal.value,
      snapResult: snapRes,
      gridEnabled: gridEnabledSignal.value,
      showConstraints: showConstraintsSignal.value,
      gridSpacing: gridSpacingSignal.value,
      unitSystem: project.unitSystem,
      previewEntity: previewEntitySignal.value,
      hoveredEntityId: hoveredEntityIdSignal.value,
      overlayEntities,
    };

    render(renderState);

    // Draw tool-specific preview/overlay graphics
    if (activeTool && activeTool.renderPreview) {
      ctx.save();
      ctx.translate(
        viewportRef.current.panOffset.x,
        viewportRef.current.panOffset.y,
      );
      ctx.scale(viewportRef.current.zoom, viewportRef.current.zoom);
      activeTool.renderPreview(
        ctx,
        viewportRef.current,
        snapRes ? snapRes.point : currentMousePosWorld,
      );
      ctx.restore();
    }
  };

  // scheduler loop using requestAnimationFrame
  useEffect(() => {
    let animFrameId: number;

    const renderLoop = () => {
      if (renderDirtySignal.value) {
        renderDirtySignal.value = false;
        draw();
      }
      animFrameId = requestAnimationFrame(renderLoop);
    };

    animFrameId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animFrameId);
  }, [dimensions]);

  // Re-draw dirty flag setter when dependencies change
  useEffect(() => {
    renderDirtySignal.value = true;
  }, [
    projectSignal.value,
    activeTool,
    selectionSignal.value,
    snapEnabledSignal.value,
    gridEnabledSignal.value,
    showConstraintsSignal.value,
    gridSpacingSignal.value,
    previewEntitySignal.value,
    hoveredEntityIdSignal.value,
  ]);

  // Hook up viewport ref to the signal so external code can view/set zoom
  useEffect(() => {
    viewportSignal.value = viewportRef.current;
  }, []);

  // Mouse handlers
  const handleMouseDown = (e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const screenPos = {x: e.clientX - rect.left, y: e.clientY - rect.top};

    if (startPanning(e, screenPos)) {
      return;
    }

    const worldPos = viewportRef.current.screenToWorld(screenPos);
    const visibleEntities = visibleEntitiesSignal.value;

    const {targetPos, activeSnap} = computeEventSnap(
      worldPos,
      viewportRef.current,
      visibleEntities,
      snapEnabledSignal.value,
      gridSpacingSignal.value,
      gridEnabledSignal.value,
      activeTool?.name,
      entityMap.value,
    );

    if (activeTool) {
      activeTool.onMouseDown(targetPos, e, activeSnap);
      renderDirtySignal.value = true;
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const screenPos = {x: e.clientX - rect.left, y: e.clientY - rect.top};
    const dx = screenPos.x - lastMousePosRef.current.x;
    const dy = screenPos.y - lastMousePosRef.current.y;

    if (updatePanning(dx, dy)) {
      return;
    }

    const worldPos = viewportRef.current.screenToWorld(screenPos);
    mouseCoordsSignal.value = worldPos;

    const visibleEntities = visibleEntitiesSignal.value;

    // Calculate hover entity for Select tool
    if (activeTool && activeTool.name === 'select') {
      const hoverRadiusWorld = 8 / viewportRef.current.zoom;
      hoveredEntityIdSignal.value =
        findEntityAt(
          worldPos,
          visibleEntities,
          hoverRadiusWorld,
          entityMap.value,
        )?.id ?? null;
    }

    const {targetPos, activeSnap} = computeEventSnap(
      worldPos,
      viewportRef.current,
      visibleEntities,
      snapEnabledSignal.value,
      gridSpacingSignal.value,
      gridEnabledSignal.value,
      activeTool?.name,
      entityMap.value,
    );

    if (activeTool) {
      activeTool.onMouseMove(targetPos, e, activeSnap);
      renderDirtySignal.value = true;
    }
  };

  const handleMouseUp = (e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (stopPanning()) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const screenPos = {x: e.clientX - rect.left, y: e.clientY - rect.top};
    const worldPos = viewportRef.current.screenToWorld(screenPos);
    const visibleEntities = visibleEntitiesSignal.value;

    const {targetPos, activeSnap} = computeEventSnap(
      worldPos,
      viewportRef.current,
      visibleEntities,
      snapEnabledSignal.value,
      gridSpacingSignal.value,
      gridEnabledSignal.value,
      activeTool?.name,
      entityMap.value,
    );

    if (activeTool) {
      activeTool.onMouseUp(targetPos, e, activeSnap);
      renderDirtySignal.value = true;
    }
  };

  return (
    <div
      ref={containerRef}
      className="canvas-container"
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{display: 'block'}}
      />
    </div>
  );
}
