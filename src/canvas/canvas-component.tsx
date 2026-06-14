import {h} from 'preact';
import {useEffect, useRef, useState} from 'preact/hooks';
import {Viewport} from './viewport';
import {render, RenderState} from './renderer';
import {Entity, Vec2, SnapResult, PointRef} from '../core/types';
import {getSnapPoint, SnapSettings} from '../core/snap';
import {
  dist,
  distToSegment,
  normalize,
  sub,
  add,
  scale,
} from '../core/geometry';
import {Tool} from '../tools/tool';
import {
  projectSignal,
  activeToolSignal,
  selectionSignal,
  viewportSignal,
  snapEnabledSignal,
  gridEnabledSignal,
  showConstraintsSignal,
  gridSpacingSignal,
  previewEntitySignal,
  hoveredEntityIdSignal,
  triggerRenderSignal,
  undoAction,
  redoAction,
  deleteSelectedAction,
  overlayPageIndexSignal,
  mouseCoordsSignal,
  pushCommandMessage,
  isLayerModalOpenSignal,
} from '../state/app-state';

export function CanvasComponent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({width: 800, height: 600});

  // Viewport instance
  const viewportRef = useRef<Viewport>(new Viewport());

  // Mouse pan state
  const isPanningRef = useRef(false);
  const lastMousePosRef = useRef<Vec2>({x: 0, y: 0});

  // Snap Settings from signals
  const getSnapSettings = (): SnapSettings => ({
    grid: gridEnabledSignal.value,
    endpoints: true,
    midpoints: true,
    intersections: true,
    wallAlign: true,
  });

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

    // Support High-DPI screens
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    canvas.style.width = `${dimensions.width}px`;
    canvas.style.height = `${dimensions.height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      draw();
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

    // Compute snap result based on current mouse position (world space)
    const dpr = window.devicePixelRatio || 1;
    const currentMousePosScreen = lastMousePosRef.current;
    const currentMousePosWorld = viewportRef.current.screenToWorld(
      currentMousePosScreen,
    );

    const visibleEntities = activePage.entities.filter(ent => {
      const layer =
        project.layers.find(l => l.id === ent.layerId) || project.layers[0];
      return layer?.visible ?? true;
    });

    let snapRes: SnapResult | null = null;
    if (snapEnabledSignal.value && activeToolSignal.value) {
      // 10 pixels screen-space snap radius converted to world
      const snapRadiusWorld = 12 / viewportRef.current.zoom;
      snapRes = getSnapPoint(
        currentMousePosWorld,
        visibleEntities,
        gridSpacingSignal.value,
        getSnapSettings(),
        snapRadiusWorld,
        activeToolSignal.value.name,
      );
    }

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
      entities: visibleEntities,
      constraints: activePage.constraints,
      layers: project.layers,
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

    // Also draw tool-specific SVG/overlay graphics if any
    if (activeToolSignal.value && activeToolSignal.value.renderPreview) {
      ctx.save();
      ctx.translate(
        viewportRef.current.panOffset.x,
        viewportRef.current.panOffset.y,
      );
      ctx.scale(viewportRef.current.zoom, viewportRef.current.zoom);
      activeToolSignal.value.renderPreview(
        ctx,
        viewportRef.current,
        snapRes ? snapRes.point : currentMousePosWorld,
      );
      ctx.restore();
    }
  };

  // Re-draw when dependencies change
  useEffect(() => {
    draw();
  }, [
    projectSignal.value,
    activeToolSignal.value,
    selectionSignal.value,
    snapEnabledSignal.value,
    gridEnabledSignal.value,
    showConstraintsSignal.value,
    gridSpacingSignal.value,
    previewEntitySignal.value,
    hoveredEntityIdSignal.value,
    triggerRenderSignal.value,
    dimensions,
  ]);

  // Hook up viewport ref to the signal so external code can view or set zoom/pan
  useEffect(() => {
    viewportSignal.value = viewportRef.current;
  }, []);

  // Event handlers
  const handleMouseDown = (e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const screenPos = {x: e.clientX - rect.left, y: e.clientY - rect.top};
    lastMousePosRef.current = screenPos;

    // Middle button or Space+LeftClick pans
    const isSpacePressed = (window as any).isSpacePressed;
    if (e.button === 1 || (e.button === 0 && isSpacePressed)) {
      isPanningRef.current = true;
      canvas.style.cursor = 'grabbing';
      return;
    }

    const worldPos = viewportRef.current.screenToWorld(screenPos);

    // Apply Snapping
    let targetPos = worldPos;
    let activeSnap: SnapResult | null = null;
    if (snapEnabledSignal.value) {
      const project = projectSignal.value;
      const activePage = project.pages[project.activePageIndex];
      const visibleEntities = activePage.entities.filter(ent => {
        const layer =
          project.layers.find(l => l.id === ent.layerId) || project.layers[0];
        return layer?.visible ?? true;
      });
      const snapRadiusWorld = 12 / viewportRef.current.zoom;
      const snap = getSnapPoint(
        worldPos,
        visibleEntities,
        gridSpacingSignal.value,
        getSnapSettings(),
        snapRadiusWorld,
        activeToolSignal.value?.name,
      );
      targetPos = snap.point;
      if (
        snap.type !== 'grid' ||
        dist(worldPos, snap.point) < snapRadiusWorld
      ) {
        activeSnap = snap;
      }
    }

    if (activeToolSignal.value) {
      activeToolSignal.value.onMouseDown(targetPos, e, activeSnap);
      draw();
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const screenPos = {x: e.clientX - rect.left, y: e.clientY - rect.top};
    const dx = screenPos.x - lastMousePosRef.current.x;
    const dy = screenPos.y - lastMousePosRef.current.y;
    lastMousePosRef.current = screenPos;

    if (isPanningRef.current) {
      viewportRef.current.pan(dx, dy);
      triggerRenderSignal.value = {}; // force redraw
      return;
    }

    const worldPos = viewportRef.current.screenToWorld(screenPos);
    mouseCoordsSignal.value = worldPos;

    // Calculate hover entity for Select tool
    if (activeToolSignal.value && activeToolSignal.value.name === 'select') {
      const project = projectSignal.value;
      const activePage = project.pages[project.activePageIndex];
      const hoverRadiusWorld = 8 / viewportRef.current.zoom;

      const visibleEntities = activePage.entities.filter(ent => {
        const layer =
          project.layers.find(l => l.id === ent.layerId) || project.layers[0];
        return layer?.visible ?? true;
      });

      let hoverId: string | null = null;
      let minHoverDist = hoverRadiusWorld;

      for (const ent of visibleEntities) {
        if (
          ent.type === 'wall' ||
          ent.type === 'line' ||
          ent.type === 'stairs'
        ) {
          const d = distToSegment(
            worldPos,
            (ent as any).start,
            (ent as any).end,
          );
          if (d < minHoverDist) {
            minHoverDist = d;
            hoverId = ent.id;
          }
        } else if (ent.type === 'rect') {
          const r = ent;
          // Check hover near 4 segments of rectangle
          const d1 = distToSegment(worldPos, r.p1, {x: r.p2.x, y: r.p1.y});
          const d2 = distToSegment(worldPos, {x: r.p2.x, y: r.p1.y}, r.p2);
          const d3 = distToSegment(worldPos, r.p2, {x: r.p1.x, y: r.p2.y});
          const d4 = distToSegment(worldPos, {x: r.p1.x, y: r.p2.y}, r.p1);
          const d = Math.min(d1, d2, d3, d4);
          if (d < minHoverDist) {
            minHoverDist = d;
            hoverId = ent.id;
          }
        } else if (ent.type === 'circle') {
          const c = ent;
          const d = Math.abs(dist(worldPos, c.center) - c.radius);
          if (d < minHoverDist) {
            minHoverDist = d;
            hoverId = ent.id;
          }
        } else if (ent.type === 'arc') {
          const a = ent;
          const d = Math.abs(dist(worldPos, a.center) - a.radius);
          if (d < minHoverDist) {
            minHoverDist = d;
            hoverId = ent.id;
          }
        } else if (ent.type === 'dimension') {
          // Hover near the measured line
          const u = normalize(sub((ent as any).p2, (ent as any).p1));
          const n = {x: -u.y, y: u.x};
          const offset = (ent as any).offset;
          const d1 = add((ent as any).p1, scale(n, offset));
          const d2 = add((ent as any).p2, scale(n, offset));
          const d = distToSegment(worldPos, d1, d2);
          if (d < minHoverDist) {
            minHoverDist = d;
            hoverId = ent.id;
          }
        } else if (ent.type === 'text') {
          // check if close to insertion position
          const d = dist(worldPos, ent.position);
          if (d < minHoverDist) {
            minHoverDist = d;
            hoverId = ent.id;
          }
        }
      }

      hoveredEntityIdSignal.value = hoverId;
    }

    // Apply Snapping
    let targetPos = worldPos;
    let activeSnap: SnapResult | null = null;
    if (snapEnabledSignal.value) {
      const project = projectSignal.value;
      const activePage = project.pages[project.activePageIndex];
      const visibleEntities = activePage.entities.filter(ent => {
        const layer =
          project.layers.find(l => l.id === ent.layerId) || project.layers[0];
        return layer?.visible ?? true;
      });
      const snapRadiusWorld = 12 / viewportRef.current.zoom;
      const snap = getSnapPoint(
        worldPos,
        visibleEntities,
        gridSpacingSignal.value,
        getSnapSettings(),
        snapRadiusWorld,
        activeToolSignal.value?.name,
      );
      targetPos = snap.point;
      if (
        snap.type !== 'grid' ||
        dist(worldPos, snap.point) < snapRadiusWorld
      ) {
        activeSnap = snap;
      }
    }

    if (activeToolSignal.value) {
      activeToolSignal.value.onMouseMove(targetPos, e, activeSnap);
      draw();
    }
  };

  const handleMouseUp = (e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isPanningRef.current) {
      isPanningRef.current = false;
      const isSpacePressed = (window as any).isSpacePressed;
      canvas.style.cursor = isSpacePressed ? 'grab' : 'default';
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const screenPos = {x: e.clientX - rect.left, y: e.clientY - rect.top};
    const worldPos = viewportRef.current.screenToWorld(screenPos);

    // Apply Snapping
    let targetPos = worldPos;
    let activeSnap: SnapResult | null = null;
    if (snapEnabledSignal.value) {
      const project = projectSignal.value;
      const activePage = project.pages[project.activePageIndex];
      const visibleEntities = activePage.entities.filter(ent => {
        const layer =
          project.layers.find(l => l.id === ent.layerId) || project.layers[0];
        return layer?.visible ?? true;
      });
      const snapRadiusWorld = 12 / viewportRef.current.zoom;
      const snap = getSnapPoint(
        worldPos,
        visibleEntities,
        gridSpacingSignal.value,
        getSnapSettings(),
        snapRadiusWorld,
        activeToolSignal.value?.name,
      );
      targetPos = snap.point;
      if (
        snap.type !== 'grid' ||
        dist(worldPos, snap.point) < snapRadiusWorld
      ) {
        activeSnap = snap;
      }
    }

    if (activeToolSignal.value) {
      activeToolSignal.value.onMouseUp(targetPos, e, activeSnap);
      draw();
    }
  };

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const screenPos = {x: e.clientX - rect.left, y: e.clientY - rect.top};

    const zoomFactor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
    viewportRef.current.zoomAt(screenPos, zoomFactor);

    // Trigger render update
    triggerRenderSignal.value = {};
  };

  // Keyboard events listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is editing text inputs or typing text
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.getAttribute('contenteditable') === 'true' ||
        isLayerModalOpenSignal.value
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        (window as any).isSpacePressed = true;
        if (canvasRef.current && !isPanningRef.current) {
          canvasRef.current.style.cursor = 'grab';
        }
      }

      // Undo: Ctrl+Z
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undoAction();
        pushCommandMessage('Command: UNDO - Reverted last drawing operation.');
      }

      // Redo: Ctrl+Y
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redoAction();
        pushCommandMessage('Command: REDO - Redoing last drawing operation.');
      }

      // Delete key deletes selection
      if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelectedAction();
        pushCommandMessage(
          'Command: ERASE - Deleted selected drawing elements.',
        );
      }

      // Escape cancels current tool operations or sets active tool to select
      if (e.key === 'Escape') {
        pushCommandMessage('Command: *Cancel*');
        if (activeToolSignal.value) {
          activeToolSignal.value.deactivate();
          activeToolSignal.value.activate(); // re-init active tool (resets substate)
          previewEntitySignal.value = null;
          triggerRenderSignal.value = {};
        }
      }

      // Route to active tool
      if (activeToolSignal.value && activeToolSignal.value.onKeyDown) {
        activeToolSignal.value.onKeyDown(e);
        draw();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        (window as any).isSpacePressed = false;
        if (canvasRef.current) {
          canvasRef.current.style.cursor = 'default';
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

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
        onWheel={handleWheel}
        style={{display: 'block'}}
      />
    </div>
  );
}
