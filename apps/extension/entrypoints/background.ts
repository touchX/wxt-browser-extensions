// Background service worker with lifecycle management
export default defineBackground({
  onInstall() {
    console.log('Extension installed');
    // 初始化默认设置
    chrome.storage.sync.set({
      version: '1.0.0',
      firstRun: true
    });
  },

  onUpdate() {
    console.log('Extension updated');
    // 处理版本迁移
    chrome.storage.sync.get(['version'], (result) => {
      const currentVersion = result.version || '1.0.0';
      if (currentVersion !== '1.0.0') {
        console.log(`Migrating from ${currentVersion} to 1.0.0`);
      }
    });
  }
});

// 监听存储变化 (svc-watch-for-changes)
chrome.storage.onChanged.addListener((changes, area) => {
  console.log('Storage changed:', changes, area);
});

// 监听消息 (msg-type-safe-messaging)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Received message:', message);

  if (message.type === 'GET_STATUS') {
    sendResponse({ status: 'ok', timestamp: Date.now() });
  }

  return true; // 异步响应
});
