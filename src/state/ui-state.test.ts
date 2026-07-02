// @vitest-environment jsdom
import {describe, it, expect, beforeEach} from 'vitest';
import {
  setUiScale,
  uiScaleSignal,
  pushCommandMessage,
  commandLineMessagesSignal,
  requestPrompt,
  activePromptSignal,
} from './ui-state';

describe('UI State', () => {
  beforeEach(() => {
    localStorage.clear();
    commandLineMessagesSignal.value = [];
    activePromptSignal.value = null;
  });

  it('sets UI scale and persists to localStorage', () => {
    setUiScale(1.5);
    expect(uiScaleSignal.value).toBe(1.5);
    expect(localStorage.getItem('uiScale')).toBe('1.5');
  });

  it('pushes command messages and limits to 20', () => {
    for (let i = 0; i < 25; i++) {
      pushCommandMessage(`Message ${i}`);
    }
    const msgs = commandLineMessagesSignal.value;
    expect(msgs.length).toBe(20);
    expect(msgs[msgs.length - 1]).toBe('Message 24');
    expect(msgs[0]).toBe('Message 5');
  });

  it('requests prompt and resolves when prompt is fulfilled', async () => {
    const promise = requestPrompt('Enter length:', '10');

    // The signal should be populated
    expect(activePromptSignal.value).not.toBeNull();
    expect(activePromptSignal.value?.message).toBe('Enter length:');
    expect(activePromptSignal.value?.initialValue).toBe('10');

    // Simulate user resolving the prompt
    activePromptSignal.value?.resolve('15');

    const result = await promise;
    expect(result).toBe('15');

    // The prompt should be cleared
    expect(activePromptSignal.value).toBeNull();
  });
});
