# 第五章：高级功能

本章将介绍 WXT 的高级功能，包括模块系统、自动化发布、测试、多浏览器支持等，帮助您构建更专业的扩展应用。

## 5.1 WXT 模块系统

WXT 模块是可以在多个项目中重用的扩展功能模块。

### 5.1.1 什么是 WXT 模块

WXT 模块类似于 Nuxt 模块，可以在构建时和运行时提供功能：
- **构建时**：添加 Vite 插件、修改配置
- **运行时**：提供 API、组件、工具函数

### 5.1.2 使用官方模块

```bash
# 安装官方模块
pnpm add @wxt-dev/i18n
pnpm add @wxt-dev/storage
pnpm add @wxt-dev/auto-icons
pnpm add @wxt-dev/unocss
```

在 `wxt.config.ts` 中启用：

```typescript
// wxt.config.ts
import { defineConfig } from 'wxt';

export default defineConfig({
  modules: [
    '@wxt-dev/i18n',
    '@wxt-dev/unocss',
    '@wxt-dev/auto-icons',
  ],
  
  // 模块配置
  i18n: {
    baseLocale: 'en',
    locales: ['en', 'zh-CN', 'ja'],
  },
});
```

### 5.1.3 创建自定义模块

```typescript
// modules/my-module/index.ts
import { defineWxtModule } from 'wxt/module';

export default defineWxtModule({
  name: 'my-module',
  
  // 配置项
  options: {
    enableFeature: true,
  },
  
  // 构建时 hooks
  hooks: {
    'config:changed'(wxt, newConfig) {
      console.log('配置已更改');
    },
  },
  
  // 修改 Vite 配置
  vite(wxt, viteConfig) {
    if (wxt.options.mode === 'development') {
      // 开发模式特殊配置
    }
    return viteConfig;
  },
});
```

### 5.1.4 模块 Hooks

WXT 提供丰富的 Hooks：

```typescript
export default defineWxtModule({
  hooks: {
    // 构建开始前
    'build:before'(wxt) {
      console.log('开始构建');
    },
    
    // manifest 生成后
    'manifest:generated'(wxt, manifest) {
      // 修改 manifest
      manifest.name = 'My Extension';
      return manifest;
    },
    
    // 入口点处理前
    'entrypoints:resolved'(wxt, entrypoints) {
      return entrypoints.filter(ep => !ep.name.includes('debug'));
    },
    
    // 打包完成后
    'build:after'(wxt, zipPath) {
      console.log('构建完成:', zipPath);
    },
  },
});
```

## 5.2 自动化发布

WXT 内置了发布工具，支持自动上传到 Chrome Web Store、Firefox Add-ons、Edge Add-ons。

### 5.2.1 初始化发布配置

```bash
pnpm wxt submit init
```

这将引导您配置各个商店的 API 密钥。

### 5.2.2 配置环境变量

```bash
# .env.publish
# Chrome Web Store
CHROME_EXTENSION_ID=your-extension-id
CHROME_CLIENT_ID=your-client-id
CHROME_CLIENT_SECRET=your-client-secret
CHROME_REFRESH_TOKEN=your-refresh-token

# Firefox Add-ons
FIREFOX_EXTENSION_ID=your-extension-id
FIREFOX_JWT_ISSUER=your-jwt-issuer
FIREFOX_JWT_SECRET=your-jwt-secret

# Edge Add-ons
EDGE_EXTENSION_ID=your-extension-id
EDGE_CLIENT_ID=your-client-id
EDGE_CLIENT_SECRET=your-client-secret
```

### 5.2.3 手动提交扩展

```bash
# 打包
pnpm zip
pnpm zip:firefox

# 测试提交（不真正发布）
pnpm wxt submit --dry-run \
  --chrome-zip .output/my-extension-1.0.0-chrome.zip \
  --firefox-zip .output/my-extension-1.0.0-firefox.zip

# 正式提交
pnpm wxt submit \
  --chrome-zip .output/my-extension-1.0.0-chrome.zip \
  --firefox-zip .output/my-extension-1.0.0-firefox.zip \
  --firefox-sources-zip .output/my-extension-1.0.0-sources.zip
```

