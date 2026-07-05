import {signal} from '@preact/signals';
import {ViewportMath} from '../core/viewport-math';

export const viewportSignal = signal<ViewportMath>(new ViewportMath());
