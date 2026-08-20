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
import { ENABLED_KEY, getEnabled } from '@/utils/settings';

let enabled = true;
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

    getEnabled().then((value) => {
      enabled = value;
      paint();
    });
    browser.storage.onChanged.addListener((changes, area) => {
      if (area !== 'local' || !changes[ENABLED_KEY]) return;
      enabled = changes[ENABLED_KEY].newValue !== false;
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
