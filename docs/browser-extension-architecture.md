# 浏览器扩展架构设计指南

本文档深入探讨浏览器扩展的架构设计思想，帮助开发者理解为什么扩展要以这种方式构建，以及如何设计高质量的扩展应用。

## 目录

1. [核心概念与术语](#1-核心概念与术语)
2. [架构分层概述](#2-架构分层概述)
3. [组件职责与边界](#3-组件职责与边界)
4. [通信机制详解](#4-通信机制详解)
5. [架构设计原则](#5-架构设计原则)
6. [常见架构模式](#6-常见架构模式)
7. [性能与安全优化](#7-性能与安全优化)
8. [测试策略](#8-测试策略)

---

## 1. 核心概念与术语

### 1.1 扩展的三个世界

浏览器扩展由三个相互隔离的执行上下文组成：

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Browser Process                                │
│                                                                         │
│  ┌───────────────────────┐  ┌───────────────────────┐                  │
│  │   Extension Context   │  │   Web Page Context    │                  │
│  │   (扩展可信上下文)     │  │   (网页不可信上下文)   │                  │
│  │                       │  │                       │                  │
│  │  ┌─────┐ ┌─────────┐  │  │  ┌─────────┐ ┌─────┐  │                  │
│  │  │Popup│ │Background│  │  │  │Content  │ │ DOM │  │                  │
│  │  │     │ │ Service │  │  │  │ Script  │ │     │  │                  │
│  │  │     │ │ Worker  │  │  │  │         │ │     │  │                  │
│  │  └─────┘ └─────────┘  │  │  └─────────┘ └─────┘  │                  │
│  │        ↕              │  │        ↕              │                  │
│  │   Extension APIs      │  │   Injected           │                  │
│  │   (browser.*)         │  │   into Page          │                  │
│  └───────────────────────┘  └───────────────────────┘                  │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 核心术语

| 术语 | 说明 |
|------|------|
| **Manifest** | 扩展的配置文件，声明权限、入口点、资源等 |
| **Service Worker** | Manifest V3 的后台脚本，事件驱动，无持久状态 |
| **Background Page** | Manifest V2 的后台脚本，有持久页面 |
| **Content Script** | 注入到网页的脚本，可访问 DOM |
| **Popup** | 用户点击扩展图标时显示的临时页面 |
| **Options Page** | 扩展的设置页面 |
| **Native Messaging** | 扩展与原生应用通信的机制 |

### 1.3 Manifest 版本

| 特性 | MV2 | MV3 |
|------|-----|-----|
| 后台脚本 | Background Page | Service Worker |
| 阻塞 API | 支持 | 移除，改用异步 |
| 动作按钮 | browser_action + action | 仅 action |
| 远程代码 | 允许 | 禁止 |
| 声明式权限 | 较少 | 更多使用声明式 |

---

## 2. 架构分层概述

### 2.1 分层架构

```
┌─────────────────────────────────────────────────────────────────┐
│                         UI Layer                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Popup     │  │  Options    │  │  New Tab    │             │
│  │   (临时)    │  │  (设置)     │  │  (自定义)   │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                              ↓ ↑
┌─────────────────────────────────────────────────────────────────┐
│                      Business Logic Layer                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Background Service (Background)             │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │   │
│  │  │  消息路由   │  │  状态管理   │  │  业务逻辑   │      │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓ ↑
┌─────────────────────────────────────────────────────────────────┐
│                        Domain Layer                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Content   │  │   Storage  │  │  Extension  │             │
│  │   Scripts   │  │   (数据层)  │  │   APIs      │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                              ↓ ↑
┌─────────────────────────────────────────────────────────────────┐
│                       Platform Layer                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Chrome    │  │   Firefox   │  │    Edge     │             │
│  │   APIs      │  │   APIs      │  │    APIs     │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 各层职责

| 层级 | 职责 | 典型组件 |
|------|------|----------|
| UI Layer | 用户交互、展示数据 | Popup、Options、New Tab Page |
| Business Logic | 核心逻辑、流程控制 | Background Service |
| Domain Layer | 领域模型、数据处理 | Content Scripts、Storage |
| Platform Layer | 浏览器能力抽象 | Extension APIs |

---

## 3. 组件职责与边界

### 3.1 Background Service

**职责**：
- 扩展的"后端"，处理核心业务逻辑
- 管理扩展生命周期事件
- 协调各组件之间的通信
- 持有全局状态（注意 Service Worker 无持久状态）
- 与外部服务通信（API 调用）

**不适合做的事情**：
- 直接操作 DOM（无法访问）
- 长时间运行的任务（会被终止）
- 存储大量数据（内存限制）

**代码示例**：

```typescript
// entrypoints/background.ts
export default defineBackground({
  main() {
    // 扩展安装/更新时初始化
    browser.runtime.onInstalled.addListener((details) => {
      if (details.reason === 'install') {
        initializeDefaultSettings();
      }
    });

    // 消息路由中心
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.type) {
        case 'GET_TAB_DATA':
          handleGetTabData(message, sender, sendResponse);
          break;
        case 'SAVE_SETTINGS':
          handleSaveSettings(message, sendResponse);
          break;
        default:
          sendResponse({ error: 'Unknown message type' });
      }
      return true; // 异步响应
    });

    // 定时任务（使用 Alarm API）
    browser.alarms.create('sync-data', { periodInMinutes: 15 });
    browser.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === 'sync-data') {
        syncDataWithServer();
      }
    });
  },
});

async function initializeDefaultSettings() {
  await storage.set('local:settings', { theme: 'light', autoSync: true });
}

async function handleGetTabData(message, sender, sendResponse) {
  try {
    const tabId = sender.tab?.id;
    if (!tabId) throw new Error('No tab ID');
    
    const response = await browser.tabs.sendMessage(tabId, {
      type: 'GET_PAGE_INFO'
    });
    sendResponse({ success: true, data: response });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}
```

### 3.2 Content Script

**职责**：
- 在网页上下文中运行
- 访问和修改页面 DOM
- 监听页面事件
- 与页面内脚本通信（通过 injected script）

**不适合做的事情**：
- 直接调用 Extension APIs（部分可用）
- 跨域请求（受 CSP 限制）
- 存储大量数据
- 长期运行的后台任务

**代码示例**：

```typescript
// entrypoints/content.ts
export default defineContentScript({
  matches: ['*://*/*'],
  runAt: 'document_idle',
  
  main(ctx) {
    // 创建 DOM 元素
    const widget = createWidget();
    document.body.appendChild(widget);

    // 监听页面事件
    const observer = new MutationObserver((mutations) => {
      ctx.browser.storage.local.set({ 
        'local:mutation_count': getMutationCount() + 1 
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // 处理来自 Background 的消息
    ctx.addMessageListener((message) => {
      if (message.type === 'INJECT_STYLE') {
        injectCustomStyle(message.css);
      }
    });

    // 发送消息给 Background
    ctx.browser.runtime.sendMessage({
      type: 'PAGE_LOADED',
      url: window.location.href,
      title: document.title,
    });

    // 清理函数
    ctx.addUnload(() => {
      observer.disconnect();
      widget.remove();
    });
  },
});

function createWidget() {
  const div = document.createElement('div');
  div.className = 'my-extension-widget';
  div.textContent = 'Extension Active';
  return div;
}
```

### 3.3 Popup

**职责**：
- 快速操作界面
- 显示当前状态
- 简短的用户交互
- 与 Background 通信获取数据

**特点**：
- 打开时加载，关闭时卸载
- 无持久状态
- 适合简单、快速的交互

**代码示例**：

```typescript
// entrypoints/popup.tsx
import React, { useState, useEffect } from 'react';

export default function Popup() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 获取当前标签页数据
    async function fetchData() {
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      const tabId = tabs[0]?.id;
      
      if (tabId) {
        try {
          const response = await browser.tabs.sendMessage(tabId, { 
            type: 'GET_STATUS' 
          });
          setData(response);
        } catch (e) {
          setData({ error: 'Content script not loaded' });
        }
      }
      setLoading(false);
    }

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="popup">
      <h2>Extension Status</h2>
      {data?.error ? (
        <p className="error">{data.error}</p>
      ) : (
        <div>
          <p>Page: {data?.url}</p>
          <p>Items: {data?.count}</p>
        </div>
      )}
      <button onClick={() => browser.runtime.openOptionsPage()}>
        Settings
      </button>
    </div>
  );
}
```

### 3.4 组件对比

| 特性 | Background | Content Script | Popup |
|------|------------|----------------|-------|
| 生命周期 | 持续运行 | 与页面共存 | 临时 |
| 访问 DOM | ❌ | ✅ | ✅ |
| Extension APIs | 完整 | 有限 | 完整 |
| 存储 | ✅ (async) | ✅ (async) | ✅ (async) |
| 消息通信 | 枢纽 | 连接网页 | 连接 Background |
| 状态持久 | ❌ (MV3) | ❌ | ❌ |
| 内存限制 | 严格 | 宽松 | 严格 |

---

## 4. 通信机制详解

### 4.1 通信类型

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         扩展通信拓扑                                      │
│                                                                         │
│   ┌──────────────┐                        ┌──────────────┐             │
│   │    Popup     │                        │   Options    │             │
│   └──────┬───────┘                        └──────┬───────┘             │
│          │                                       │                      │
│          │  browser.runtime.sendMessage          │                      │
│          │  browser.runtime.connect              │                      │
│          ↓                                       ↓                      │
│   ┌─────────────────────────────────────────────────────────┐          │
│   │              Background Service Worker                  │          │
│   │  ┌─────────────────────────────────────────────────┐    │          │
│   │  │  onMessage.addListener                         │    │          │
│   │  │  onConnect.addListener                         │    │          │
│   │  │  tabs.sendMessage                              │    │          │
│   │  └─────────────────────────────────────────────────┘    │          │
│   └─────────────────────────────────────────────────────────┘          │
│          │                                       │                      │
│          │  browser.tabs.sendMessage             │                      │
│          ↓                                       ↓                      │
│   ┌──────────────┐                        ┌──────────────┐             │
│   │ Content      │  ←──────────────────→  │   Injected   │             │
│   │ Script       │     CustomEvent        │   Script     │             │
│   └──────────────┘                        └──────────────┘             │
│                                                                         │
│   Web Page Context                                                     │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2 消息通信模式

**模式一：请求-响应（Request-Response）**

```typescript
// 发送方
const response = await browser.runtime.sendMessage({
  type: 'FETCH_DATA',
  payload: { id: 123 }
});

// 接收方
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'FETCH_DATA') {
    const data = fetchData(message.payload.id);
    sendResponse(data);
    return true; // 异步响应
  }
});
```

**模式二：推送（Push）**

```typescript
// Background 主动推送
browser.tabs.sendMessage(tabId, {
  type: 'UPDATE_UI',
  payload: { status: 'synced' }
});

// Content Script 接收
browser.runtime.onMessage.addListener((message) => {
  if (message.type === 'UPDATE_UI') {
    updateUI(message.payload);
  }
});
```

**模式三：长连接（Long-lived Connection）**

```typescript
// 创建连接
const port = browser.runtime.connect({ name: 'popup-background' });

// 发送消息
port.postMessage({ type: 'START_SYNC' });

// 接收消息
port.onMessage.addListener((message) => {
  handleMessage(message);
});

// 监听断开
port.onDisconnect.addListener(() => {
  console.log('Connection lost');
});
```

### 4.3 为什么需要中转

**为什么 Popup 不能直接与 Content Script 通信？**

```
┌─────────────────────────────────────────────────────────────────┐
│  Popup 运行位置：chrome-extension://{id}/popup.html            │
│  Content Script 运行位置：https://example.com/ (网页上下文)     │
│                                                                 │
│  它们在不同的安全域中，浏览器强制隔离：                          │
│                                                                 │
│  1. 防护恶意扩展通过网页攻击                                      │
│  2. 防护恶意网页通过扩展获取权限                                  │
│  3. 确保扩展 API 不暴露给网页                                    │
└─────────────────────────────────────────────────────────────────┘
```

**中转的目的**：

| 目的 | 说明 |
|------|------|
| **安全隔离** | 验证请求来源和内容 |
| **统一日志** | 集中记录所有通信 |
| **错误处理** | 统一异常处理 |
| **状态管理** | 协调多个组件的状态 |
| **解耦** | 组件独立演进 |

### 4.4 消息通道类型对比

| 类型 | 使用场景 | 优点 | 缺点 |
|------|----------|------|------|
| `sendMessage` | 简单请求-响应 | 简单易用 | 每次新建连接 |
| `connect` | 持续通信 | 复用连接 | 需要管理连接 |
| `Native Messaging` | 与原生应用通信 | 可调用系统能力 | 配置复杂 |
| `Stream` | 大数据传输 | 内存效率高 | 较新，兼容性 |

---

## 5. 架构设计原则

### 5.1 核心原则

**原则一：Background 作为单一致入口**

```
┌─────────────────────────────────────────────────┐
│                 ✅ 推荐                         │
│                                                 │
│   Popup ──→ Background ──→ Content Script      │
│          ←──            ←──                    │
│                                                 │
│   所有通信经过 Background，统一处理             │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│                 ❌ 不推荐                       │
│                                                 │
│   Popup ──────────→ Content Script              │
│                                                 │
│   绕过 Background，失去控制和安全性             │
└─────────────────────────────────────────────────┘
```

**原则二：Content Script 保持轻量**

```typescript
// ✅ 推荐：Content Script 负责 DOM 操作，Background 负责逻辑
// content-script.ts
export default defineContentScript({
  main(ctx) {
    ctx.addMessageListener((msg) => {
      if (msg.type === 'RENDER_DATA') {
        renderData(msg.payload); // 只做渲染
      }
    });
  },
});

// background.ts
browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'FETCH_AND_RENDER') {
    const data = await fetchFromAPI(); // 业务逻辑
    browser.tabs.sendMessage(sender.tab.id, { 
      type: 'RENDER_DATA', 
      payload: data 
    });
  }
});
```

**原则三：状态分离**

```typescript
// ❌ 错误：在 Content Script 中存储大量状态
// content-script.ts
let appState = { users: [], config: {}, cache: {} }; // 内存不可靠

