import {signal} from '@preact/signals';
import type {Entity, Vec2} from '../core/types';

export const activeToolNameSignal = signal<string>('select');
export const snapEnabledSignal = signal<boolean>(true);
export const gridEnabledSignal = signal<boolean>(true);
export const showConstraintsSignal = signal<boolean>(true);
export const gridSpacingSignal = signal<number>(0.5); // 0.5 meters default grid spacing
export const previewEntitySignal = signal<Entity | null>(null);
export const hoveredEntityIdSignal = signal<string | null>(null);
export const renderDirtySignal = signal<boolean>(true);
export const triggerRenderSignal = {
  get value() {
    return renderDirtySignal.value;
  },
  set value(v: unknown) {
    renderDirtySignal.value = true;
  },
};
export const overlayPageIndexSignal = signal<number | null>(null);
export const mouseCoordsSignal = signal<Vec2>({x: 0, y: 0});

export interface UIPrompt {
  message: string;
  initialValue: string;
  position?: Vec2;
  resolve: (value: string | null) => void;
}
export const activePromptSignal = signal<UIPrompt | null>(null);

export function requestPrompt(
  message: string,
  initialValue: string,
  position?: Vec2,
): Promise<string | null> {
  return new Promise((resolve) => {
    activePromptSignal.value = {
      message,
      initialValue,
      position,
      resolve: (val) => {
        activePromptSignal.value = null;
        resolve(val);
      },
    };
  });
}

export const commandLineMessagesSignal = signal<string[]>([
  'SlopCAD Initialized.',
  'Select a tool from the ribbon or double-click to select entities.',
]);

export const isPropertiesPanelOpenSignal = signal<boolean>(true);
export const isRibbonCollapsedSignal = signal<boolean>(false);
export const isLayerModalOpenSignal = signal<boolean>(false);

export const uiScaleSignal = signal<number>(
  Number.parseFloat(localStorage.getItem('uiScale') || '1'),
);

export function setUiScale(scale: number) {
  uiScaleSignal.value = scale;
  localStorage.setItem('uiScale', scale.toString());
}

export function pushCommandMessage(msg: string) {
  commandLineMessagesSignal.value = [
    ...commandLineMessagesSignal.value.slice(-19),
    msg,
  ];
}
