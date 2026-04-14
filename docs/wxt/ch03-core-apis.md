# 第三章：核心功能与 API

本章将深入介绍 WXT 的核心功能，包括内容脚本、后台脚本、存储 API 和消息通信机制。这些是构建浏览器扩展的基础知识。

## 3.1 内容脚本（Content Scripts）

内容脚本是运行在网页上下文中的 JavaScript，可以读取和修改页面的 DOM。

### 3.1.1 基本用法

创建内容脚本非常简单：

```typescript
// entrypoints/my-content-script.content.ts
export default defineContentScript({
  // 匹配规则：哪些页面加载此脚本
  matches: ['*://*.example.com/*'],
  
  main() {
    // 页面加载后执行的代码
    console.log('内容脚本已加载');
    
    // 创建一个按钮
    const button = document.createElement('button');
    button.textContent = '点击我';
    button.style.position = 'fixed';
    button.style.top = '10px';
    button.style.right = '10px';
    button.style.zIndex = '999999';
    document.body.appendChild(button);
    
    button.addEventListener('click', () => {
      alert('Hello from content script!');
    });
  },
});
```

### 3.1.2 匹配模式配置

**matches**：定义哪些 URL 匹配此内容脚本

```typescript
export default defineContentScript({
  // 多个模式
  matches: [
    '*://*.example.com/*',       // example.com 的所有子域名
    '*://example.org/*',         // example.org
    '*://*/search*',              // 任何域名的 search 路径
  ],
});
```

**excludeMatches**：排除特定 URL

```typescript
export default defineContentScript({
  matches: ['*://*.example.com/*'],
  excludeMatches: ['*://*.example.com/admin/*'],  // 排除 admin 页面
});
```

**includeGlobs / excludeGlobs**：使用 glob 模式

```typescript
export default defineContentScript({
  matches: ['*://*.example.com/*'],
  includeGlobs: ['*://*.example.com/news/*'],
  excludeGlobs: ['*://*.example.com/*/draft/*'],
});
```

### 3.1.3 注入时机

使用 `runAt` 控制脚本注入时机：

| 值 | 说明 |
|---|---|
| `document_start` | 最早注入，DOM 还未构建 |
| `document_end` | DOM 构建完成，资源可能未加载完 |
| `document_idle` | 默认值，DOM 和资源都加载完成 |

```typescript
export default defineContentScript({
  matches: ['*://*/*'],
  runAt: 'document_idle',  // 页面完全加载后执行
  main() { /* ... */ },
});
```

### 3.1.4 CSS 注入模式

WXT 支持三种 CSS 注入模式：

```typescript
export default defineContentScript({
  matches: ['*://*/*'],
  
  // CSS 注入模式
  cssInjectionMode: 'manifest',  // 默认，通过 manifest 注入
  
  main() { /* ... */ },
});
```

| 模式 | 说明 | 适用场景 |
|------|------|----------|
| `manifest` | 通过 manifest 声明注入 | 简单样式 |
| `manual` | 手动控制注入时机 | 需要动态控制 |
| `ui` | 配合 UI 框架使用 | 使用 Shadow DOM |

### 3.1.5 帧配置

```typescript
export default defineContentScript({
  matches: ['*://*/*'],
  
  // 是否在所有帧中运行
  allFrames: false,
  
  // 是否匹配 about:blank
  matchAboutBlank: false,
  
  // 是否匹配 file:// 协议
  matchOriginAsFallback: true,
  
  main() { /* ... */ },
});
```

### 3.1.6 与页面脚本通信

内容脚本可以使用 `injectScript` 与页面中的主世界脚本（main world script）通信：

**内容脚本端：**

```typescript
// entrypoints/example.content.ts
export default defineContentScript({
  matches: ['*://*/*'],
  async main() {
    // 注入主世界脚本
    const { script } = await injectScript('/injected-script.js', {
      // 注入前修改脚本
      modifyScript(script) {
        script.addEventListener('from-injected-script', (event) => {
          if (event instanceof CustomEvent) {
            console.log('收到注入脚本的消息:', event.detail);
          }
        });
      },
    });
    
    // 发送消息到注入脚本
    script.dispatchEvent(
      new CustomEvent('from-content-script', {
        detail: 'Hello from content script!',
      }),
    );
  },
});
```

**注入的脚本（在 public 目录）：**

```javascript
// public/injected-script.js
(function() {
  const script = document.currentScript;
  
  // 监听来自内容脚本的消息
  script?.addEventListener('from-content-script', (event) => {
    if (event instanceof CustomEvent) {
      console.log('内容脚本说:', event.detail);
    }
  });
  
  // 发送消息到内容脚本
  script?.dispatchEvent(
    new CustomEvent('from-injected-script', {
      detail: 'Hello from injected script!',
    }),
  );
})();
```

> **注意**：由于浏览器安全限制，内容脚本和页面脚本在不同的上下文中运行，需要通过 CustomEvent 进行通信。

## 3.2 后台脚本（Background Scripts）

后台脚本在扩展的生命周期内持续运行，用于处理后台任务。

