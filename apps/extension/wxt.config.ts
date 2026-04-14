import { defineConfig } from 'wxt'

export default defineConfig({
  browser: 'chrome',
  manifest: {
    name: 'WXT Browser Extension',
    short_name: 'WXT',
    description: 'Browser extension built with WXT',
    version: '1.0.0',
    permissions: ['storage', 'scripting'],
    optional_permissions: ['activeTab'],
    host_permissions: [
      'http://127.0.0.1/*',
      'http://localhost/*',
      'http://gzkq.aitmc.cn/*',
      'http://10.254.8.163/*'
    ],
    action: {
      default_popup: 'popup.html',
      default_title: 'WXT Extension'
    },
    background: {
      service_worker: 'background.js'
    }
  },
})