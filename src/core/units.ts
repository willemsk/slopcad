import {UnitSystem} from './types';

// Convert meters to imperial representation (e.g., 5' 10 3/4")
export function formatImperial(meters: number): string {
  const totalInches = meters * 39.3700787;
  const feet = Math.floor(totalInches / 12);
  const inchesDecimal = totalInches - feet * 12;
  const wholeInches = Math.floor(inchesDecimal);
  const fractionDecimal = inchesDecimal - wholeInches;

  // Round to nearest 1/16 of an inch
  const sixteenths = Math.round(fractionDecimal * 16);

  if (sixteenths === 16) {
    const finalInches = wholeInches + 1;
    if (finalInches === 12) {
      return `${feet + 1}' 0"`;
    }
    return `${feet}' ${finalInches}"`;
  }

  if (sixteenths === 0) {
    if (wholeInches === 0 && feet > 0) {
      return `${feet}'`;
    }
    return `${feet}' ${wholeInches}"`;
  }

  // Simplify fraction
  let num = sixteenths;
  let den = 16;
  while (num % 2 === 0 && den % 2 === 0) {
    num /= 2;
    den /= 2;
  }

  const fractionStr = `${num}/${den}`;
  if (wholeInches === 0) {
    return `${feet}' ${fractionStr}"`;
  }
  return `${feet}' ${wholeInches} ${fractionStr}"`;
}

export function formatLength(
  meters: number,
  system: UnitSystem,
  precision = 2,
): string {
  if (system === 'imperial') {
    return formatImperial(meters);
  } else {
    // Metric
    if (meters < 1) {
      // Show in cm if less than 1m
      return `${Math.round(meters * 100)} cm`;
    }
    return `${meters.toFixed(precision)} m`;
  }
}

// Parses string input in metric (m, cm) or imperial (ft, in, fractions) and returns meters.
// Returns null if parsing fails.
export function parseLength(input: string, system: UnitSystem): number | null {
  const cleanStr = input.trim().toLowerCase();
  if (!cleanStr) return null;

  // 1. Imperial check or explicit imperial units
  const hasImperialSymbols =
    cleanStr.includes("'") ||
    cleanStr.includes('"') ||
    cleanStr.includes('ft') ||
    cleanStr.includes('in');

  if (system === 'imperial' || hasImperialSymbols) {
    return parseImperial(cleanStr);
  }

  // 2. Metric Parsing
  // Check for explicit 'cm'
  if (cleanStr.endsWith('cm')) {
    const val = parseFloat(cleanStr.replace('cm', '').trim());
    return isNaN(val) ? null : val / 100;
  }

  // Check for explicit 'm'
  if (cleanStr.endsWith('m') && !cleanStr.endsWith('cm')) {
    const val = parseFloat(cleanStr.replace('m', '').trim());
    return isNaN(val) ? null : val;
  }

  // Raw number (defaults to meters in metric)
  const val = parseFloat(cleanStr);
  return isNaN(val) ? null : val;
}

function parseImperial(str: string): number | null {
  // Matches expressions like:
  // 5' 10"
  // 5' 10 3/4"
  // 5ft 10in
  // 5'
  // 10"
  // 5-10
  // 5 10 3/4

  let feet = 0;
  let inches = 0;

  // Try parsing standard feet/inches regex
  // Case 1: feet marker ' or ft
  const feetMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:'|ft)/);
  if (feetMatch) {
    feet = parseFloat(feetMatch[1]);
  }

  // Case 2: inches marker " or in
  const inchesMatch = str.match(/(?:^|'|ft|\s)\s*(\d+(?:\.\d+)?)\s*(?:"|in)/);
  if (inchesMatch) {
    inches = parseFloat(inchesMatch[1]);
  }

  // Check for fractional inches, e.g., 3/4 or 1/2
  const fractionMatch = str.match(/(\d+)\/(\d+)/);
  if (fractionMatch) {
    const num = parseFloat(fractionMatch[1]);
    const den = parseFloat(fractionMatch[2]);
    if (den !== 0) {
      const fracVal = num / den;
      // If there was a whole number before the fraction, add it
      // e.g. "10 3/4" - search for a digit before the fraction that is not part of feet
      const wholeInchesMatch = str.match(/(\d+)\s+\d+\/\d+/);
      if (wholeInchesMatch) {
        // e.g. "10 3/4" => wholeInchesMatch[1] = "10"
        inches = parseFloat(wholeInchesMatch[1]) + fracVal;
      } else if (!inchesMatch) {
        // No explicit inch number match, just fraction
        inches += fracVal;
      }
    }
  }

  // Fallback for simple "5-10" or "5 10" format
  if (!feetMatch && !inchesMatch && !fractionMatch) {
    const parts = str.split(/[\s-]+/);
    if (parts.length === 2) {
      const f = parseFloat(parts[0]);
      const i = parseFloat(parts[1]);
      if (!isNaN(f) && !isNaN(i)) {
        feet = f;
        inches = i;
      }
    } else if (parts.length === 1) {
      const val = parseFloat(parts[0]);
      if (!isNaN(val)) {
        // Single number: if it's imperial system and no symbol, treat as feet?
        // Or if it contains decimals, treat as feet. Let's assume feet.
        feet = val;
      }
    }
  }

  const totalMeters = (feet * 12 + inches) * 0.0254;
  return isNaN(totalMeters) ? null : totalMeters;
}
