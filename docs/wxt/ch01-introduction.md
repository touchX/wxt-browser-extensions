# 第一章：WXT 简介与入门

欢迎来到 WXT 教程的第一章！在本章中，我们将介绍 WXT 框架的基本概念，帮助您快速搭建开发环境，并创建您的第一个 WXT 项目。

## 1.1 什么是 WXT

WXT（Web Extension Framework）是一个**下一代 Web 扩展开发框架**，旨在让浏览器扩展开发变得前所未有的快速和简单。

> **官方定义**：WXT 是一个开源工具，使 Web 扩展开发比以往任何时候都更快。

### WXT 的核心理念

WXT 将**开发者体验（Developer Experience）**放在首位：
- 🏃 **快速开发**：内置热模块替换（HMR），开发体验如前端应用般流畅
- 📁 **基于文件**：Manifest 配置基于项目文件自动生成，无需手动维护
- 🌐 **跨浏览器**：一次编写，可构建到 Chrome、Firefox、Edge、Safari 等多种浏览器
- 🔧 **TypeScript 优先**：开箱即用的 TypeScript 支持
- 🚀 **自动化发布**：内置发布工具，支持自动打包、上传、提交到各应用商店

## 1.2 WXT 的核心特性

### 2.1.1 多浏览器支持

WXT 支持构建到以下浏览器：

| 浏览器 | 支持情况 | 说明 |
|--------|----------|------|
| Chrome | ✅ 完全支持 | Manifest V2/V3 |
| Firefox | ✅ 完全支持 | 特殊主题图标支持 |
| Edge | ✅ 完全支持 | 基于 Chromium |
| Safari | ✅ 完全支持 | 需要 macOS |
| 其他 Chromium 内核浏览器 | ✅ 支持 | 通用构建 |

### 2.1.2 Manifest V2 和 V3

WXT 使用同一代码库可以构建 Manifest V2 或 V3 扩展：

```typescript
// wxt.config.ts
export default defineConfig({
  manifest: {
    manifest_version: 3, // 或 2
  },
});
```

### 2.1.3 开发模式特性

- **HMR（热模块替换）**：UI 开发时无需刷新页面
- **快速重载**：内容脚本和后台脚本修改后快速重载
- **自动打开浏览器**：开发模式自动打开浏览器并加载扩展

### 2.1.4 其他特性

- 📦 **模块系统**：跨多个扩展重用构建时和运行时代码
- 🎨 **前端框架无关**：支持任何带有 Vite 插件的前端框架
- 🖍️ **项目引导**：多种项目模板快速启动
- 📏 **Bundle 分析**：分析最终扩展包大小
- ⬇️ **远程代码打包**：下载并打包从 URL 导入的远程代码

## 1.3 环境准备

### 2.3.1 Node.js 要求

WXT 需要 Node.js 18 或更高版本。检查您的 Node.js 版本：

```bash
node --version
```

