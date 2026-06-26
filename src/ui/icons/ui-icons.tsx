import {h} from 'preact';

export const ZoomInIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    stroke="currentColor"
    stroke-width="2"
    fill="none"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

export const ZoomOutIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    stroke="currentColor"
    stroke-width="2"
    fill="none"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

export const FitScreenIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    stroke="currentColor"
    stroke-width="2"
    fill="none"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M15 3h6v6" />
    <path d="M9 21H3v-6" />
    <path d="M21 3l-7 7" />
    <path d="M3 21l7-7" />
  </svg>
);

export const ChevronDownIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="12"
    height="12"
    stroke="currentColor"
    stroke-width="2"
    fill="none"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export const ChevronRightIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="12"
    height="12"
    stroke="currentColor"
    stroke-width="2"
    fill="none"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export const PinIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="12"
    height="12"
    stroke="currentColor"
    stroke-width="2"
    fill="none"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <line x1="12" y1="17" x2="12" y2="22" />
    <path d="M5 17h14v-1.76a2 2 0 0 0-.44-1.24l-2.78-3.5A2 2 0 0 1 15 9.26V5a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4.26a2 2 0 0 1-.78 1.24l-2.78 3.5a2 2 0 0 0-.44 1.24Z" />
  </svg>
);

export const CloseIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="12"
    height="12"
    stroke="currentColor"
    stroke-width="2"
    fill="none"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const PanIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    stroke="currentColor"
    stroke-width="2"
    fill="none"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M10 2.5a2.5 2.5 0 0 1 5 0v6M15 5.5a2.5 2.5 0 0 1 5 0v7a8.5 8.5 0 0 1-17 0v-4a2.5 2.5 0 0 1 5 0v3" />
    <path d="M10 2.5v7" />
    <path d="M15 5.5v4" />
  </svg>
);
