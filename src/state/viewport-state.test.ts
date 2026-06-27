import {describe, it, expect} from 'vitest';
import {viewportSignal} from './viewport-state';
import {ViewportMath} from '../core/viewport-math';

describe('Viewport State', () => {
  it('initializes viewportSignal with a ViewportMath instance', () => {
    expect(viewportSignal.value).toBeInstanceOf(ViewportMath);
  });

  it('allows updating the viewportSignal value', () => {
    const newViewport = new ViewportMath();
    viewportSignal.value = newViewport;
    expect(viewportSignal.value).toBe(newViewport);
  });
});
