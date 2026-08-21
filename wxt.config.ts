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
      16: 'icon/sun.png',
      32: 'icon/sun.png',
      48: 'icon/sun.png',
      96: 'icon/sun.png',
      128: 'icon/sun.png',
    },
    action: {
      default_popup: 'popup.html',
      default_icon: {
        16: 'icon/sun.png',
        32: 'icon/sun.png',
        48: 'icon/sun.png',
        96: 'icon/sun.png',
        128: 'icon/sun.png',
      },
    },
    permissions: ['storage'],
    host_permissions: ['*://calendar.google.com/*'],
  },
});
