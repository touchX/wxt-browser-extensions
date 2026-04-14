// Background service worker
// Ref: svc-register-listeners-synchronously, ts-use-browser-not-chrome
// Note: WXT 自动注入 browser 全局变量 (wxt/browser)

export default defineBackground({
  onInstall() {
    console.log('Extension installed')
    // 初始化默认设置
    browser.storage.sync.set({
      version: '1.0.0',
      firstRun: true,
      serverUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001'
    })
  },

  onUpdate() {
    console.log('Extension updated')
    // 处理版本迁移
    browser.storage.sync.get(['version']).then((result) => {
      const currentVersion = (result as Record<string, string>).version || '1.0.0'
      if (currentVersion !== '1.0.0') {
        console.log(`Migrating from ${currentVersion} to 1.0.0`)
      }
    })
  },

  main() {
    console.log('[Background] Extension loaded')

    // 监听存储变化 (svc-watch-for-changes)
    browser.storage.onChanged.addListener((changes, area) => {
      console.log('[Background] Storage changed:', changes, area)
    })

    // 监听来自 Content Script 的响应消息
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log('[Background] 收到消息:', message, 'from:', sender.tab?.url)

      // 处理扩展命令响应
      if (message.type === 'ACTION_COMPLETED' || message.type === 'ACTION_FAILED') {
        console.log('[Background] 收到页面响应:', message.type)
      }

      // 处理 GET_STATUS 请求
      if (message.type === 'GET_STATUS') {
        sendResponse({ status: 'ok', timestamp: Date.now() })
      }

      return true
    })
  }
})