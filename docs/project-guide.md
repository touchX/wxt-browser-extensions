# WXT Browser Extensions - 项目使用指南

> 基于 WXT、Hono 和 Vue 3 的浏览器扩展 Monorepo 项目

## GitHub

- **仓库**: https://github.com/touchX/wxt-browser-extensions
- **PR**: https://github.com/touchX/wxt-browser-extensions/pull/1

## 目录

- [项目概述](#项目概述)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [开发指南](#开发指南)
- [应用详解](#应用详解)
- [API 文档](#api-文档)
- [构建与部署](#构建与部署)
- [故障排查](#故障排查)
- [最佳实践](#最佳实践)

---

## 项目概述

本项目是一个基于 pnpm workspace 的 Monorepo，实现了完整的浏览器扩展系统，包含三个核心应用：

| 应用 | 说明 | 端口 |
|------|------|------|
| **Extension** | 浏览器扩展，提供快捷操作 | - |
| **Server** | 后端 API 和数据服务 | 3000 |
| **Web Client** | 管理仪表板 Web 应用 | 5173 |

### 应用架构图

```
┌─────────────────┐     ┌─────────────────┐
│   Browser       │     │   Web Client    │
│   Extension     │     │   (Dashboard)   │
│                 │     │   Port: 5173    │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     │
         ┌───────────▼───────────┐
         │      Server API       │
         │      (Hono)          │
         │      Port: 3000      │
         └───────────────────────┘
                     │
         ┌───────────▼───────────┐
         │     Shared Types     │
         │   & Utilities        │
         └───────────────────────┘
```

---

## 技术栈

### 核心技术

| 类别 | 技术 | 版本 |
|------|------|------|
| **包管理器** | pnpm | 10.30.3 |
| **语言** | TypeScript | ^5.3.0 |
| **Node.js** | Node.js | 18+ |

### 各应用技术栈

**Extension**
- WXT ^0.19.0 - 浏览器扩展框架
- Vue 3 ^3.4.0 - UI 框架
- Manifest v3 - 扩展清单

**Server**
- Hono ^4.0.0 - Web 框架
- tsx ^4.0.0 - TypeScript 执行器

**Web Client**
- Vue 3 ^3.5.13 - UI 框架
- Vue Router ^4.5.0 - 路由
- Pinia ^2.2.8 - 状态管理
- Vite ^6.2.0 - 构建工具

**Shared**
- TypeScript - 类型定义
- 共享工具函数

---

## 项目结构

```
wxt-browser-extensions/
├── apps/
│   ├── extension/           # 浏览器扩展
│   │   ├── entrypoints/
│   │   │   ├── popup.html    # 弹出页面
│   │   │   ├── popup/        # 弹出页面组件
│   │   │   └── background.ts # 后台脚本
│   │   ├── wxt.config.ts     # WXT 配置
│   │   └── package.json
│   │
│   ├── server/              # 后端服务
│   │   ├── src/
│   │   │   ├── index.ts      # 服务入口
│   │   │   └── routes/       # API 路由
│   │   └── package.json
│   │
│   └── webclient/           # Web 客户端
│       ├── src/
│       │   ├── views/       # 页面视图
│       │   │   ├── Dashboard.vue
│       │   │   └── Settings.vue
│       │   ├── router/      # 路由配置
│       │   └── stores/      # Pinia 状态
│       └── package.json
│
├── packages/
│   └── shared/              # 共享代码
│       ├── src/
│       │   ├── types/       # 类型定义
│       │   ├── utils/       # 工具函数
│       │   └── index.ts
│       └── package.json
│
├── pnpm-workspace.yaml      # Workspace 配置
├── pnpm-lock.yaml           # 依赖锁文件
├── package.json             # 根 package.json
├── tsconfig.base.json       # TS 基础配置
└── README.md
```

---

## 快速开始

### 前置要求

- **Node.js** 18 或更高版本
- **pnpm** 10.30.3 或更高版本

### 安装

```bash
# 克隆项目
git clone <repository-url>
cd wxt-browser-extensions

# 安装依赖
pnpm install
```

### 开发模式

```bash
# 启动所有应用（并行）
pnpm dev

# 这将启动：
# - Server on http://localhost:3000
# - Web Client on http://localhost:5173
# - Extension (需要加载到浏览器)
```

### 单独启动应用

```bash
# Server
pnpm --filter @wxt-ext/server dev
# 访问: http://localhost:3000

# Web Client
pnpm --filter @wxt-ext/webclient dev
# 访问: http://localhost:5173

# Extension
pnpm --filter @wxt-ext/extension dev
# 在浏览器中加载 .wxt-dev 目录
```

### 加载扩展到浏览器

**Chrome/Edge:**
1. 打开 `chrome://extensions/`
2. 启用"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择 `apps/extension/.wxt-dev/chrome-mv3`

**Firefox:**
1. 打开 `about:debugging#/runtime/this-firefox`
2. 点击"临时载入附加组件"
3. 选择 `apps/extension/.wxt-dev/firefox-mv3/manifest.json`

---

## 开发指南

### 可用脚本

**根目录脚本**

```bash
pnpm dev          # 启动所有应用（并行）
pnpm build        # 构建所有包
pnpm test         # 运行所有测试
pnpm lint         # 运行所有 lint
pnpm clean        # 清理构建产物和 node_modules
```

**各应用脚本**

```bash
# Extension
pnpm --filter @wxt-ext/extension dev
pnpm --filter @wxt-ext/extension build
pnpm --filter @wxt-ext/extension build:firefox  # 构建 Firefox 版本
pnpm --filter @wxt-ext/extension zip           # 打包扩展

# Server
pnpm --filter @wxt-ext/server dev
pnpm --filter @wxt-ext/server build
pnpm --filter @wxt-ext/server start

# Web Client
pnpm --filter @wxt-ext/webclient dev
pnpm --filter @wxt-ext/webclient build
pnpm --filter @wxt-ext/webclient preview

# Shared
pnpm --filter @wxt-ext/shared build
```

### 添加依赖

```bash
# 添加到特定应用
pnpm --filter @wxt-ext/server add <package>
pnpm --filter @wxt-ext/server add -D <package>  # 开发依赖

# 添加到根目录（所有应用）
pnpm add -w <package>
pnpm add -wD <package>
```

### Workspace 协议

项目使用 workspace 协议引用本地包：

```json
{
  "dependencies": {
    "@wxt-ext/shared": "workspace:*"
  }
}
```

---

## 应用详解

### 1. Extension（浏览器扩展）

基于 WXT 框架的 Manifest v3 浏览器扩展。

**入口点**

| 入口 | 说明 |
|------|------|
| `popup.html` | 弹出页面 HTML |
| `popup/` | 弹出页面 Vue 组件 |
| `background.ts` | 后台服务脚本 |

**配置文件** `wxt.config.ts`

```typescript
import { defineConfig } from 'wxt'

export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
  manifest: {
    name: 'WXT Extension',
    version: '1.0.0',
    // 其他 manifest 配置
  }
})
```

**开发命令**

```bash
pnpm --filter @wxt-ext/extension dev
```

**构建命令**

```bash
pnpm --filter @wxt-ext/extension build           # Chrome
pnpm --filter @wxt-ext/extension build:firefox   # Firefox
pnpm --filter @wxt-ext/extension zip            # 打包
```

### 2. Server（后端服务）

基于 Hono 的轻量级 API 服务器。

**目录结构**

```
apps/server/
├── src/
│   ├── index.ts       # 服务入口
│   └── routes/        # API 路由
└── package.json
```

**API 端点**

| 端点 | 方法 | 说明 |
|------|------|------|
| `/health` | GET | 健康检查 |
| `/api/status` | GET | 服务状态和版本信息 |

**开发命令**

```bash
pnpm --filter @wxt-ext/server dev   # 使用 tsx watch
```

**生产命令**

```bash
pnpm --filter @wxt-ext/server build  # TypeScript 编译
pnpm --filter @wxt-ext/server start  # 运行编译后的代码
```

### 3. Web Client（管理面板）

Vue 3 单页应用，提供管理界面。

**目录结构**

```
apps/webclient/
├── src/
│   ├── main.ts           # 应用入口
│   ├── App.vue           # 根组件
│   ├── views/            # 页面视图
│   │   ├── Dashboard.vue # 仪表板
│   │   └── Settings.vue  # 设置页
│   ├── router/           # 路由配置
│   │   └── index.ts
│   └── stores/           # Pinia 状态
│       └── ...
├── index.html
└── vite.config.ts
```

**路由**

| 路由 | 组件 | 说明 |
|------|------|------|
| `/` | Dashboard | 仪表板，显示系统状态和活动日志 |
| `/settings` | Settings | 设置页，配置服务器和偏好 |

**API 代理**

Vite 配置了 API 代理，将 `/api` 请求转发到 `localhost:3000`：

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
})
```

**开发命令**

```bash
pnpm --filter @wxt-ext/webclient dev
```

**构建命令**

```bash
pnpm --filter @wxt-ext/webclient build
```

### 4. Shared（共享代码）

类型定义和工具函数的共享包。

**目录结构**

```
packages/shared/
├── src/
│   ├── types/       # TypeScript 类型定义
│   ├── utils/       # 工具函数
│   └── index.ts     # 导出入口
└── package.json
```

**使用方式**

```typescript
// 在其他应用中导入
import { something } from '@wxt-ext/shared'
```

**构建命令**

```bash
pnpm --filter @wxt-ext/shared build
```

---

## API 文档

### Server API

#### GET /health

健康检查端点。

**响应**

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### GET /api/status

获取服务状态和版本信息。

**响应**

```json
{
  "version": "1.0.0",
  "uptime": 3600,
  "memory": {
    "used": "50MB",
    "total": "512MB"
  }
}
```

### Shared Types

```typescript
// @wxt-ext/shared 导出的类型

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface SystemStatus {
  version: string
  uptime: number
  memory: MemoryUsage
}

export interface MemoryUsage {
  used: string
  total: string
}
```

---

## 构建与部署

### 构建所有应用

```bash
pnpm build
```

### 构建特定应用

```bash
pnpm --filter @wxt-ext/extension build
pnpm --filter @wxt-ext/server build
pnpm --filter @wxt-ext/webclient build
pnpm --filter @wxt-ext/shared build
```

### 构建产物

| 应用 | 构建目录 |
|------|----------|
| Extension | `.wxt/` |
| Server | `dist/` |
| Web Client | `dist/` |
| Shared | `dist/` |

### 部署

**Extension**

1. 构建扩展：`pnpm --filter @wxt-ext/extension build`
2. 打包扩展：`pnpm --filter @wxt-ext/extension zip`
3. 上传到 Chrome Web Store 或 Firefox Add-ons

**Server**

1. 构建服务：`pnpm --filter @wxt-ext/server build`
2. 部署 `apps/server/dist/` 到服务器
3. 运行：`node dist/index.js`

**Web Client**

1. 构建应用：`pnpm --filter @wxt-ext/webclient build`
2. 部署 `apps/webclient/dist/` 到静态托管服务

---

## 故障排查

### 常见问题

**Q: pnpm install 失败，提示 ERESOLVE**

A: 尝试清理缓存：
```bash
pnpm store prune
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**Q: 扩展加载后不工作**

A: 检查浏览器控制台错误日志，确保后台脚本已加载。

**Q: Server 启动失败，端口被占用**

A: 修改 `apps/server/src/index.ts` 中的端口号，或终止占用 3000 端口的进程。

**Q: Web Client 无法连接到 Server**

A: 确保 Server 已启动，检查 Vite 代理配置。

**Q: TypeScript 类型错误**

A: 确保已构建 shared 包：
```bash
pnpm --filter @wxt-ext/shared build
```

### 调试技巧

**查看详细日志**

```bash
# 使用 PNPM_DEBUG 环境变量
PNPM_DEBUG=1 pnpm install
```

**清理并重新开始**

```bash
pnpm clean
pnpm install
pnpm build
```

---

## 最佳实践

### 开发流程

1. **启动开发环境**
   ```bash
   pnpm dev
   ```

2. **修改代码后**
   - Extension: 自动重新加载扩展
   - Server: tsx watch 自动重启
   - Web Client: Vite HMR 自动更新

3. **提交前检查**
   ```bash
   pnpm lint
   pnpm build
   pnpm test
   ```

### 代码规范

- 使用 TypeScript 进行类型检查
- 遵循 ESLint 规则（如果配置）
- 共享类型定义在 `@wxt-ext/shared`
- 使用 workspace 协议引用本地包

### Git 工作流

```bash
# 创建功能分支
git checkout -b feature/my-feature

# 开发并提交
git add .
git commit -m "feat: add my feature"

# 推送并创建 PR
git push origin feature/my-feature
```

### 性能优化

- 使用 `pnpm --filter` 只构建需要的应用
- 开发时使用并行模式：`pnpm -r --parallel dev`
- 生产构建使用 `pnpm build` 而非 `pnpm -r dev`

---

## 相关资源

- [WXT 文档](https://wxt.dev)
- [Hono 文档](https://hono.dev)
- [Vue 3 文档](https://vuejs.org)
- [Pinia 文档](https://pinia.vuejs.org)
- [Vite 文档](https://vitejs.dev)
- [pnpm 文档](https://pnpm.io)

---

## 许可证

MIT
