import {signal, effect} from '@preact/signals';
import {UnitSystem} from '../core/types';

// Load stored preferences
const storedTheme =
  (localStorage.getItem('arch-theme') as 'dark' | 'light') || 'dark';
const storedUnits =
  (localStorage.getItem('arch-units') as UnitSystem) || 'metric';
const storedSnap = localStorage.getItem('arch-snap') !== 'false'; // defaults to true
const storedGrid = localStorage.getItem('arch-grid') !== 'false'; // defaults to true

export const themeSignal = signal<'dark' | 'light'>(storedTheme);

// Sync changes to localStorage
effect(() => {
  localStorage.setItem('arch-theme', themeSignal.value);
  if (themeSignal.value === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
});

export function toggleTheme() {
  themeSignal.value = themeSignal.value === 'dark' ? 'light' : 'dark';
}