### 5.2.4 GitHub Actions 自动发布

```yaml
# .github/workflows/release.yml
name: Release

on:
  workflow_dispatch:

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      
      - uses: pnpm/action-setup@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Build extensions
        run: |
          pnpm build
          pnpm build:firefox
      
      - name: Zip extensions
        run: |
          pnpm zip
          pnpm zip:firefox
      
      - name: Submit to stores
        run: |
          pnpm wxt submit \
            --chrome-zip .output/*-chrome.zip \
            --firefox-zip .output/*-firefox.zip \
            --firefox-sources-zip .output/*-sources.zip
        env:
          CHROME_EXTENSION_ID: ${{ secrets.CHROME_EXTENSION_ID }}
          CHROME_CLIENT_ID: ${{ secrets.CHROME_CLIENT_ID }}
          CHROME_CLIENT_SECRET: ${{ secrets.CHROME_CLIENT_SECRET }}
          CHROME_REFRESH_TOKEN: ${{ secrets.CHROME_REFRESH_TOKEN }}
          FIREFOX_EXTENSION_ID: ${{ secrets.FIREFOX_EXTENSION_ID }}
          FIREFOX_JWT_ISSUER: ${{ secrets.FIREFOX_JWT_ISSUER }}
          FIREFOX_JWT_SECRET: ${{ secrets.FIREFOX_JWT_SECRET }}
```

## 5.3 单元测试

### 5.3.1 设置测试环境

```bash
pnpm add -D vitest @vitejs/plugin-react @testing-library/react
```

```typescript
// wxt.config.ts
import { defineConfig } from 'wxt';
import react from '@vitejs/plugin-react';

export default defineConfig({
  vite: {
    plugins: [react()],
    test: {
      environment: 'happy-dom',
      globals: true,
    },
  },
});
```

### 5.3.2 编写测试

```typescript
// tests/storage.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { storage } from 'wxt/utils';

describe('Storage', () => {
  beforeEach(async () => {
    await storage.clear('local');
  });
  
  it('should store and retrieve data', async () => {
    await storage.set('local:test', { name: 'test' });
    const result = await storage.get('local:test');
    expect(result).toEqual({ name: 'test' });
  });
  
  it('should remove data', async () => {
    await storage.set('local:test', { name: 'test' });
    await storage.remove('local:test');
    const result = await storage.get('local:test');
    expect(result).toBeNull();
  });
});
```

### 5.3.3 测试后台脚本

```typescript
// tests/background.test.ts
import { describe, it, expect, vi } from 'vitest';
import { FakeBrowser } from 'wxt/testing';

// 模拟浏览器 API
const fakeBrowser = new FakeBrowser();

describe('Background Script', () => {
  it('should handle messages', async () => {
    const messageHandler = vi.fn();
    fakeBrowser.runtime.onMessage.addListener(messageHandler);
    
    // 模拟发送消息
    fakeBrowser.runtime.onMessage.callListener(
      { type: 'test' },
      { id: 1, tab: { id: 1 } },
      vi.fn()
    );
    
    expect(messageHandler).toHaveBeenCalled();
  });
});
```

### 5.3.4 运行测试

```bash
# package.json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

```bash
pnpm test
```

## 5.4 E2E 测试

### 5.4.1 设置 Playwright

```bash
pnpm add -D @playwright/test
npx playwright install chromium
```

### 5.4.2 编写 E2E 测试

```typescript
// e2e/popup.test.ts
import { test, expect } from '@playwright/test';

test('popup should display correctly', async ({ page }) => {
  // 打开扩展 popup
  await page.goto('chrome-extension://<extension-id>/popup.html');
  
  // 检查标题
  await expect(page.locator('h1')).toContainText('WXT');
  
  // 测试交互
  await page.click('button');
  await expect(page.locator('.count')).toContainText('1');
});
```

### 5.4.3 使用 WXT Testing

WXT 提供了更简单的测试方式：

```typescript
import { test, expect } from '@wxt-dev/testing';
import { defineBackground } from 'wxt/background';

