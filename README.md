# WXT Browser Extensions Monorepo

基于 pnpm workspace 的 Monorepo 项目，包含三个独立应用：

- **@wxt-ext/server**: Hono API 服务器 (端口 3000)
- **@wxt-ext/extension**: WXT 浏览器扩展
- **@wxt-ext/webclient**: Vue SPA 管理仪表板 (端口 5173)
- **@wxt-ext/shared**: 共享类型和工具

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
# 启动所有应用
pnpm dev

# 单独启动
pnpm dev:server   # 端口 3000
pnpm dev:extension # 扩展开发
pnpm dev:webclient # 端口 5173
```

### 构建

```bash
# 构建所有
pnpm build

# 单独构建
pnpm build:server
pnpm build:extension
pnpm build:webclient
pnpm build:shared
```

## 项目结构

```
.
├── apps/
│   ├── server/          # Hono API 服务器
│   ├── extension/      # WXT 浏览器扩展
│   └── webclient/      # Vue SPA 仪表板
├── packages/
│   └── shared/          # 共享代码
├── pnpm-workspace.yaml # 工作区配置
└── package.json         # 根配置
```

## 技术栈

- pnpm 8+ (工作区管理)
- TypeScript 5.x
- Hono 4.x (Server)
- WXT 0.19+ (浏览器扩展)
- Vue 3.5 + Vite 6.x (Web Client)
- Vitest (测试)

## 许可证

MIT
