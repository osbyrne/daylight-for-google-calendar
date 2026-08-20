import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: 'Daytime',
    description: 'Daylight hours on Google Calendar',
    permissions: ['storage'],
    host_permissions: ['*://calendar.google.com/*'],
  },
});