test('background script works', async () => {
  // 获取后台脚本实例
  const bg = await import('../entrypoints/background');
  
  // 测试
  expect(bg).toBeDefined();
});
```

## 5.5 多浏览器支持

### 5.5.1 构建不同浏览器版本

```bash
# Chrome
pnpm build

# Firefox
pnpm build:firefox

# Edge
pnpm build -b edge
```

### 5.5.2 浏览器特定配置

```typescript
// wxt.config.ts
export default defineConfig({
  manifest: {
    name: 'My Extension',
  },
  
  // 浏览器特定配置
  browser: {
    firefox: {
      manifest: {
        name: 'My Extension (Firefox)',
      },
    },
    edge: {
      manifest: {
        name: 'My Extension (Edge)',
      },
    },
  },
});
```

### 5.5.3 浏览器特定入口点

```typescript
// entrypoints/background.ts
export default defineBackground({
  include: ['chrome', 'edge'],  // 包含的浏览器
  exclude: ['firefox'],         // 排除的浏览器
  
  main() {
    // ...
  },
});
```

```typescript
// entrypoints/firefox-only.ts
export default defineBackground({
  include: ['firefox'],
  
  main() {
    // Firefox 特定的代码
  },
});
```

## 5.6 远程代码打包

WXT 可以从 URL 下载并打包远程代码。

### 5.6.1 配置远程模块

```typescript
// wxt.config.ts
export default defineConfig({
  remoteModules: {
    'lodash': 'https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js',
    'moment': 'https://cdn.jsdelivr.net/npm/moment@2.29.4/moment.min.js',
  },
});
```

### 5.6.2 使用远程代码

```typescript
// entrypoints/background.ts
import _ from 'lodash';

export default defineBackground({
  main() {
    const sorted = _.sortBy([3, 1, 2]);
    console.log(sorted);
  },
});
```

## 5.7 环境变量

### 5.7.1 开发环境变量

```bash
# .env
VITE_API_URL=http://localhost:3000
VITE_DEBUG=true
```

### 5.7.2 发布环境变量

```bash
# .env.publish
VITE_API_URL=https://api.example.com
VITE_DEBUG=false
```

### 5.7.3 使用环境变量

```typescript
// 在代码中访问
const apiUrl = import.meta.env.VITE_API_URL;
const isDebug = import.meta.env.VITE_DEBUG === 'true';
```

## 5.8 Bundle 分析

### 5.8.1 分析构建产物

```bash
pnpm wxt build --analyze
```

这会生成一个可视化的分析报告，帮助您了解扩展的大小组成。

### 5.8.2 优化建议

根据分析报告，您可以：
- 移除未使用的依赖
- 使用更小的替代库
- 启用代码压缩
- 使用动态导入

## 5.9 本章小结

本章我们学习了：
- ✅ **WXT 模块系统**：使用官方模块、创建自定义模块、Hooks
- ✅ **自动化发布**：配置、提交、GitHub Actions
- ✅ **单元测试**：Vitest 配置、测试存储和后台脚本
- ✅ **E2E 测试**：Playwright 集成
- ✅ **多浏览器支持**：浏览器特定配置、入口点过滤
- ✅ **远程代码打包**：从 CDN 加载依赖
- ✅ **环境变量**：开发/发布环境配置
- ✅ **Bundle 分析**：优化构建产物

### 下一步

下一章我们将学习**最佳实践与发布**，包括开发最佳实践、常见问题解决等。

---

**参考资料**：
- [WXT 模块文档](https://wxt.dev/guide/essentials/wxt-modules)
- [WXT 发布文档](https://wxt.dev/guide/essentials/publishing)
- [WXT 测试文档](https://wxt.dev/guide/essentials/testing)