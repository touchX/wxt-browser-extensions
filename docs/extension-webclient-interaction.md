# 扩展、WebClient、Server 三者交互设计

> 设计目标：从扩展控制 WebClient 页面

## 1. 架构概述

```
┌─────────────────────────────────────────────────────────────────────┐
│                        wxt-browser-extensions                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐         │
│  │   server     │    │   webclient  │    │  extension   │         │
│  │   (Hono)     │◀──▶│   (Vue 3)    │    │    (WXT)     │         │
│  └──────────────┘    └──────┬───────┘    └──────┬───────┘         │
│         │                   │                   │                  │
│         │              ┌────▼────┐              │                  │
│         │              │ 共享配置 │              │                  │
│         │              │(shared) │              │                  │
│         │              └─────────┘              │                  │
│         └──────────────────┼───────────────────┘                  │
│                            │                                       │
└────────────────────────────┼───────────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   消息通信层      │
                    │  (Message Bus)   │
                    └─────────────────┘
```

## 2. 交互场景

### 场景：从扩展控制 WebClient

```
┌─────────────────────────────────────────────────────────────────────┐
│                          用户操作流程                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. 用户打开 WebClient 页面                                          │
│     ┌──────────────────────────────────┐                           │
│     │        https://localhost:5173    │ ◀─── content script 注入  │
│     │         WebClient Dashboard      │                           │
│     └──────────────────────────────────┘                           │
│                                                                      │
│  2. 用户点击扩展图标 → 打开 Popup                                     │
│     ┌──────────┐                                                    │
│     │  WXT     │                                                    │
│     │ Popup    │ ◀─── 用户点击"刷新页面"按钮                         │
│     └────┬─────┘                                                    │
│          │                                                          │
│          ▼ 3. Popup → Background (chrome.runtime.sendMessage)        │
│     ┌──────────────┐                                                │
│     │ Background   │                                                │
│     │ Service Worker│                                               │
│     └──────┬───────┘                                                │
│            │                                                         │
│            ▼ 4. Background → Content Script (chrome.tabs.sendMessage)│
│     ┌──────────────────────────────────┐                           │
│     │        https://localhost:5173    │                           │
│     │         Dashboard (iframe)       │ ◀─── window.postMessage   │
│     └──────────────────────────────────┘                           │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## 3. 消息协议设计

### 3.1 消息格式

```typescript
// 扩展 → WebClient 消息格式
interface ExtensionMessage {
  type: 'REFRESH_DATA' | 'OPEN_SETTINGS' | 'NOTIFY_STATUS' | 'SYNC_STATE'
  payload: {
    timestamp?: number
    source?: 'extension'
    data?: unknown
  }
}

// WebClient → 扩展 响应格式
interface WebClientResponse {
  type: 'ACTION_COMPLETED' | 'ACTION_FAILED'
  payload: {
    success: boolean
    message?: string
  }
}
```

### 3.2 控制命令

| 命令 | 说明 | 用途 |
|------|------|------|
| `REFRESH_DATA` | 刷新数据 | 触发 webclient 重新获取 API 数据 |
| `OPEN_SETTINGS` | 打开设置 | 导航到 webclient 设置页面 |
| `SYNC_STATE` | 同步状态 | 将扩展状态同步到 webclient |
| `NOTIFY_STATUS` | 通知状态 | 在页面显示状态通知 |

## 4. 组件职责

### 4.1 Extension (扩展)

| 文件 | 职责 |
|------|------|
| `popup/main.ts` | 发送控制命令到 background |
| `background/index.ts` | 转发消息到指定 tab 的 content script |
| `content/content.ts` | 监听 background 消息，转发到页面 |

### 4.2 WebClient

| 文件 | 职责 |
|------|------|
| `src/App.vue` | 添加 postMessage 监听器 |
| `src/composables/useExtension.ts` | 封装扩展通信逻辑 |
| `src/views/Dashboard.vue` | 响应扩展命令刷新数据 |

### 4.3 Server

| 端点 | 说明 |
|------|------|
| `/api/status` | 返回扩展连接状态 |
| `/api/extension-status` | 存储/查询扩展状态（可选）|

## 5. 数据流

```
┌────────────┐     JSON Message      ┌────────────┐     sendMessage    ┌────────────┐
│  Popup     │ ───────────────────▶  │  Background │ ────────────────▶  │  Content   │
│            │   type: REFRESH_DATA  │   Service   │   type: REFRESH_DATA│   Script   │
└────────────┘                       └────────────┘                    └──────┬─────┘
                                                                              │
                                                                              ▼
                                                                       ┌────────────┐
                                                                       │  WebClient  │
                                                                       │   (Vue App) │
                                                                       └──────┬─────┘
                                                                              │
                                                                              ▼
                                                                       ┌────────────┐
                                                                       │  API 刷新   │
                                                                       └──────┬─────┘
                                                                              │
                                                                              ▼
                                                                       ┌────────────┐
                                                                       │   Server   │
                                                                       └────────────┘
```

## 6. 安全性考虑

### 6.1 消息来源验证

```typescript
// Content Script 中验证消息来源
window.addEventListener('message', (event) => {
  // 仅接受来自同源页面的消息
  if (event.origin !== window.location.origin) return

  // 验证消息格式
  if (!event.data?.type) return

  // 处理消息
  handleExtensionMessage(event.data)
})
```

### 6.2 Content Script 安全

- 仅在特定域名注入 (`localhost:5173`)
- 使用 `runAt: 'document_idle'` 确保页面加载完成

## 7. 错误处理

| 错误场景 | 处理方式 |
|----------|----------|
| WebClient 未打开 | background 返回错误，popup 显示提示 |
| Content Script 未注入 | 使用 `tabs.sendMessage` 错误回调处理 |
| 消息超时 | 5秒超时，popup 显示"操作失败" |

## 8. 扩展状态

通过 `chrome.storage` 存储扩展状态，供多组件共享：

```typescript
// 存储结构
interface ExtensionState {
  serverUrl: string
  autoStart: boolean
  showBadge: boolean
  lastSyncTime: number
  connectedClients: number
}
```

## 9. 相关文件

- `apps/extension/entrypoints/popup/main.ts`
- `apps/extension/entrypoints/background/index.ts`
- `apps/extension/entrypoints/content/content.ts`
- `apps/webclient/src/App.vue`
- `apps/webclient/src/composables/useExtension.ts`
- `apps/server/src/routes/extension.ts` (新建)

---

*创建时间: 2026-04-06*
*设计版本: v1.0*