// ✅ 正确：使用 Storage
// content-script.ts
const settings = await browser.storage.local.get('settings');
const users = await browser.storage.local.get('users');

// background.ts - 使用 storage.defineItem
import { storage } from 'wxt/utils';

const settingsItem = storage.defineItem<Settings>('local:settings', {
  defaultValue: { theme: 'light', language: 'en' }
});
```

**原则四：接口契约化**

```typescript
// 定义消息类型
interface MessageMap {
  'GET_USER': { request: void; response: User };
  'UPDATE_USER': { request: User; response: boolean };
  'SYNC_DATA': { request: SyncRequest; response: SyncResult };
  'ERROR': { request: Error; response: void };
}

// 类型安全的发送和接收
type MessageType = keyof MessageMap;

function sendMessage<T extends MessageType>(
  type: T, 
  payload: MessageMap[T]['request']
): Promise<MessageMap[T]['response']> {
  return browser.runtime.sendMessage({ type, payload });
}

// 使用
const user = await sendMessage('GET_USER', undefined);
```

### 5.2 避免的反模式

**反模式一：Background 变成"神"**

```typescript
// ❌ 不好：Background 处理所有事情，包括 DOM 操作
browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'CREATE_DOM') {
    // Background 无法访问 DOM！
    document.createElement('div'); // 错误
  }
});

