const RAD = Math.PI / 180;

export function sunAltitude(date: Date, lat: number, lng: number): number {
  const d = date.getTime() / 86400000 - 10957.5;
  const g = RAD * (357.5291 + 0.98560028 * d);
  const q = RAD * (280.459 + 0.98564736 * d);
  const L = q + RAD * (1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g));
  const e = RAD * (23.439 - 3.6e-7 * d);
  const ra = Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L));
  const dec = Math.asin(Math.sin(e) * Math.sin(L));
  const lw = -lng * RAD;
  const phi = lat * RAD;
  const H = RAD * (280.16 + 360.9856235 * d) - lw - ra;
  return (
    Math.asin(
      Math.sin(phi) * Math.sin(dec) +
        Math.cos(phi) * Math.cos(dec) * Math.cos(H),
    ) / RAD
  );
}

export function colorForAltitude(alt: number, dark: boolean): string {
  if (alt >= 0) {
    const t = Math.min(alt / 55, 1);
    const r = 255;
    const g = Math.round(150 + 70 * t);
    const b = Math.round(36 + 24 * t);
    const a = dark ? 0.35 : 0.45;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  const t = Math.min(-alt / 18, 1);
  const r = Math.round(48 - 18 * t);
  const g = Math.round(92 - 28 * t);
  const b = Math.round(176 - 16 * t);
  const a = dark ? 0.4 : 0.48;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function hourGradient(
  day: Date,
  lat: number,
  lng: number,
  dark: boolean,
): string {
  const stops: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    const mid = new Date(day);
    mid.setHours(hour, 30, 0, 0);
    const color = colorForAltitude(sunAltitude(mid, lat, lng), dark);
    const start = ((hour / 24) * 100).toFixed(4);
    const end = (((hour + 1) / 24) * 100).toFixed(4);
    stops.push(`${color} ${start}%`, `${color} ${end}%`);
  }
  return `linear-gradient(to bottom, ${stops.join(', ')})`;
}