如果版本过低，请从 [nodejs.org](https://nodejs.org/) 下载安装。

### 2.3.2 包管理器选择

WXT 支持多种包管理器，推荐使用 **pnpm** 或 **bun**：

| 包管理器 | 安装命令 | 特点 |
|----------|----------|------|
| pnpm | `npm install -g pnpm` | 速度快，磁盘占用少 |
| bun | 官网安装 | 最快的 JavaScript 运行时 |
| npm | 内置 | 稳定，兼容性最好 |
| yarn | `npm install -g yarn` | 老牌选择 |

> **推荐**：首次使用建议选择 **pnpm**，它在处理依赖方面非常高效。

## 1.4 安装与初始化

### 2.4.1 方式一：自动初始化（推荐）

使用 `wxt init` 命令自动创建项目：

```bash
# 使用 pnpm
pnpm dlx wxt@latest init

# 使用 bun
bunx wxt@latest init

# 使用 npm
npx wxt@latest init
```

运行命令后，系统会提示您输入项目名称和选择配置选项。

### 2.4.2 方式二：手动初始化

如果您更喜欢手动控制，可以按以下步骤操作：

**第一步：创建项目目录**

```bash
mkdir my-extension
cd my-extension
```

**第二步：初始化包管理器**

```bash
# pnpm
pnpm init

# bun
bun init

# npm
npm init
```

**第三步：安装 WXT**

```bash
# pnpm
pnpm i -D wxt

# bun
bun i -D wxt

# npm
npm i -D wxt
```

**第四步：添加入口文件**

在 `entrypoints/` 目录下创建 `background.ts`：

```typescript
// entrypoints/background.ts
export default defineBackground(() => {
  console.log('Hello from WXT!');
});
```

**第五步：配置 package.json**

```json
{
  "scripts": {
    "dev": "wxt",
    "dev:firefox": "wxt -b firefox",
    "build": "wxt build",
    "build:firefox": "wxt build -b firefox",
    "zip": "wxt zip",
    "zip:firefox": "wxt zip -b firefox",
    "postinstall": "wxt prepare"
  }
}
```

## 1.5 第一个 WXT 项目

让我们创建一个完整的示例项目。

### 2.5.1 项目结构

初始化后的 WXT 项目结构如下：

```
my-extension/
├── .output/           # 构建输出目录
├── .wxt/              # WXT 内部文件
├── entrypoints/       # 入口点目录
│   └── background.ts  # 后台脚本
├── node_modules/      # 依赖
├── .env               # 环境变量
├── package.json       # 项目配置
├── tsconfig.json      # TypeScript 配置
└── wxt.config.ts      # WXT 配置
```

### 2.5.2 启动开发模式

```bash
# 使用 pnpm
pnpm dev

# 使用 npm
npm run dev
```

开发模式启动后：
1. WXT 会编译您的扩展代码
2. 自动打开浏览器窗口
3. 提示您安装/加载扩展

### 2.5.3 构建生产版本

```bash
# 构建 Chrome 版本
pnpm build

# 构建 Firefox 版本
pnpm build:firefox
```

构建产物会生成在 `.output/` 目录中。

### 2.5.4 打包为 ZIP

```bash
# 打包 Chrome 版本
pnpm zip

# 打包 Firefox 版本
pnpm zip:firefox
```

生成的 ZIP 文件可直接提交到 Chrome Web Store、Firefox Add-ons 等商店。

## 1.6 WXT CLI 命令参考

以下是 WXT 提供的所有 CLI 命令：

| 命令 | 说明 | 示例 |
|------|------|------|
| `wxt` | 启动开发模式 | `wxt` |
| `wxt build` | 构建扩展 | `wxt build` |
| `wxt build -b firefox` | 构建 Firefox 版本 | `wxt build -b firefox` |
| `wxt zip` | 打包为 ZIP | `wxt zip` |
| `wxt prepare` | 准备扩展（安装后运行） | `wxt prepare` |
| `wxt clean` | 清理构建产物 | `wxt clean` |
| `wxt init` | 初始化新项目 | `wxt init` |
| `wxt submit` | 提交到商店 | `wxt submit` |
| `wxt submit init` | 初始化提交配置 | `wxt submit init` |

## 1.7 本章小结

在本章中，我们：
- ✅ 了解了 WXT 是什么以及它的核心理念
- ✅ 掌握了 WXT 的核心特性（多浏览器支持、HMR、自动化发布等）
- ✅ 完成开发环境的准备工作
- ✅ 学会了两种安装方式（自动初始化和手动初始化）
- ✅ 创建并运行了第一个 WXT 项目

### 下一步

在下一章中，我们将深入学习 WXT 的**项目结构和入口点**，了解如何组织代码和创建不同类型的扩展功能。

---

**参考资料**：
- [WXT 官方文档](https://wxt.dev/)
- [WXT 安装指南](https://wxt.dev/guide/installation)