### 3.2.1 基本用法

```typescript
// entrypoints/background.ts
export default defineBackground({
  // Manifest V3: false = Service Worker, true = 持久后台页
  // Manifest V2: ignored
  persistent: false,
  
  // 使用 ES Modules
  type: 'module',
  
  main() {
    console.log('后台脚本已启动');
  },
});
```

### 3.2.2 监听扩展事件

```typescript
export default defineBackground({
  main() {
    // 扩展安装时触发
    browser.runtime.onInstalled.addListener((details) => {
      console.log('扩展已安装', details.reason);
    });
    
    // 监听消息
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log('收到消息:', message);
      
      // 异步响应
      if (message.type === 'async') {
        return Promise.resolve({ response: '异步响应' });
      }
      
      // 同步响应
      sendResponse({ response: '同步响应' });
      return true; // 保持消息通道打开以便异步响应
    });
    
    // 标签页更新监听
    browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.url) {
        console.log('页面加载完成:', tab.url);
      }
    });
    
    // 浏览器通知
    browser.notifications.onClicked.addListener((notificationId) => {
      console.log('通知被点击:', notificationId);
    });
  },
});
```

### 3.2.3 使用 Alarm API

```typescript
export default defineBackground({
  main() {
    // 创建定时任务
    browser.alarms.create('my-alarm', {
      delayInMinutes: 5,      // 5分钟后触发
      periodInMinutes: 5,    // 然后每5分钟重复
    });
    
    // 监听定时任务
    browser.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === 'my-alarm') {
        console.log('定时任务触发');
      }
    });
  },
});
```

### 3.2.4 使用 Storage

```typescript
export default defineBackground({
  main() {
    // 保存数据
    browser.storage.local.set({ key: 'value' });
    
    // 读取数据
    browser.storage.local.get('key').then((result) => {
      console.log('存储的数据:', result.key);
    });
    
    // 监听存储变化
    browser.storage.onChanged.addListener((changes, areaName) => {
      console.log('存储变化:', changes);
    });
  },
});
```

### 3.2.5 后台脚本的限制

> **重要**：后台脚本的 main 函数**不能是异步**的。

```typescript
// ❌ 错误：main 函数不能是 async
export default defineBackground({
  async main() {
    const data = await fetchData(); // 不允许！
  },
});

// ✅ 正确：在内部使用异步
export default defineBackground({
  main() {
    fetchData().then(data => {
      console.log(data);
    });
  },
});
```

## 3.3 存储 API

WXT 提供了强大的存储 API，简化了浏览器扩展的存储操作。

### 3.3.1 基本用法

```typescript
import { storage } from 'wxt/utils';

// 定义一个存储项
const countItem = storage.defineItem<number>('local:count', {
  defaultValue: 0,
});

// 读取值
const count = await countItem.getValue();

// 设置值
await countItem.setValue(count + 1);

// 删除值
await countItem.removeValue();

// 监听变化
countItem.watch((newValue, oldValue) => {
  console.log(`计数从 ${oldValue} 变为 ${newValue}`);
});
```

### 3.3.2 存储类型

WXT 支持多种存储类型：

| 类型 | 说明 | 持久性 |
|------|------|--------|
| `local` | 本地存储 | 仅本地 |
| `sync` | 同步存储 | 跨设备同步 |
| `session` | 会话存储 | 仅当前会话 |
| `managed` | 管理存储 | 由管理员控制 |

```typescript
// local 存储
const localItem = storage.defineItem<number>('local:count', {
  defaultValue: 0,
});

// sync 存储
const syncItem = storage.defineItem<boolean>('sync:enabled', {
  defaultValue: true,
});

// session 存储
const sessionItem = storage.defineItem<string>('session:temp', {
  defaultValue: '',
  // session 存储不支持 watch
});
```

### 3.3.3 版本控制与迁移

```typescript
const settingsItem = storage.defineItem<Settings>('local:settings', {
  defaultValue: { theme: 'light', language: 'en' },
  version: 1,
  migrations: {
    1: (oldSettings) => {
      // 从 0 升级到 1
      return {
        ...oldSettings,
        language: oldSettings.language || 'en',
      };
    },
  },
});
```

### 3.3.4 直接使用 Storage API

如果您更喜欢直接使用浏览器 API：

```typescript
import { storage } from 'wxt/utils';

// 使用底层 API
await storage.get('local:myKey');
await storage.set('local:myKey', 'value');
await storage.remove('local:myKey');
await storage.clear('local');

// 获取所有数据
const allData = await storage.getAll('local');
```

### 3.3.5 存储示例：用户偏好设置

```typescript
// 定义用户偏好存储
const preferences = storage.defineItem<UserPreferences>('local:preferences', {
  defaultValue: {
    theme: 'light',
    fontSize: 'medium',
    notifications: true,
  },
});

// 使用
export function usePreferences() {
  const prefs = ref<UserPreferences>(preferences.value);
  
  const updateTheme = (theme: 'light' | 'dark') => {
    preferences.value = { ...prefs.value, theme };
  };
  
  const updateFontSize = (fontSize: 'small' | 'medium' | 'large') => {
    preferences.value = { ...prefs.value, fontSize };
  };
  
  return { prefs, updateTheme, updateFontSize };
}
```

