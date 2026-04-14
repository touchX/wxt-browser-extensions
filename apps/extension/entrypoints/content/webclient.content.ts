// Content Script - 在 WebClient 页面注入
// 监听来自 Background 的消息并转发到 WebClient 页面
export default defineContentScript({
  matches: ['http://localhost:5173/*', 'http://localhost:5174/*'],
  runAt: 'document_idle',

  main() {
    console.log('[Content Script] 已注入到页面')

    // 监听来自 Background 的消息
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log('[Content Script] 收到消息:', message)

      if (message.type && message.target === 'page') {
        // 转发到 WebClient 页面
        window.postMessage(message, '*')

        // 发送响应
        sendResponse({ success: true, received: true })
      }

      return true
    })

    // 监听页面的响应消息，转发回 Background
    window.addEventListener('message', (event) => {
      // 仅处理来自同源页面的消息
      if (event.origin !== 'http://localhost:5173' && event.origin !== 'http://localhost:5174') {
        return
      }

      // 转发响应到 Background
      if (event.data?.type === 'ACTION_COMPLETED' || event.data?.type === 'ACTION_FAILED') {
        browser.runtime.sendMessage(event.data).catch(() => {
          // 忽略发送失败（可能是页面已关闭）
        })
      }
    })
  }
})