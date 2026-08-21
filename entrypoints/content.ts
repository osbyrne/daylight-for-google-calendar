import {
  dayCount,
  datesForDays,
  findHourLabels,
  findMainScroller,
  gutterWidth,
  isDarkBackground,
  nearestScroller,
} from '@/utils/calendar';
import { observerCoords } from '@/utils/location';
import { paintOverlay, removeOverlay, type GridTarget } from '@/utils/overlay';
import { ext, isEnabledMessage } from '@/utils/runtime';

let enabled = true;
let opacity = 1;
let scroller: HTMLElement | null = null;

export default defineContentScript({
  matches: ['*://calendar.google.com/*'],
  runAt: 'document_idle',
  main(ctx) {
    let pending = false;
    const schedule = () => {
      if (pending) return;
      pending = true;
      ctx.setTimeout(() => {
        pending = false;
        paint();
      }, 80);
    };

    paint();
    void ext()
      .runtime.sendMessage({ type: 'daytime-get' })
      .then((response) => {
        const settings = response as { enabled?: boolean; opacity?: number } | undefined;
        enabled = settings?.enabled !== false;
        opacity = settings?.opacity ?? 1;
        paint();
      })
      .catch(() => {
        paint();
      });
    ext().runtime.onMessage.addListener((msg) => {
      if (!isEnabledMessage(msg) || msg.type !== 'daytime-changed') return;
      enabled = msg.enabled !== false;
      opacity = msg.opacity ?? opacity;
      paint();
    });

    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });
    ctx.addEventListener(window, 'wxt:locationchange', schedule);
    ctx.addEventListener(window, 'resize', schedule);
    ctx.addEventListener(window, 'scroll', schedule, { capture: true });
  },
});

function paint() {
  if (!enabled) {
    unbindScroller();
    removeOverlay();
    return;
  }

  const target = locateGrid();
  if (!target) {
    unbindScroller();
    removeOverlay();
    return;
  }

  bindScroller(target.scroller);
  paintOverlay(target);
}

function locateGrid(): GridTarget | null {
  const labels = findHourLabels();
  const found =
    (labels[0] ? nearestScroller(labels[0]) : null) ?? findMainScroller();
  if (!found) return null;

  const days = dayCount(found);
  const [lat, lng] = observerCoords();
  return {
    scroller: found,
    gutter: gutterWidth(found, labels),
    days,
    dates: datesForDays(days),
    dark: isDarkBackground(found),
    lat,
    lng,
    opacity,
  };
}

function bindScroller(el: HTMLElement) {
  if (scroller === el) return;
  unbindScroller();
  scroller = el;
  el.addEventListener('scroll', onScroll, { passive: true });
}

function unbindScroller() {
  scroller?.removeEventListener('scroll', onScroll);
  scroller = null;
}

function onScroll() {
  paint();
}
