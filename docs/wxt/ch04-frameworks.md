# 第四章：前端框架集成

WXT 支持多种前端框架，让您可以使用熟悉的工具链来构建扩展界面。本章将介绍如何集成 React、Vue、Svelte 等主流框架。

## 4.1 支持的前端框架

WXT 基于 Vite 构建，原生支持以下框架：

| 框架 | 支持情况 | 备注 |
|------|----------|------|
| React | ✅ 原生支持 | 最常用 |
| Vue | ✅ 原生支持 | 3.x 和 2.x |
| Svelte | ✅ 原生支持 | 3.x 和 4.x |
| Preact | ✅ 原生支持 | 轻量级 React |
| Solid | ✅ 原生支持 | 高性能 |
| vanilla | ✅ 默认 | 纯 JavaScript |

### 4.1.1 安装框架支持

WXT 项目初始化时可以选择框架，或者手动安装：

```bash
# React
pnpm add react react-dom
pnpm add -D @types/react @types/react-dom @vitejs/plugin-react

# Vue
pnpm add vue
pnpm add -D @vitejs/plugin-vue

# Svelte
pnpm add -D @sveltejs/vite-plugin-svelte svelte
```

## 4.2 React 集成

### 4.2.1 创建 React 入口点

在 `entrypoints/` 目录下创建 `.tsx` 文件：

```tsx
// entrypoints/popup.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
```

```tsx
// entrypoints/App.tsx
import React, { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: '20px', minWidth: '300px' }}>
      <h1>WXT + React</h1>
      <p>计数器: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>
        增加
      </button>
    </div>
  );
}
```

```html
<!-- entrypoints/popup.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Popup</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="./popup.tsx"></script>
</body>
</html>
```

### 4.2.2 配置 React

在 `wxt.config.ts` 中添加 React 插件：

```typescript
// wxt.config.ts
import { defineConfig } from 'wxt';
import react from '@vitejs/plugin-react';

export default defineConfig({
  vite: {
    plugins: [react()],
  },
});
```

### 4.2.3 使用 WXT Hooks in React

```tsx
// entrypoints/components/Counter.tsx
import { useWxtInternal } from '#imports';

export function Counter() {
  const { version } = useWxtInternal();
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>WXT 版本: {version}</p>
      <p>计数: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>
        点击
      </button>
    </div>
  );
}
```

### 4.2.4 React 路由

可以使用 `wxt/router` 或客户端路由库：

```tsx
// entrypoints/popup.tsx
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import PageA from './pages/PageA';
import PageB from './pages/PageB';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<PageA />} />
        <Route path="/page-b" element={<PageB />} />
      </Routes>
    </HashRouter>
  );
}
```

## 4.3 Vue 集成

### 4.3.1 创建 Vue 入口点

```vue
<!-- entrypoints/popup.vue -->
<template>
  <div class="popup">
    <h1>WXT + Vue</h1>
    <p>计数器: {{ count }}</p>
    <button @click="increment">增加</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const count = ref(0);

function increment() {
  count.value++;
}
</script>

<style scoped>
.popup {
  padding: 20px;
  min-width: 300px;
}

button {
  margin-top: 10px;
}
</style>
```

### 4.3.2 配置 Vue

```typescript
// wxt.config.ts
import { defineConfig } from 'wxt';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  vite: {
    plugins: [vue()],
  },
});
```

### 4.3.3 使用 WXT 组合式 API

```vue
<!-- entrypoints/components/Status.vue -->
<template>
  <div class="status">
    <p>扩展版本: {{ internal.version }}</p>
    <p>浏览器: {{ internal.browser }}</p>
  </div>
</template>

<script setup>
import { useWxtInternal } from '#imports';

const internal = useWxtInternal();
</script>
```

### 4.3.4 Vue 3 组件库集成

```bash
# 安装 Element Plus
pnpm add element-plus
```

```typescript
// wxt.config.ts
import { defineConfig } from 'wxt';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';

export default defineConfig({
  vite: {
    plugins: [
      vue(),
      AutoImport({
        imports: ['vue', 'vue-router', 'element-plus'],
      }),
      Components({
        dts: true,
      }),
    ],
  },
});
```

## 4.4 Svelte 集成

### 4.4.1 创建 Svelte 入口点

