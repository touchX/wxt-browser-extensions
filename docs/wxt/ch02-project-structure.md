# 第二章：项目结构与入口点

本章将深入介绍 WXT 的项目结构和入口点（Entrypoints）概念，这是掌握 WXT 开发的核心基础。

## 2.1 WXT 项目目录结构

### 2.1.1 默认项目结构

WXT 使用扁平化的目录结构，所有源代码直接放在根目录下：

```
my-extension/
├── .output/              # 构建输出目录
├── .wxt/                 # WXT 内部文件（不要手动修改）
├── assets/               # 静态资源目录
│   └── icon.png          # 扩展图标
├── components/           # Vue/React 组件
├── composables/          # Vue/React 组合式函数
├── entrypoints/          # 入口点目录（核心！）
│   ├── background.ts     # 后台脚本
│   ├── popup/            # 弹出页面
│   │   ├── index.html
│   │   ├── main.ts
│   │   └── style.css
│   └── content/         # 内容脚本
│       └── index.ts
├── hooks/                # 自定义 WXT 钩子
├── modules/              # WXT 模块
├── public/              # 公共静态资源
├── utils/                # 工具函数
├── .env                  # 环境变量
├── .env.publish          # 发布环境变量
├── app.config.ts         # 应用配置（Vite/框架）
├── package.json          # 项目配置
├── tsconfig.json         # TypeScript 配置
├── wxt.config.ts         # WXT 配置
└── web-ext.config.ts     # web-ext 工具配置
```

### 2.1.2 使用 src 目录

如果您喜欢将源代码放在 `src/` 目录下，可以在 `wxt.config.ts` 中配置：

```typescript
// wxt.config.ts
export default defineConfig({
  srcDir: 'src',
});
```

配置后的结构：

```
my-extension/
├── .output/
├── .wxt/
├── modules/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── composables/
│   ├── entrypoints/
│   ├── hooks/
│   ├── utils/
│   └── app.config.ts
├── .env
├── .env.publish
├── package.json
└── wxt.config.ts
```

> **提示**：`.env` 和 `wxt.config.ts` 等配置文件必须放在根目录，不能放在 `src/` 中。

### 2.1.3 目录说明

| 目录 | 说明 | 是否必需 |
|------|------|----------|
| `entrypoints/` | 所有入口点文件 | ✅ 必需 |
| `public/` | 不经过处理的静态文件 | 可选 |
| `assets/` | 需要处理的静态资源（图片等） | 可选 |
| `components/` | UI 组件 | 可选 |
| `composables/` | 组合式函数 | 可选 |
| `hooks/` | 自定义 WXT 钩子 | 可选 |
| `modules/` | WXT 模块 | 可选 |
| `utils/` | 工具函数 | 可选 |

## 2.2 入口点（Entrypoints）概念

### 2.2.1 什么是入口点

入口点是 WXT 中定义扩展功能的入口文件。WXT 会根据 `entrypoints/` 目录下的文件自动生成 `manifest.json`，无需手动配置。

### 2.2.2 入口点文件命名规则

入口点文件名遵循 `{name}.{ext}` 的格式，其中：
- **name**：入口点名称，决定在 manifest 中的键名
- **扩展名**：决定入口点类型

| 扩展名 | 入口点类型 |
|--------|-----------|
| `.ts` | 后台脚本（Background Script） |
| `.html` | 页面（Popup、Options、Standalone） |
| `.vue`/.`jsx`/.`tsx` | 页面（支持框架） |
| `.css` | 样式注入 |

### 2.2.3 入口点定义方式

入口点可以定义为**单个文件**或**目录**：

**单个文件方式：**
```
entrypoints/
├── popup.ts
├── background.ts
└── content.ts
```

**目录方式（推荐，用于复杂入口点）：**
```
entrypoints/
├── popup/
│   ├── index.html    ← 入口文件
│   ├── main.ts
│   ├── style.css
│   └── components/
└── background/
    ├── index.ts      ← 入口文件
    ├── alarms.ts
    └── messaging.ts
```

## 2.3 入口点类型详解

### 2.3.1 Popup（弹出页面）

Popup 是用户点击扩展图标时显示的界面。

**创建方式：** 在 `entrypoints/` 目录下创建 `.html`、`.vue`、`.jsx` 或 `.tsx` 文件。

