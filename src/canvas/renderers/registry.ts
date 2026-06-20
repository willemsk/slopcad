import {EntityType} from '../../core/types';
import {RenderFunction} from '../types';

import {renderWall} from './wall-renderer';
import {renderDoor} from './door-renderer';
import {renderWindow} from './window-renderer';
import {renderStairs} from './stairs-renderer';
import {renderLine} from './line-renderer';
import {renderRect} from './rect-renderer';
import {renderCircle} from './circle-renderer';
import {renderArc} from './arc-renderer';
import {renderDimension} from './dimension-renderer';
import {renderText} from './text-renderer';

export const RendererRegistry: Record<EntityType, RenderFunction<any>> = {
  wall: renderWall,
  door: renderDoor,
  window: renderWindow,
  stairs: renderStairs,
  line: renderLine,
  rect: renderRect,
  circle: renderCircle,
  arc: renderArc,
  dimension: renderDimension,
  text: renderText,
};
