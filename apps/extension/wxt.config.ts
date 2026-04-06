import { defineConfig } from 'wxt'

export default defineConfig({
  browser: 'chrome',
  manifest: {
    name: 'WXT Browser Extension',
    description: 'Browser extension built with WXT and Vue',
    version: '1.0.0',
    permissions: ['activeTab', 'storage'],
    options_page: 'options.html',
    action: {
      default_popup: 'popup.html',
      default_icon: {
        '16': '/icon-16.png',
        '32': '/icon-32.png',
        '48': '/icon-48.png',
        '128': '/icon-128.png'
      }
    },
  },
})
