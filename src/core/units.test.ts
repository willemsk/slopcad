import {describe, it, expect} from 'vitest';
import {formatLength, parseLength} from './units';

describe('units utilities', () => {
  describe('formatLength', () => {
    it('formats metric correctly (meters)', () => {
      expect(formatLength(1.5, 'metric')).toBe('1.50 m');
      expect(formatLength(2.123, 'metric', 3)).toBe('2.123 m');
    });

    it('formats metric correctly (centimeters for < 1m)', () => {
      expect(formatLength(0.5, 'metric')).toBe('50 cm');
      expect(formatLength(0.01, 'metric')).toBe('1 cm');
    });

    it('formats imperial correctly (exact feet)', () => {
      // 10 feet = 3.048 meters
      expect(formatLength(3.048, 'imperial')).toBe('10\' 0"');
    });

    it('formats imperial correctly (feet and inches)', () => {
      // 5 feet 6 inches = 1.6764 meters
      expect(formatLength(1.6764, 'imperial')).toBe('5\' 6"');
    });

    it('formats imperial correctly (fractional inches)', () => {
      // 5 feet 6 1/2 inches = 1.6891 meters
      expect(formatLength(1.6891, 'imperial')).toBe('5\' 6 1/2"');
    });

    it('formats imperial correctly (inches only)', () => {
      // 10 inches = 0.254 meters
      expect(formatLength(0.254, 'imperial')).toBe('0\' 10"');
    });
  });

  describe('parseLength', () => {
    it('parses explicit metric values correctly', () => {
      expect(parseLength('1.5m', 'metric')).toBe(1.5);
      expect(parseLength('50cm', 'metric')).toBe(0.5);
    });

    it('parses implicit metric values correctly', () => {
      expect(parseLength('2.5', 'metric')).toBe(2.5);
    });

    it('parses explicit imperial values correctly', () => {
      // 10 feet
      expect(parseLength("10'", 'metric')).toBeCloseTo(3.048);
      // 5 feet 6 inches
      expect(parseLength('5\' 6"', 'metric')).toBeCloseTo(1.6764);
      // 10 inches
      expect(parseLength('10"', 'metric')).toBeCloseTo(0.254);
      // fractional inches
      expect(parseLength('5\' 6 1/2"', 'metric')).toBeCloseTo(1.6891);
      // ft / in labels
      expect(parseLength('5ft 6in', 'metric')).toBeCloseTo(1.6764);
    });

    it('parses implicit imperial values correctly when system is imperial', () => {
      expect(parseLength('10', 'imperial')).toBeCloseTo(0.254); // defaults to inches
      expect(parseLength('5-6', 'imperial')).toBeCloseTo(1.6764);
      expect(parseLength('5 6', 'imperial')).toBeCloseTo(1.6764);
    });

    it('returns null for invalid strings', () => {
      expect(parseLength('hello', 'metric')).toBeNull();
      expect(parseLength('', 'metric')).toBeNull();
    });
  });
});
