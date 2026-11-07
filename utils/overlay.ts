import type { CalendarGrid } from '@/utils/calendar';
import { hourGradient } from '@/utils/sun';

export type GridTarget = CalendarGrid & {
  lat: number;
  lng: number;
  opacity: number;
};

const BACKGROUND_PROPERTIES = [
  'background-image',
  'background-position',
  'background-size',
  'background-repeat',
] as const;

type BackgroundProperty = (typeof BACKGROUND_PROPERTIES)[number];
type SavedProperty = { property: BackgroundProperty; value: string; priority: string };

let active: {
  row: HTMLElement;
  original: SavedProperty[];
  background: { image: string; position: string; size: string; repeat: string };
  applied: Map<BackgroundProperty, string>;
} | undefined;

export function removeOverlay() {
  if (!active) return;
  const { row, original, applied } = active;
  for (const { property, value, priority } of original) {
    if (row.style.getPropertyValue(property) !== applied.get(property)) continue;
    if (value) row.style.setProperty(property, value, priority);
    else row.style.removeProperty(property);
  }
  active = undefined;
}

export function paintOverlay(target: GridTarget) {
  const { row, columns, lat, lng, opacity } = target;
  if (active?.row !== row) {
    removeOverlay();
    const style = getComputedStyle(row);
    active = {
      row,
      original: BACKGROUND_PROPERTIES.map((property) => ({
        property,
        value: row.style.getPropertyValue(property),
        priority: row.style.getPropertyPriority(property),
      })),
      background: {
        image: style.backgroundImage,
        position: style.backgroundPosition,
        size: style.backgroundSize,
        repeat: style.backgroundRepeat,
      },
      applied: new Map(),
    };
  }
  const current = active;

  const bounds = row.getBoundingClientRect();
  const images: string[] = [];
  const positions: string[] = [];
  const sizes: string[] = [];
  const repeats: string[] = [];
  for (const { element, date } of columns) {
    const box = element.getBoundingClientRect();
    images.push(hourGradient(date, lat, lng, opacity));
    positions.push(`${box.left - bounds.left}px ${box.top - bounds.top}px`);
    sizes.push(`${box.width}px ${box.height}px`);
    repeats.push('no-repeat');
  }

  // Calendar's own background decoration stays above the daylight backgrounds.
  if (current.background.image !== 'none') {
    images.unshift(current.background.image);
    positions.unshift(current.background.position);
    sizes.unshift(current.background.size);
    repeats.unshift(current.background.repeat);
  }

  const values = {
    'background-image': images.join(', '),
    'background-position': positions.join(', '),
    'background-size': sizes.join(', '),
    'background-repeat': repeats.join(', '),
  };
  for (const original of current.original) {
    const { property } = original;
    if (row.style.getPropertyValue(property) !== current.applied.get(property)) {
      original.value = row.style.getPropertyValue(property);
      original.priority = row.style.getPropertyPriority(property);
    }
    row.style.setProperty(property, values[property]);
    current.applied.set(property, row.style.getPropertyValue(property));
  }
}
