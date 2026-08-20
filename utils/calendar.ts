const HOUR_TEXT =
  /^(?:[1-9]|1[0-2])\s*(?:AM|PM)$|^(?:[01]?\d|2[0-3]):00$/i;

export function findHourLabels(): HTMLElement[] {
  const root = document.querySelector('[role="main"]') ?? document.body;
  const labels: HTMLElement[] = [];
  for (const el of root.querySelectorAll<HTMLElement>('div, span')) {
    const text = (el.textContent ?? '').replace(/\s+/g, ' ').trim();
    if (!HOUR_TEXT.test(text)) continue;
    if ((el.textContent ?? '').trim() !== text) continue;
    const box = el.getBoundingClientRect();
    if (box.width === 0 || box.height === 0 || box.width > 96) continue;
    labels.push(el);
  }
  if (labels.length < 4) return [];
  const buckets = new Map<number, HTMLElement[]>();
  for (const el of labels) {
    const x = Math.round(el.getBoundingClientRect().left / 8) * 8;
    const group = buckets.get(x) ?? [];
    group.push(el);
    buckets.set(x, group);
  }
  let best: HTMLElement[] = [];
  for (const group of buckets.values()) {
    if (group.length > best.length) best = group;
  }
  return best.sort(
    (a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top,
  );
}

export function hourPitch(labels: HTMLElement[]): number {
  const firstLabel = labels[0];
  const nextLabel = labels[1];
  if (!firstLabel || !nextLabel) return 48;
  const delta = Math.abs(
    nextLabel.getBoundingClientRect().top - firstLabel.getBoundingClientRect().top,
  );
  return delta > 8 ? delta : 48;
}

export function nearestScroller(el: HTMLElement): HTMLElement | null {
  let node: HTMLElement | null = el;
  while (node && node !== document.body) {
    const style = getComputedStyle(node);
    if (/(auto|scroll|overlay)/.test(style.overflowY)) return node;
    node = node.parentElement;
  }
  return null;
}

export function findMainScroller(): HTMLElement | null {
  const root = document.querySelector('[role="main"]') ?? document.body;
  let best: HTMLElement | null = null;
  let bestScore = 0;
  for (const el of root.querySelectorAll<HTMLElement>('div')) {
    const style = getComputedStyle(el);
    if (!/(auto|scroll|overlay)/.test(style.overflowY)) continue;
    if (el.clientWidth < 200 || el.clientHeight < 120) continue;
    const score = el.scrollHeight + el.clientWidth;
    if (score > bestScore) {
      best = el;
      bestScore = score;
    }
  }
  return best;
}

export function dayCount(scroller: HTMLElement): number {
  const path = location.pathname;
  if (/\/r\/day(?:\/|$)/.test(path) && !path.includes('customday')) return 1;
  const headerDates = parseHeaderDates();
  if (headerDates.length >= 1 && headerDates.length <= 7) return headerDates.length;
  if (/\/r\/week(?:\/|$)/.test(path) && !path.includes('custom')) return 7;
  if (/\/r\/customweek(?:\/|$)/.test(path)) return 5;
  if (scroller.clientWidth > 0) {
    const guessed = Math.round(scroller.clientWidth / 180);
    if (guessed >= 1 && guessed <= 7) return guessed;
  }
  return 7;
}

export function datesForDays(count: number): Date[] {
  const header = parseHeaderDates();
  if (header.length === count) return header;
  const start = header[0] ?? parseUrlDate() ?? startOfLocalDay(new Date());
  return Array.from({ length: count }, (_, i) => addDays(start, i));
}

export function parseHeaderDates(): Date[] {
  const root = document.querySelector('[role="main"]') ?? document.body;
  const dates: Date[] = [];
  const seen = new Set<string>();
  for (const el of root.querySelectorAll('[aria-label]')) {
    const date = parseDateLabel(el.getAttribute('aria-label') ?? '');
    if (!date) continue;
    const key = date.toDateString();
    if (seen.has(key)) continue;
    seen.add(key);
    dates.push(date);
  }
  dates.sort((a, b) => a.getTime() - b.getTime());
  return dates;
}

function parseDateLabel(label: string): Date | null {
  const match = label.match(
    /(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s+([A-Za-z]+ \d{1,2}(?:,\s*\d{4})?)/i,
  );
  const raw = match?.[1];
  if (!raw) return null;
  const year = raw.includes(',') ? raw : `${raw}, ${new Date().getFullYear()}`;
  const date = new Date(year);
  return Number.isNaN(date.getTime()) ? null : startOfLocalDay(date);
}

function parseUrlDate(): Date | null {
  const match = location.pathname.match(
    /\/r\/(?:week|day|customday|customweek)?\/?(\d{4})\/(\d{1,2})\/(\d{1,2})/,
  );
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

export function isDarkBackground(el: HTMLElement): boolean {
  let node: HTMLElement | null = el;
  while (node) {
    const color = getComputedStyle(node).backgroundColor;
    const parts = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (parts) {
      const r = Number(parts[1]);
      const g = Number(parts[2]);
      const b = Number(parts[3]);
      const a = color.startsWith('rgba')
        ? Number(color.slice(color.lastIndexOf(',') + 1, -1))
        : 1;
      if (a > 0.4) return (r * 299 + g * 587 + b * 114) / 1000 < 128;
    }
    node = node.parentElement;
  }
  return false;
}

export function gutterWidth(scroller: HTMLElement, labels: HTMLElement[]): number {
  if (labels.length > 0) {
    const right = Math.max(
      ...labels.map((el) => el.getBoundingClientRect().right),
    );
    return Math.max(0, Math.min(right - scroller.getBoundingClientRect().left, 120));
  }
  return Math.min(72, Math.max(0, scroller.clientWidth * 0.08));
}
