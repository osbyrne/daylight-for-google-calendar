import { describe, expect, test } from 'bun:test';
import { dateFromKey } from '../utils/calendar.ts';
import { colorForAltitude, hourGradient } from '../utils/sun.ts';

describe('Calendar dates', () => {
  test.each([
    ['29026', 2026, 10, 2],
    ['29031', 2026, 10, 7],
    ['29087', 2026, 11, 31],
    ['29217', 2027, 0, 1],
    ['27741', 2024, 1, 29],
  ])('decodes date key %s without relying on translated labels', (key, year, month, day) => {
    const date = dateFromKey(key);
    expect(date).toEqual(new Date(year, month, day));
  });

  test.each(['', 'no date', '29031x', '1.5', '-1', '0', '28253', '28767', '9007199254740992'])(
    'rejects invalid date key %j',
    (key) => expect(dateFromKey(key)).toBeNull(),
  );
});

describe('daylight opacity', () => {
  test.each([0, 0.25, 0.5, 0.75, 1])('keeps every gradient stop at opacity %s', (opacity) => {
    const gradient = hourGradient(new Date(2026, 10, 7), 48.8566, 2.3522, opacity);
    const colors = [...gradient.matchAll(/rgba\(([^)]+)\)/g)];
    expect(colors).toHaveLength(48);
    for (const [, channels] of colors) {
      expect(Number(channels.split(',')[3])).toBe(opacity);
    }
  });

  test('defaults to fully opaque colors', () => {
    expect(colorForAltitude(-18)).toBe('rgba(81, 126, 193, 1)');
    expect(colorForAltitude(55)).toBe('rgba(255, 244, 196, 1)');
  });
});
