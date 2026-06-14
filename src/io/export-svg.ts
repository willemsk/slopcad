import {
  Entity,
  Page,
  WallEntity,
  DoorEntity,
  WindowEntity,
  StairsEntity,
  UnitSystem,
  LineEntity,
  RectEntity,
  CircleEntity,
  ArcEntity,
  DimensionEntity,
  TextEntity,
} from '../core/types';
import {
  dist,
  sub,
  add,
  scale,
  normalize,
  rotate,
  lerp,
  angle,
} from '../core/geometry';
import {formatLength} from '../core/units';

export function exportPageToSVG(page: Page, unitSystem: UnitSystem): string {
  // 1. Calculate bounding box of entities to set SVG viewBox
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const expandBBox = (pt: {x: number; y: number}) => {
    minX = Math.min(minX, pt.x);
    minY = Math.min(minY, pt.y);
    maxX = Math.max(maxX, pt.x);
    maxY = Math.max(maxY, pt.y);
  };

  for (const ent of page.entities) {
    if (ent.type === 'wall' || ent.type === 'line' || ent.type === 'stairs') {
      const e = ent as any;
      expandBBox(e.start);
      expandBBox(e.end);
    } else if (ent.type === 'rect') {
      const r = ent;
      expandBBox(r.p1);
      expandBBox(r.p2);
    } else if (ent.type === 'circle') {
      const c = ent;
      expandBBox({x: c.center.x - c.radius, y: c.center.y - c.radius});
      expandBBox({x: c.center.x + c.radius, y: c.center.y + c.radius});
    } else if (ent.type === 'arc') {
      const a = ent;
      expandBBox({x: a.center.x - a.radius, y: a.center.y - a.radius});
      expandBBox({x: a.center.x + a.radius, y: a.center.y + a.radius});
    } else if (ent.type === 'dimension') {
      const d = ent;
      expandBBox(d.p1);
      expandBBox(d.p2);
    } else if (ent.type === 'text') {
      const t = ent;
      expandBBox(t.position);
    }
  }

  // If empty, default viewBox
  if (minX === Infinity) {
    minX = 0;
    minY = 0;
    maxX = 10;
    maxY = 10;
  }

  // Add padding around viewBox (e.g., 1 meter)
  const padding = 1.0;
  minX -= padding;
  minY -= padding;
  maxX += padding;
  maxY += padding;

  const width = maxX - minX;
  const height = maxY - minY;

  // 2. Build SVG elements
  const elements: string[] = [];

  // Add SVG background matching app canvas theme
  elements.push(
    `<rect x="${minX}" y="${minY}" width="${width}" height="${height}" fill="#1e2028" />`,
  );

  // Draw walls first
  for (const ent of page.entities) {
    if (ent.type === 'wall') {
      const w = ent as WallEntity;
      const d = dist(w.start, w.end);
      if (d === 0) continue;
      const u = normalize(sub(w.end, w.start));
      const n = {x: -u.y, y: u.x};
      const halfThickness = w.thickness / 2;

      const c1 = add(w.start, scale(n, halfThickness));
      const c2 = add(w.end, scale(n, halfThickness));
      const c3 = sub(w.end, scale(n, halfThickness));
      const c4 = sub(w.start, scale(n, halfThickness));

      elements.push(
        `  <polygon points="${c1.x},${c1.y} ${c2.x},${c2.y} ${c3.x},${c3.y} ${c4.x},${c4.y}" fill="rgba(200, 202, 212, 0.15)" stroke="#c8cad4" stroke-width="0.02" />`,
      );
    }
  }

  // Draw doors & windows (with background masks)
  for (const ent of page.entities) {
    if (ent.type === 'door') {
      const door = ent as DoorEntity;
      const wall = page.entities.find(e => e.id === door.wallId) as WallEntity;
      if (!wall) continue;

      const u = normalize(sub(wall.end, wall.start));
      const n = {x: -u.y, y: u.x};
      const c = lerp(wall.start, wall.end, door.position);
      const w = door.width;

      const d1 = sub(c, scale(u, w / 2));
      const d2 = add(c, scale(u, w / 2));

      // Draw mask
      const halfThick = wall.thickness / 2 + 0.02;
      const m1 = add(d1, scale(n, halfThick));
      const m2 = add(d2, scale(n, halfThick));
      const m3 = sub(d2, scale(n, halfThick));
      const m4 = sub(d1, scale(n, halfThick));

      elements.push(
        `  <polygon points="${m1.x},${m1.y} ${m2.x},${m2.y} ${m3.x},${m3.y} ${m4.x},${m4.y}" fill="#1e2028" />`,
      );

      // Draw wall cuts
      elements.push(
        `  <line x1="${m1.x}" y1="${m1.y}" x2="${m4.x}" y2="${m4.y}" stroke="#c8cad4" stroke-width="0.015" />`,
        `  <line x1="${m2.x}" y1="${m2.y}" x2="${m3.x}" y2="${m3.y}" stroke="#c8cad4" stroke-width="0.015" />`,
      );

      // Swing leaf & arc
      const hinge = door.flipX ? d2 : d1;
      const latch = door.flipX ? d1 : d2;
      const swingDir = door.flipY ? 1 : -1;
      const hingeToLatch = sub(latch, hinge);
      const hingeSign = door.flipX ? -1 : 1;
      const openAngleDeg = door.openingAngle ?? 90;
      const openAngleRad =
        swingDir * hingeSign * ((openAngleDeg * Math.PI) / 180);
      const leafVector = rotate(hingeToLatch, openAngleRad);
      const leafEnd = add(hinge, leafVector);

      // Leaf line
      elements.push(
        `  <line x1="${hinge.x}" y1="${hinge.y}" x2="${leafEnd.x}" y2="${leafEnd.y}" stroke="#cbd5e1" stroke-width="0.02" />`,
      );

      // Arc
      const startAng = angle(hingeToLatch);
      const endAng = angle(leafVector);
      const radius = w;
      const counterClockwise = swingDir * hingeSign < 0;
      const sweepFlag = counterClockwise ? 0 : 1;

      elements.push(
        `  <path d="M ${latch.x} ${latch.y} A ${radius} ${radius} 0 0 ${sweepFlag} ${leafEnd.x} ${leafEnd.y}" fill="none" stroke="rgba(148, 163, 184, 0.4)" stroke-width="0.01" stroke-dasharray="0.05,0.05" />`,
      );
    } else if (ent.type === 'window') {
      const wind = ent as WindowEntity;
      const wall = page.entities.find(e => e.id === wind.wallId) as WallEntity;
      if (!wall) continue;

      const u = normalize(sub(wall.end, wall.start));
      const n = {x: -u.y, y: u.x};
      const c = lerp(wall.start, wall.end, wind.position);
      const w = wind.width;

      const w1 = sub(c, scale(u, w / 2));
      const w2 = add(c, scale(u, w / 2));

      const halfThick = wall.thickness / 2 + 0.01;
      const m1 = add(w1, scale(n, halfThick));
      const m2 = add(w2, scale(n, halfThick));
      const m3 = sub(w2, scale(n, halfThick));
      const m4 = sub(w1, scale(n, halfThick));

      // Mask
      elements.push(
        `  <polygon points="${m1.x},${m1.y} ${m2.x},${m2.y} ${m3.x},${m3.y} ${m4.x},${m4.y}" fill="#1e2028" />`,
      );

      // Outlines
      elements.push(
        `  <line x1="${m1.x}" y1="${m1.y}" x2="${m4.x}" y2="${m4.y}" stroke="#94a3b8" stroke-width="0.015" />`,
        `  <line x1="${m2.x}" y1="${m2.y}" x2="${m3.x}" y2="${m3.y}" stroke="#94a3b8" stroke-width="0.015" />`,
      );

      // Glass lines
      const innerLine1Start = add(w1, scale(n, wall.thickness / 4));
      const innerLine1End = add(w2, scale(n, wall.thickness / 4));
      const innerLine2Start = sub(w1, scale(n, wall.thickness / 4));
      const innerLine2End = sub(w2, scale(n, wall.thickness / 4));

      elements.push(
        `  <line x1="${w1.x}" y1="${w1.y}" x2="${w2.x}" y2="${w2.y}" stroke="#94a3b8" stroke-width="0.015" />`,
        `  <line x1="${innerLine1Start.x}" y1="${innerLine1Start.y}" x2="${innerLine1End.x}" y2="${innerLine1End.y}" stroke="#94a3b8" stroke-width="0.015" />`,
        `  <line x1="${innerLine2Start.x}" y1="${innerLine2Start.y}" x2="${innerLine2End.x}" y2="${innerLine2End.y}" stroke="#94a3b8" stroke-width="0.015" />`,
      );
    }
  }

  // Draw stairs, shapes, dimensions, text
  for (const ent of page.entities) {
    if (ent.type === 'stairs') {
      const st = ent as StairsEntity;
      const {start, end, width, treadCount, direction} = st;
      const u = normalize(sub(end, start));
      const n = {x: -u.y, y: u.x};
      const halfWidth = width / 2;

      const s1 = add(start, scale(n, halfWidth));
      const s2 = add(end, scale(n, halfWidth));
      const s3 = sub(end, scale(n, halfWidth));
      const s4 = sub(start, scale(n, halfWidth));

      // Outline
      elements.push(
        `  <polygon points="${s1.x},${s1.y} ${s2.x},${s2.y} ${s3.x},${s3.y} ${s4.x},${s4.y}" fill="none" stroke="#94a3b8" stroke-width="0.02" />`,
      );

      // Treads
      for (let i = 1; i < treadCount; i++) {
        const t = i / treadCount;
        const pt = lerp(start, end, t);
        const pLeft = add(pt, scale(n, halfWidth));
        const pRight = sub(pt, scale(n, halfWidth));
        elements.push(
          `  <line x1="${pLeft.x}" y1="${pLeft.y}" x2="${pRight.x}" y2="${pRight.y}" stroke="rgba(148, 163, 184, 0.6)" stroke-width="0.01" />`,
        );
      }

      // Direction line
      const arrowEnd = sub(end, scale(u, 0.15));
      elements.push(
        `  <circle cx="${start.x}" cy="${start.y}" r="0.04" fill="#38bdf8" />`,
        `  <line x1="${start.x}" y1="${start.y}" x2="${arrowEnd.x}" y2="${arrowEnd.y}" stroke="#38bdf8" stroke-width="0.015" />`,
      );

      // Arrow head
      const arrowLength = 0.12;
      const aLeft = add(arrowEnd, rotate(scale(u, -arrowLength), Math.PI / 6));
      const aRight = add(
        arrowEnd,
        rotate(scale(u, -arrowLength), -Math.PI / 6),
      );
      elements.push(
        `  <polygon points="${end.x},${end.y} ${aLeft.x},${aLeft.y} ${aRight.x},${aRight.y}" fill="#38bdf8" />`,
      );

      // UP/DN Text
      const center = lerp(start, end, 0.5);
      const textX = center.x + n.x * 0.3;
      const textY = center.y + n.y * 0.3;
      const angRad = angle(u);
      const textAngleDeg =
        angRad > Math.PI / 2 || angRad < -Math.PI / 2
          ? (angRad + Math.PI) * (180 / Math.PI)
          : angRad * (180 / Math.PI);

      elements.push(
        `  <text x="${textX}" y="${textY}" font-family="Inter, sans-serif" font-weight="bold" font-size="0.18" fill="#e2e8f0" text-anchor="middle" dominant-baseline="middle" transform="rotate(${textAngleDeg}, ${textX}, ${textY})">${direction.toUpperCase()}</text>`,
      );
    } else if (ent.type === 'line') {
      const l = ent as LineEntity;
      elements.push(
        `  <line x1="${l.start.x}" y1="${l.start.y}" x2="${l.end.x}" y2="${l.end.y}" stroke="#e2e8f0" stroke-width="0.02" />`,
      );
    } else if (ent.type === 'rect') {
      const r = ent as RectEntity;
      const rx = Math.min(r.p1.x, r.p2.x);
      const ry = Math.min(r.p1.y, r.p2.y);
      const rw = Math.abs(r.p2.x - r.p1.x);
      const rh = Math.abs(r.p2.y - r.p1.y);
      elements.push(
        `  <rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" fill="none" stroke="#e2e8f0" stroke-width="0.02" />`,
      );
    } else if (ent.type === 'circle') {
      const c = ent as CircleEntity;
      elements.push(
        `  <circle cx="${c.center.x}" cy="${c.center.y}" r="${c.radius}" fill="none" stroke="#e2e8f0" stroke-width="0.02" />`,
      );
    } else if (ent.type === 'arc') {
      const a = ent as ArcEntity;
      const startX = a.center.x + a.radius * Math.cos(a.startAngle);
      const startY = a.center.y + a.radius * Math.sin(a.startAngle);
      const endX = a.center.x + a.radius * Math.cos(a.endAngle);
      const endY = a.center.y + a.radius * Math.sin(a.endAngle);
      const largeArc = Math.abs(a.endAngle - a.startAngle) > Math.PI ? 1 : 0;
      const sweep = a.endAngle > a.startAngle ? 1 : 0;

      elements.push(
        `  <path d="M ${startX} ${startY} A ${a.radius} ${a.radius} 0 ${largeArc} ${sweep} ${endX} ${endY}" fill="none" stroke="#e2e8f0" stroke-width="0.02" />`,
      );
    } else if (ent.type === 'dimension') {
      const dEnt = ent as DimensionEntity;
      const u = normalize(sub(dEnt.p2, dEnt.p1));
      const n = {x: -u.y, y: u.x};
      const d1 = add(dEnt.p1, scale(n, dEnt.offset));
      const d2 = add(dEnt.p2, scale(n, dEnt.offset));

      // Extension lines
      const extGap = scale(n, Math.sign(dEnt.offset) * 0.05);
      const extPast = scale(n, Math.sign(dEnt.offset) * 0.08);

      elements.push(
        `  <line x1="${dEnt.p1.x + extGap.x}" y1="${dEnt.p1.y + extGap.y}" x2="${d1.x + extPast.x}" y2="${d1.y + extPast.y}" stroke="#60a5fa" stroke-width="0.012" />`,
        `  <line x1="${dEnt.p2.x + extGap.x}" y1="${dEnt.p2.y + extGap.y}" x2="${d2.x + extPast.x}" y2="${d2.y + extPast.y}" stroke="#60a5fa" stroke-width="0.012" />`,
      );

      // Dimension line
      elements.push(
        `  <line x1="${d1.x}" y1="${d1.y}" x2="${d2.x}" y2="${d2.y}" stroke="#60a5fa" stroke-width="0.012" />`,
      );

      // Ticks (45 slashes)
      const slash = normalize({x: u.x + n.x, y: u.y + n.y});
      elements.push(
        `  <line x1="${d1.x - slash.x * 0.08}" y1="${d1.y - slash.y * 0.08}" x2="${d1.x + slash.x * 0.08}" y2="${d1.y + slash.y * 0.08}" stroke="#60a5fa" stroke-width="0.02" />`,
        `  <line x1="${d2.x - slash.x * 0.08}" y1="${d2.y - slash.y * 0.08}" x2="${d2.x + slash.x * 0.08}" y2="${d2.y + slash.y * 0.08}" stroke="#60a5fa" stroke-width="0.02" />`,
      );

      // Dimension Text
      const d = dist(dEnt.p1, dEnt.p2);
      const lengthVal =
        dEnt.valueOverride !== undefined ? dEnt.valueOverride : d;
      const textVal = dEnt.label || formatLength(lengthVal, unitSystem, 2);

      const center = lerp(d1, d2, 0.5);
      const angRad = angle(u);
      const textAngleDeg =
        angRad > Math.PI / 2 || angRad < -Math.PI / 2
          ? (angRad + Math.PI) * (180 / Math.PI)
          : angRad * (180 / Math.PI);

      // For SVG we can mask with a background box behind text or just text outline
      elements.push(
        `  <g transform="translate(${center.x}, ${center.y}) rotate(${textAngleDeg})">`,
        '    <rect x="-0.4" y="-0.08" width="0.8" height="0.16" fill="#1e2028" />', // simple mask box
        `    <text x="0" y="0" font-family="Inter, sans-serif" font-weight="bold" font-size="0.18" fill="#60a5fa" text-anchor="middle" dominant-baseline="middle">${textVal}</text>`,
        '  </g>',
      );
    } else if (ent.type === 'text') {
      const t = ent as TextEntity;
      // Note: SVG y coordinates are standard, text baseline can be adjusted
      elements.push(
        `  <text x="${t.position.x}" y="${t.position.y}" font-family="Inter, sans-serif" font-size="${t.fontSize}" fill="#f8fafc" dominant-baseline="text-before-edge">${t.text}</text>`,
      );
    }
  }

  // Combine and output SVG
  return [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<!-- Generated by 2D Architectural Plan Editor -->',
    `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${width} ${height}" width="100%" height="100%">`,
    ...elements,
    '</svg>',
  ].join('\n');
}

export function downloadSVGFile(page: Page, unitSystem: UnitSystem) {
  const svgStr = exportPageToSVG(page, unitSystem);
  const blob = new Blob([svgStr], {type: 'image/svg+xml'});
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  const filename =
    page.name.trim().toLowerCase().replace(/\s+/g, '_') || 'floor_plan';
  a.href = url;
  a.download = `${filename}.svg`;
  a.click();

  setTimeout(() => URL.revokeObjectURL(url), 100);
}