## 3.4 消息通信机制

浏览器扩展的不同部分之间需要通信，WXT 提供了多种通信方式。

### 3.4.1 内容脚本 ↔ 后台脚本

**从内容脚本发送消息：**

```typescript
// entrypoints/content-script.ts
export default defineContentScript({
  matches: ['*://*/*'],
  main() {
    // 发送消息到后台脚本
    browser.runtime.sendMessage({ 
      type: 'get-data', 
      payload: 'some-data' 
    }).then(response => {
      console.log('后台响应:', response);
    }).catch(error => {
      console.error('发送失败:', error);
    });
  },
});
```

**后台脚本接收消息：**

```typescript
// entrypoints/background.ts
export default defineBackground({
  main() {
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'get-data') {
        // 同步响应
        sendResponse({ data: 'some-response' });
        return true;
      }
      
      // 异步响应
      if (message.type === 'async-request') {
        fetchData().then(data => {
          sendResponse({ data });
        });
        return true; // 保持通道开放
      }
    });
  },
});
```

### 3.4.2 后台脚本 → 内容脚本

**发送消息到指定标签页：**

```typescript
// entrypoints/background.ts
export default defineBackground({
  main() {
    // 发送消息到指定标签页
    browser.tabs.sendMessage(tabId, { 
      type: 'update-ui', 
      data: 'some-data' 
    });
    
    // 发送到当前活动标签页
    browser.tabs.query({ active: true, currentWindow: true })
      .then(tabs => {
        if (tabs[0]?.id) {
          browser.tabs.sendMessage(tabs[0].id, { type: 'update-ui' });
        }
      });
  },
});
```

**内容脚本监听消息：**

```typescript
// entrypoints/content-script.ts
export default defineContentScript({
  matches: ['*://*/*'],
  main() {
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'update-ui') {
        // 更新 UI
        console.log('收到更新:', message.data);
      }
    });
  },
});
```

### 3.4.3 长期连接

使用 `browser.runtime.connect` 创建长期连接：

```typescript
// 内容脚本端
const port = browser.runtime.connect();

// 监听来自后台的消息
port.onMessage.addListener(message => {
  console.log('收到消息:', message);
});

// 发送消息
port.postMessage({ type: 'hello' });

// 监听连接断开
port.onDisconnect.addListener(() => {
  console.log('连接已断开');
});

// 后台脚本端
browser.runtime.onConnect.addListener((port) => {
  console.log('新连接:', port.name);
  
  port.onMessage.addListener(message => {
    console.log('收到消息:', message);
  });
  
  port.postMessage({ type: 'welcome' });
});
```

### 3.4.4 跨扩展通信

```typescript
// 扩展 A: 发送消息到扩展 B
browser.runtime.sendMessage('extension-b-id', {
  type: 'request',
});

// 扩展 B: 监听来自其他扩展的消息
browser.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  if (sender.id === 'extension-a-id') {
    console.log('收到扩展 A 的消息:', message);
    sendResponse({ response: 'OK' });
  }
  return true;
});
```

### 3.4.5 消息通信最佳实践

1. **使用强类型的消息格式**

```typescript
// 定义消息类型
interface Messages {
  'get-user': { request: void; response: User };
  'save-user': { request: User; response: boolean };
  'user-updated': { request: User; response: void };
}

// 发送消息
const user = await browser.runtime.sendMessage<Messages['get-user']>('get-user');
```

2. **错误处理**

```typescript
try {
  const response = await browser.runtime.sendMessage(message);
} catch (error) {
  if (error.message.includes('Could not establish connection')) {
    // 后台脚本未运行
  }
}
```

3. **避免长时间保持消息通道**

```typescript
// ❌ 不好：长时间保持通道开放
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  doAsyncWork().then(result => sendResponse(result));
  return true;
});

// ✅ 好：快速响应或明确异步
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.sync) {
    sendResponse(handleSync(message));
    return;
  }
  
  doAsyncWork().then(result => sendResponse(result));
  return true;
});
```

## 3.5 本章小结

本章我们学习了：
- ✅ **内容脚本**：匹配模式、注入时机、CSS 注入、与页面脚本通信
- ✅ **后台脚本**：事件监听、Alarm API、Storage 使用
- ✅ **存储 API**：定义存储项、版本控制、迁移
- ✅ **消息通信**：内容脚本↔后台脚本、长期连接、跨扩展通信

### 下一步

下一章我们将学习如何**集成前端框架**（React、Vue、Svelte）来构建更复杂的扩展界面。

---

**参考资料**：
- [WXT 内容脚本文档](https://wxt.dev/guide/essentials/content-scripts)
- [WXT 后台脚本文档](https://wxt.dev/guide/essentials/entrypoints)
- [WXT 存储 API](https://wxt.dev/guide/essentials/storage)
- [WXT 消息通信](https://wxt.dev/guide/essentials/messaging)