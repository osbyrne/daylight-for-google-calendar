import { findTimeGrid } from '@/utils/calendar';
import { observerCoords } from '@/utils/location';
import { paintOverlay, removeOverlay } from '@/utils/overlay';
import { ext, isEnabledMessage } from '@/utils/runtime';

export default defineContentScript({
  matches: ['*://calendar.google.com/*'],
  runAt: 'document_idle',
  main(ctx) {
    let enabled = true;
    let opacity = 1;
    let pending = false;
    let observedRow: HTMLElement | undefined;
    const resizeObserver = new ResizeObserver(schedule);

    function schedule() {
      if (pending || ctx.isInvalid) return;
      pending = true;
      ctx.setTimeout(() => {
        pending = false;
        paint();
      }, 80);
    }

    function paint() {
      if (ctx.isInvalid) return;
      const grid = enabled ? findTimeGrid() : null;
      if (grid?.row !== observedRow) {
        resizeObserver.disconnect();
        observedRow = grid?.row;
        if (observedRow) resizeObserver.observe(observedRow);
      }
      if (!grid) {
        removeOverlay();
        return;
      }

      const [lat, lng] = observerCoords();
      paintOverlay({ ...grid, lat, lng, opacity });
    }

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
      if (ctx.isInvalid || !isEnabledMessage(msg) || msg.type !== 'daytime-changed') return;
      enabled = msg.enabled !== false;
      opacity = msg.opacity ?? opacity;
      paint();
    });

    const observer = new MutationObserver(schedule);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-datekey', 'data-column-index'],
    });
    ctx.addEventListener(window, 'wxt:locationchange', schedule);
    ctx.addEventListener(window, 'resize', schedule);
    ctx.onInvalidated(() => {
      observer.disconnect();
      resizeObserver.disconnect();
      removeOverlay();
    });
  },
});
