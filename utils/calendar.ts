export type CalendarGrid = {
  row: HTMLElement;
  columns: { element: HTMLElement; date: Date }[];
};

export function dateFromKey(key: string): Date | null {
  if (!/^\d+$/.test(key)) return null;
  const value = Number(key);
  if (!Number.isSafeInteger(value)) return null;

  // Calendar packs the year since 1970 above a 4-bit month and a 5-bit day.
  const year = 1970 + Math.floor(value / 512);
  const month = Math.floor((value % 512) / 32) - 1;
  const day = value % 32;
  const date = new Date(year, month, day);
  return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day
    ? date
    : null;
}

export function findTimeGrid(): CalendarGrid | null {
  const main = document.querySelector('[role="main"]');
  if (!main) return null;

  for (const cell of main.querySelectorAll<HTMLElement>(
    '[role="gridcell"][data-datekey][data-column-index]',
  )) {
    const row = cell.parentElement;
    if (!row || row.getAttribute('role') !== 'row' || row.clientHeight < 100) continue;
    const columns: CalendarGrid['columns'] = [];
    for (const element of row.children) {
      if (!(element instanceof HTMLElement) || element.getAttribute('role') !== 'gridcell') continue;
      const date = dateFromKey(element.getAttribute('data-datekey') ?? '');
      if (!date || element.clientWidth === 0) continue;
      columns.push({ element, date });
    }
    if (columns.length > 0) return { row, columns };
  }
  return null;
}
