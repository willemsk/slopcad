// @vitest-environment jsdom
import {beforeEach, describe, expect, it} from 'vitest';
import {themeSignal, toggleTheme} from './preferences';

describe('Preferences State', () => {
  beforeEach(() => {
    // Reset to dark
    themeSignal.value = 'dark';
  });

  it('toggles theme correctly', () => {
    expect(themeSignal.value).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    toggleTheme();
    expect(themeSignal.value).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('arch-theme')).toBe('light');

    toggleTheme();
    expect(themeSignal.value).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('arch-theme')).toBe('dark');
  });
});