// ✅ 好：Background 协调，Content Script 执行
browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'CREATE_DOM') {
    browser.tabs.sendMessage(sender.tab.id, {
      type: 'EXECUTE_DOM',
      payload: msg.payload
    });
  }
});
```

**反模式二：忽略生命周期**

```typescript
// ❌ 不好：Service Worker 假设状态持久
let cachedData = null;
browser.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'GET_DATA') {
    if (cachedData) return cachedData; // 可能已丢失！
    cachedData = fetchData();
  }
});

// ✅ 好：始终从 Storage 读取
browser.runtime.onMessage.addListener(async (msg) => {
  if (msg.type === 'GET_DATA') {
    const cached = await browser.storage.local.get('cachedData');
    return cached.cachedData || fetchData();
  }
});
```

**反模式三：同步消息阻塞**

```typescript
// ❌ 不好：使用同步方式获取 Tab
const tab = browser.tabs.get(tabId); // 阻塞

// ✅ 好：异步获取
const tab = await browser.tabs.get(tabId);

// ✅ 更好：使用 tabs.query
const tabs = await browser.tabs.query({ active: true, currentWindow: true });
```

---

## 6. 常见架构模式

### 6.1 中央总线模式

```
┌─────────────────────────────────────────────────────────────┐
│                     Central Bus Pattern                     │
│                                                             │
│   ┌─────────┐   ┌─────────┐   ┌─────────┐                  │
│   │ Popup   │   │Content  │   │Options  │                  │
│   │         │   │ Script  │   │         │                  │
│   └────┬────┘   └────┬────┘   └────┬────┘                  │
│        │             │             │                        │
│        └─────────────┼─────────────┘                        │
│                      ↓                                      │
│            ┌─────────────────┐                               │
│            │    Background   │                               │
│            │   Message Bus   │                               │
│            │                 │                               │
│            │  - Route        │                               │
│            │  - Validate     │                               │
│            │  - Transform    │                               │
│            └────────┬────────┘                               │
│                     │                                       │
│        ┌────────────┼────────────┐                          │
│        ↓            ↓            ↓                          │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐                    │
│   │Storage  │  │External │  │  Tab    │                    │
│   │Service  │  │   API   │  │ Manager │                    │
│   └─────────┘  └─────────┘  └─────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

