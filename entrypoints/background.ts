import { ext, isEnabledMessage } from '@/utils/runtime';

export default defineBackground(() => {
  let enabled = true;
  let opacity = 1;

  void applyIcon(enabled);
  void loadSettings().then((settings) => {
    enabled = settings.enabled;
    opacity = settings.opacity;
    void applyIcon(enabled);
  });

  ext().action?.onClicked.addListener(() => {
    enabled = !enabled;
    void applyIcon(enabled);
    void notifyTabs(enabled, opacity);
  });

  ext().runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (!isEnabledMessage(msg)) return;
    if (msg.type === 'daytime-get') {
      sendResponse({ enabled, opacity });
      return;
    }
    if (msg.type === 'daytime-set') {
      enabled = msg.enabled !== false;
      sendResponse({ enabled, opacity });
      void saveSettings({ enabled });
      void applyIcon(enabled);
      void notifyTabs(enabled, opacity);
      return;
    }
    if (msg.type === 'daytime-set-opacity') {
      opacity = clampOpacity(msg.opacity);
      sendResponse({ enabled, opacity });
      void saveSettings({ opacity });
      void notifyTabs(enabled, opacity);
    }
  });
});

async function loadSettings(): Promise<{ enabled: boolean; opacity: number }> {
  const settings = await ext().storage?.local.get(['enabled', 'opacity']);
  return {
    enabled: settings?.enabled !== false,
    opacity: clampOpacity(settings?.opacity),
  };
}

async function saveSettings(settings: Record<string, unknown>) {
  await ext().storage?.local.set(settings);
}

function clampOpacity(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(0, Math.min(1, value))
    : 1;
}

async function applyIcon(enabled: boolean) {
  const api = ext().action;
  if (!api) return;
  await api.setIcon({
    path: enabled ? 'icon/on.png' : 'icon/off.png',
  });
  await api.setTitle({
    title: enabled ? 'Deactivate daylight overlay' : 'Activate daylight overlay',
  });
}

async function notifyTabs(enabled: boolean, opacity: number) {
  const tabs = await ext().tabs?.query({ url: '*://calendar.google.com/*' });
  for (const tab of tabs ?? []) {
    if (tab.id == null) continue;
    void ext().tabs?.sendMessage(tab.id, {
      type: 'daytime-changed',
      enabled,
      opacity,
    });
  }
}