```html
<!-- entrypoints/popup.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>我的扩展</title>
</head>
<body>
  <h1>Hello WXT!</h1>
  <button id="btn">点击我</button>
  <script type="module" src="./main.ts"></script>
</body>
</html>
```

**配置 Manifest 选项（通过 meta 标签）：**

```html
<head>
  <!-- 设置 manifest 中的 default_title -->
  <title>Popup 标题</title>
  
  <!-- 设置图标 -->
  <meta name="manifest.default_icon" content='{"16": "/icon-16.png", "32": "/icon-32.png"}'>
  
  <!-- 设置类型：page_action 或 browser_action -->
  <meta name="manifest.type" content="page_action">
  
  <!-- Firefox：设置按钮位置 -->
  <meta name="manifest.default_area" content="navbar">
  
  <!-- Firefox：设置主题图标（明暗主题） -->
  <meta name="manifest.theme_icons" content='[{"light": "/icon-light.png", "dark": "/icon-dark.png", "size": 16}]'>
</head>
```

### 2.3.2 Background Script（后台脚本）

Background Script 在扩展安装后一直运行，用于处理后台任务。

**创建方式：** 创建 `background.ts` 文件。

```typescript
// entrypoints/background.ts
export default defineBackground({
  // Manifest V3 配置
  persistent: false,  // false = Service Worker (MV3), true = 持久运行 (MV2)
  type: 'module',     // 使用 ES Modules
  
  main() {
    // 监听扩展安装
    console.log('扩展已安装');
    
    // 监听消息
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'ping') {
        sendResponse({ pong: true });
      }
    });
    
    // 监听标签页更新
    browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete') {
        console.log('页面加载完成:', tab.url);
      }
    });
  },
});
```

> **重要**：Background script 的 main 函数**不能是异步**的。

### 2.3.3 Content Script（内容脚本）

Content Script 运行在网页上下文中，可以访问和修改页面内容。

**创建方式：** 创建 `{name}.content.ts` 文件。

```typescript
// entrypoints/example.content.ts
export default defineContentScript({
  // 匹配规则：哪些页面加载此脚本
  matches: ['*://*.example.com/*', '*://example.org/*'],
  
  // 排除规则
  excludeMatches: ['*://admin.example.com/*'],
  
  // glob 匹配
  includeGlobs: ['*://*.example.com/news/*'],
  excludeGlobs: ['*://*.example.com/*/draft/*'],
  
  // 是否在所有帧中运行
  allFrames: false,
  
  // 注入时机：document_start | document_end | document_idle
  runAt: 'document_idle',
  
  // CSS 注入模式：manifest | manual | ui
  cssInjectionMode: 'manifest',
  
  main(ctx) {
    // 创建DOM元素
    const button = document.createElement('button');
    button.textContent = 'Click me';
    button.addEventListener('click', () => {
      console.log('Button clicked!');
    });
    document.body.appendChild(button);
  },
});
```

### 2.3.4 Options（选项页面）

Options 页面是用户配置扩展设置的界面。

**创建方式：** 创建 `options.html` 或 `options.tsx` 等。

```html
<!-- entrypoints/options.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>扩展设置</title>
</head>
<body>
  <h1>设置</h1>
  <form id="settings">
    <label>
      <input type="checkbox" name="enabled"> 启用扩展
    </label>
    <label>
      主题：
      <select name="theme">
        <option value="light">浅色</option>
        <option value="dark">深色</option>
      </select>
    </label>
    <button type="submit">保存</button>
  </form>
  <script type="module" src="./main.ts"></script>
</body>
</html>
```

### 2.3.5 New Tab Page（新标签页）

用自己的页面替代浏览器的新标签页。

**创建方式：** 创建 `newtab.html` 或 `newtab.tsx` 等。

```html
<!-- entrypoints/newtab.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>新标签页</title>
</head>
<body>
  <h1>欢迎使用新标签页</h1>
  <div id="bookmarks"></div>
</body>
</html>
```

### 2.3.6 Side Panel（侧边栏）

Chrome 120+ 支持的侧边栏功能。

**创建方式：** 创建 `sidepanel.html` 或 `sidepanel.tsx`。