实现示例：

```typescript
// background.ts - 中央消息总线
export default defineBackground({
  main() {
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      const route = router.match(message.type);
      if (!route) {
        sendResponse({ error: 'Unknown message type' });
        return false;
      }

      // 验证
      if (!route.validate(message.payload)) {
        sendResponse({ error: 'Invalid payload' });
        return false;
      }

      // 执行业务逻辑
      route.handler(message.payload, sender)
        .then(result => sendResponse({ success: true, data: result }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      
      return true; // 异步响应
    });
  },
});

const router = {
  routes: new Map<string, Route>(),
  
  register(type: string, route: Route) {
    this.routes.set(type, route);
  },
  
  match(type: string) {
    return this.routes.get(type);
  }
};

// 注册路由
router.register('GET_TAB_DATA', {
  validate: (p) => !!p.tabId,
  handler: async (payload, sender) => {
    const response = await browser.tabs.sendMessage(payload.tabId, {
      type: 'GET_DATA'
    });
    return response;
  }
});
```

### 6.2 微前端模式

适用于复杂的扩展，每个功能模块独立：

```
┌──────────────────────────────────────────────────────┐
│               Micro-Frontend Pattern                 │
│                                                      │
│   entrypoints/                                        │
│   ├── features/                                       │
│   │   ├── analytics/     # 分析功能模块               │
│   │   │   ├── popup/                             │
│   │   │   ├── content/                           │
│   │   │   └── background/                         │
│   │   ├── bookmark/     # 书签功能模块             │
│   │   │   ├── popup/                             │
│   │   │   ├── content/                           │
│   │   │   └── background/                         │
│   │   └── settings/      # 设置功能模块             │
│   │       └── options.tsx                         │
│   ├── shared/            # 共享代码                 │
│   │   ├── components/                            │
│   │   ├── hooks/                                 │
│   │   └── utils/                                 │
│   └── main.ts             # 入口                    │
└──────────────────────────────────────────────────────┘
```