```svelte
<!-- entrypoints/popup.svelte -->
<script>
  let count = 0;
  
  function increment() {
    count += 1;
  }
</script>

<main>
  <h1>WXT + Svelte</h1>
  <p>计数器: {count}</p>
  <button on:click={increment}>
    增加
  </button>
</main>

<style>
  main {
    padding: 20px;
    min-width: 300px;
  }
  
  button {
    margin-top: 10px;
  }
</style>
```

### 4.4.2 配置 Svelte

```typescript
// wxt.config.ts
import { defineConfig } from 'wxt';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  vite: {
    plugins: [svelte()],
  },
});
```

### 4.4.3 Svelte 组件示例

```svelte
<!-- entrypoints/components/Header.svelte -->
<script>
  export let title = 'Default Title';
</script>

<header>
  <h2>{title}</h2>
</header>

<style>
  header {
    background: #f5f5f5;
    padding: 10px;
    margin-bottom: 10px;
  }
</style>
```

## 4.5 使用组件和样式

### 4.5.1 全局样式

在 `entrypoints/` 目录下的 `styles.css` 会自动被注入：

```css
/* entrypoints/popup/styles.css */
:root {
  --primary-color: #007bff;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  margin: 0;
  padding: 0;
}
```

### 4.5.2 组件目录结构

```
entrypoints/
├── popup/
│   ├── index.html      # 入口 HTML
│   ├── App.vue         # 主组件
│   ├── components/
│   │   ├── Header.vue
│   │   ├── Button.vue
│   │   └── List.vue
│   ├── composables/
│   │   └── useTheme.ts
│   └── styles.css      # 全局样式
└── options/
    ├── index.tsx
    └── components/
        └── Settings.tsx
```

### 4.5.3 共享组件

在项目根目录创建 `components/` 目录供所有入口点共享：

```
my-extension/
├── components/           # 共享组件
│   ├── Button.tsx
│   ├── Modal.tsx
│   └── Input.tsx
├── entrypoints/
│   ├── popup/
│   └── options/
└── wxt.config.ts
```

## 4.6 自动导入

WXT 支持类似 Nuxt 的自动导入功能，自动导入以下内容：

- **Vue/React 组合式函数**：如 `ref`, `computed`, `useState` 等
- **WXT 工具函数**：如 `storage`, `getCurrentTab` 等

### 4.6.1 自定义自动导入

```typescript
// wxt.config.ts
import { defineConfig } from 'wxt';

export default defineConfig({
  imports: {
    // 添加自定义自动导入
    presets: ['vue', 'react'],
    
    // 添加自定义工具
    utils: {
      myUtil: './utils/my-util.ts',
    },
  },
});
```

### 4.6.2 显式导入

如果需要禁用自动导入，可以显式导入：

```typescript
import { ref, computed } from 'vue';  // 显式导入
```

## 4.7 UI 框架集成

### 4.7.1 Tailwind CSS

```bash
pnpm add -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

```typescript
// wxt.config.ts
import { defineConfig } from 'wxt';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    css: {
      postcss: {
        plugins: [autoprefixer()],
      },
    },
  },
});
```

```javascript
// tailwind.config.js
module.exports = {
  content: ['./entrypoints/**/*.{html,js,ts,jsx,tsx,vue}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

### 4.7.2 UnoCSS

```bash
pnpm add -D unocss @wxt-dev/unocss
```

```typescript
// wxt.config.ts
import { defineConfig } from 'wxt';
import UnoCSS from '@wxt-dev/unocss';

export default defineConfig({
  modules: [UnoCSS()],
});
```

## 4.8 本章小结

本章我们学习了：
- ✅ WXT 支持的框架（React、Vue、Svelte 等）
- ✅ React 集成：创建入口点、配置、Hooks
- ✅ Vue 集成：创建组件、使用组合式 API
- ✅ Svelte 集成：创建组件和样式
- ✅ 自动导入功能
- ✅ UI 框架集成（Tailwind、UnoCSS）

### 下一步

下一章我们将学习 WXT 的**高级功能**，包括模块系统、自动化发布、测试等。

---

**参考资料**：
- [WXT 前端框架文档](https://wxt.dev/guide/essentials/frontend-frameworks)
- [Vite 插件文档](https://vitejs.dev/plugins.html)