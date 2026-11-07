import { defineConfig } from 'wxt';

export default defineConfig({
  // Build and watch for manual loading in the user's existing browser session.
  webExt: {
    disabled: true,
  },
  manifest: {
    name: 'Daytime',
    description: 'Daylight hours on Google Calendar',
    icons: {
      128: 'icon/on.png',
    },
    action: {
      default_popup: 'popup.html',
      default_icon: {
        128: 'icon/on.png',
      },
    },
    permissions: ['storage'],
    host_permissions: ['*://calendar.google.com/*'],
  },
});