### 6.3 状态机模式

管理复杂的状态转换：

```typescript
// 使用 XState 或自定义状态机
interface ExtensionState {
  status: 'idle' | 'loading' | 'syncing' | 'error';
  lastSync: number | null;
  data: Data | null;
  error: Error | null;
}

type Event = 
  | { type: 'START_SYNC' }
  | { type: 'SYNC_SUCCESS'; data: Data }
  | { type: 'SYNC_ERROR'; error: Error }
  | { type: 'RESET' };

function reducer(state: ExtensionState, event: Event): ExtensionState {
  switch (event.type) {
    case 'START_SYNC':
      return { ...state, status: 'syncing' };
    case 'SYNC_SUCCESS':
      return { 
        ...state, 
        status: 'idle', 
        data: event.data, 
        lastSync: Date.now() 
      };
    case 'SYNC_ERROR':
      return { ...state, status: 'error', error: event.error };
    case 'RESET':
      return { status: 'idle', lastSync: null, data: null, error: null };
  }
}
```

---

## 7. 性能与安全优化

### 7.1 性能优化

**优化一：减少消息传递**

```typescript
// ❌ 不好：频繁小消息
for (const item of items) {
  await browser.tabs.sendMessage(tabId, { type: 'ADD_ITEM', item });
}

// ✅ 好：批量消息
browser.tabs.sendMessage(tabId, { 
  type: 'SET_ITEMS', 
  items 
});
```

**优化二：使用 Port 连接**

