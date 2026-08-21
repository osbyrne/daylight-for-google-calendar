import { hourGradient } from '@/utils/sun';

const ROOT = 'data-daytime-root';

export type GridTarget = {
  scroller: HTMLElement;
  gutter: number;
  days: number;
  dates: Date[];
  dark: boolean;
  lat: number;
  lng: number;
  opacity: number;
};

export function removeOverlay() {
  document.querySelector(`[${ROOT}]`)?.remove();
}

export function paintOverlay(target: GridTarget) {
  const { scroller, gutter, days, dates, dark, lat, lng, opacity } = target;
  const box = scroller.getBoundingClientRect();
  const left = box.left + gutter;
  const width = box.width - gutter;
  if (width < 40 || box.height < 40) {
    removeOverlay();
    return;
  }

  let root = document.querySelector<HTMLElement>(`[${ROOT}]`);
  if (!root) {
    root = document.createElement('div');
    root.setAttribute(ROOT, '');
    document.documentElement.append(root);
  }

  Object.assign(root.style, {
    position: 'fixed',
    top: `${box.top}px`,
    left: `${left}px`,
    width: `${width}px`,
    height: `${box.height}px`,
    overflow: 'hidden',
    pointerEvents: 'none',
    zIndex: '8',
    // A normal translucent layer keeps the palette airy instead of intensifying
    // the calendar's own colors through blend modes.
    mixBlendMode: 'normal',
    opacity: String(opacity),
  });

  const key = `${dates.map((d) => d.toDateString()).join('|')}|${days}|${scroller.scrollHeight}|${dark}`;
  let inner = root.firstElementChild as HTMLElement | null;
  if (!inner || root.dataset.key !== key) {
    inner = document.createElement('div');
    inner.style.display = 'grid';
    inner.style.gridTemplateColumns = `repeat(${days}, 1fr)`;
    inner.style.width = '100%';
    inner.replaceChildren(
      ...dates.map((day) => {
        const column = document.createElement('div');
        column.style.background = hourGradient(day, lat, lng, dark);
        column.style.height = '100%';
        return column;
      }),
    );
    root.replaceChildren(inner);
    root.dataset.key = key;
  }

  inner.style.height = `${scroller.scrollHeight}px`;
  inner.style.transform = `translateY(${-scroller.scrollTop}px)`;
}