```html
<!-- entrypoints/sidepanel.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>侧边栏</title>
</head>
<body>
  <h1>侧边栏内容</h1>
</body>
</html>
```

### 2.3.7 DevTools（开发者工具）

创建自定义的开发者工具面板。

**创建方式：** 创建 `devtools.html`。

```html
<!-- entrypoints/devtools.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>自定义 DevTools</title>
</head>
<body>
  <h1>自定义面板</h1>
</body>
</html>
```

## 2.4 入口点的高级配置

### 2.4.1 include/exclude 过滤器

可以根据浏览器决定是否包含某个入口点：

```typescript
// 仅在 Chrome 和 Edge 中包含
export default defineBackground({
  include: ['chrome', 'edge'],
  main() { /* ... */ },
});

// 排除 Firefox
export default defineContentScript({
  exclude: ['firefox'],
  matches: ['*://*/*'],
  main() { /* ... */ },
});
```

### 2.4.2 入口点目录结构示例

将相关文件组织在入口点目录中：

```
entrypoints/
├── popup/              # Popup 入口点
│   ├── index.html      # 主入口
│   ├── App.vue         # Vue 组件
│   ├── main.ts         # 入口脚本
│   └── style.css       # 样式
├── background/         # 后台脚本
│   ├── index.ts        # 主入口
│   ├── alarms.ts       # 闹钟功能
│   └── messaging.ts     # 消息处理
├── content.youtube/    # YouTube 内容脚本
│   ├── index.ts        # 主入口
│   ├── style.css       # 注入样式
│   └── utils.ts        # 工具函数
└── options/            # 选项页面
    ├── index.tsx       # 主入口（React）
    └── components/
        └── Settings.tsx
```

### 2.4.3 unlisted 脚本

使用 `defineUnlistedScript` 创建不注册到 manifest 的脚本：

```typescript
// 用于与内容脚本通信的主世界脚本
// entrypoints/example-main-world.ts
export default defineUnlistedScript(() => {
  const script = document.currentScript;

  script?.addEventListener('from-content-script', (event) => {
    if (event instanceof CustomEvent) {
      console.log('收到消息:', event.detail);
    }
  });
});
```

配合内容脚本使用：

```typescript
// entrypoints/example.content.ts
export default defineContentScript({
  matches: ['*://*/*'],
  async main() {
    const { script } = await injectScript('/example-main-world.js');
    
    // 发送消息到主世界脚本
    script.dispatchEvent(
      new CustomEvent('from-content-script', {
        detail: 'Hello from content script!',
      }),
    );
  },
});
```

## 2.5 Manifest 配置

### 2.5.1 自动生成的 Manifest

WXT 会根据 `entrypoints/` 目录自动生成 `manifest.json`，包括：
- `permissions`
- `host_permissions`
- `content_scripts`
- `background.service_worker` 或 `background.scripts`
- `action` (popup)
- `options_page` / `options_ui`
- 等等

### 2.5.2 自定义 Manifest 配置

在 `wxt.config.ts` 中自定义 manifest：

```typescript
// wxt.config.ts
import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: '我的扩展',
    description: '这是一个示例扩展',
    version: '1.0.0',
    author: 'Your Name',
    homepage_url: 'https://example.com',
    
    // 添加额外权限
    permissions: ['storage', 'tabs'],
    host_permissions: ['*://*.example.com/*'],
    
    // 自定义图标
    icons: {
      16: '/assets/icon-16.png',
      48: '/assets/icon-48.png',
      128: '/assets/icon-128.png',
    },
  },
});
```

## 2.6 本章小结

本章我们学习了：
- ✅ WXT 项目的默认目录结构
- ✅ src 目录的配置方式
- ✅ 入口点的概念和命名规则
- ✅ 各种入口点类型的创建方法（Popup、Background、Content Script、Options 等）
- ✅ 入口点的高级配置（include/exclude、目录组织）
- ✅ Manifest 的自动生成和自定义配置

### 下一步

下一章我们将学习 WXT 的**核心功能与 API**，包括内容脚本、后台脚本、存储 API 和消息通信机制。

---

**参考资料**：
- [WXT 入口点文档](https://wxt.dev/guide/essentials/entrypoints)
- [WXT 项目结构文档](https://wxt.dev/guide/essentials/project-structure)