```typescript
// 建立连接后复用
const port = browser.tabs.connect(tabId, { name: 'data-sync' });
port.postMessage({ type: 'INIT' });

// 后续消息复用同一连接
port.postMessage({ type: 'UPDATE', data: ... });
```

**优化三：Content Script 懒加载**

```typescript
// wxt.config.ts
export default defineConfig({
  contentScripts: {
    // 只有匹配时才注入
    matches: ['*://*.specific-site.com/*'],
  },
});
```

### 7.2 安全最佳实践

**原则一：最小权限**

```typescript
// wxt.config.ts
export default defineConfig({
  manifest: {
    // 只请求需要的权限
    permissions: ['storage', 'activeTab'],
    host_permissions: ['*://*.example.com/*'], // 限制范围
  },
});
```

**原则二：验证所有输入**

```typescript
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 验证消息来源
  if (!sender.id || sender.id !== browser.runtime.id) {
    sendResponse({ error: 'Unauthorized' });
    return false;
  }

  // 验证消息内容
  if (!isValidMessage(message)) {
    sendResponse({ error: 'Invalid message' });
    return false;
  }

  // 处理
});
```

**原则三：避免 XSS**

```typescript
// ❌ 危险：直接插入用户输入
element.innerHTML = userInput;

// ✅ 安全：使用 textContent
element.textContent = userInput;

// 或使用 DOM API
const div = document.createElement('div');
div.textContent = userInput;
element.appendChild(div);
```

---

## 8. 测试策略

### 8.1 测试金字塔

```
         ┌─────────────┐
         │    E2E      │  ← Playwright
         │   Tests     │
       ┌─┴─────────────┴─┐
       │  Integration    │  ← Vitest + FakeBrowser
       │    Tests        │
     ┌─┴─────────────────┴─┐
     │     Unit Tests      │  ← Vitest
     └─────────────────────┘
```

### 8.2 单元测试

```typescript
// tests/utils.test.ts
import { describe, it, expect } from 'vitest';
import { formatMessage, validatePayload } from '../utils/message';

describe('Message Utils', () => {
  it('should format message correctly', () => {
    const msg = formatMessage('TEST', { id: 1 });
    expect(msg.type).toBe('TEST');
    expect(msg.timestamp).toBeDefined();
  });

  it('should validate valid payload', () => {
    const result = validatePayload({ type: 'TEST' }, { type: 'string' });
    expect(result.valid).toBe(true);
  });
});
```

### 8.3 集成测试

```typescript
// tests/integration.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { FakeBrowser } from 'wxt/testing';

describe('Background Integration', () => {
  const browser = new FakeBrowser();

  beforeEach(() => {
    browser.reset();
  });

  it('should handle message from content script', async () => {
    // 模拟 content script 发送消息
    const [bg] = browser.getBackgroundContexts();
    
    // 触发消息
    await bg.emitMessage({ type: 'GET_STATUS' }, {
      id: 'tab-1',
      url: 'https://example.com'
    });

    // 验证响应
    const response = await bg.getLastMessage();
    expect(response.type).toBe('STATUS_RESPONSE');
  });
});
```

### 8.4 E2E 测试

```typescript
// e2e/extension.test.ts
import { test, expect } from '@playwright/test';

test('complete user flow', async ({ page }) => {
  // 1. 打开网页
  await page.goto('https://example.com');
  
  // 2. 注入内容脚本
  const response = await page.evaluate(() => {
    return new Promise((resolve) => {
      const port = chrome.runtime.connect({ name: 'test' });
      port.onMessage.addListener((msg) => resolve(msg));
      port.postMessage({ type: 'INIT' });
    });
  });
  
  expect(response.type).toBe('INIT_COMPLETE');
  
  // 3. 打开 Popup
  await page.click('[data-extension-id]="ext-id"');
  
  // 4. 验证 Popup 内容
  await expect(page.locator('.popup-status')).toContainText('Active');
});
```

---

## 总结

浏览器扩展的架构设计围绕三个核心原则：

1. **安全隔离**：Extension Context 与 Web Page Context 严格分离
2. **解耦通信**：Background 作为消息路由中心
3. **状态分离**：持久状态在 Storage，运行时状态在内存

遵循这些原则，可以构建出高性能、安全、可维护的浏览器扩展应用。

---

## 参考资料

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [MDN WebExtensions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [WXT Framework](https://wxt.dev/)
- [Extension Workshop](https://extensionworkshop.com/)