import { defineConfig } from 'wxt'

export default defineConfig({
  browser: 'chrome',
  manifest: {
    name: 'WXT Browser Extension',
    description: 'Browser extension built with WXT and Vue',
    version: '1.0.0',
    permissions: ['activeTab', 'storage'],
  },
})
