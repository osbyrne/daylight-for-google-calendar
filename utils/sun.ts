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

type Color = readonly [number, number, number];

// Altitude stops make the transition through dawn and dusk gradual: cool blue
// moves through periwinkle and peach before becoming a very light daylight yellow.
const ALTITUDE_COLORS: readonly { alt: number; color: Color }[] = [
  { alt: -18, color: [81, 126, 193] },
  { alt: -12, color: [99, 145, 202] },
  { alt: -7, color: [125, 166, 211] },
  { alt: -3, color: [161, 186, 217] },
  { alt: 0, color: [205, 195, 196] },
  { alt: 3, color: [235, 204, 165] },
  { alt: 7, color: [246, 218, 151] },
  { alt: 15, color: [250, 231, 166] },
  { alt: 55, color: [255, 244, 196] },
];

function mix(a: number, b: number, amount: number): number {
  return Math.round(a + (b - a) * amount);
}

export function colorForAltitude(alt: number, dark: boolean): string {
  const clamped = Math.max(ALTITUDE_COLORS[0]!.alt, Math.min(alt, 55));
  const upperIndex = ALTITUDE_COLORS.findIndex((stop) => stop.alt >= clamped);
  const upper =
    ALTITUDE_COLORS[upperIndex] ?? ALTITUDE_COLORS[ALTITUDE_COLORS.length - 1]!;
  const lower = ALTITUDE_COLORS[Math.max(0, upperIndex - 1)]!;
  const span = upper.alt - lower.alt || 1;
  const amount = (clamped - lower.alt) / span;
  const r = mix(lower.color[0], upper.color[0], amount);
  const g = mix(lower.color[1], upper.color[1], amount);
  const b = mix(lower.color[2], upper.color[2], amount);

  // Keep calendar events and grid details readable; dark calendars need only a
  // touch more tint to retain the same perceived softness.
  const alpha = dark ? 0.18 : 0.14;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function hourGradient(
  day: Date,
  lat: number,
  lng: number,
  dark: boolean,
): string {
  const stops: string[] = [];
  for (let halfHour = 0; halfHour < 48; halfHour++) {
    const mid = new Date(day);
    mid.setHours(0, halfHour * 30, 0, 0);
    const color = colorForAltitude(sunAltitude(mid, lat, lng), dark);
    const position = ((halfHour / 48) * 100).toFixed(4);
    stops.push(`${color} ${position}%`);
  }
  return `linear-gradient(to bottom, ${stops.join(', ')})`;
}
