# 第六章：最佳实践与发布

本章将总结 WXT 开发的最佳实践，解决常见问题，并指导您完成扩展的发布流程。

## 6.1 开发最佳实践

### 6.1.1 项目结构最佳实践

**推荐的项目结构：**

```
my-extension/
├── .output/                  # 构建输出
├── .wxt/                     # WXT 内部文件
├── components/               # 共享组件
│   ├── Button/
│   │   ├── index.tsx
│   │   └── Button.module.css
│   └── Modal/
│       ├── index.tsx
│       └── Modal.module.css
├── composables/              # 共享组合式函数
│   ├── useStorage.ts
│   └── useTheme.ts
├── entrypoints/
│   ├── popup/
│   │   ├── index.html
│   │   ├── App.tsx
│   │   ├── components/
│   │   └── styles.css
│   ├── background/
│   │   ├── index.ts
│   │   ├── alarms.ts
│   │   └── messaging.ts
│   ├── content.example/
│   │   ├── index.ts
│   │   └── style.css
│   └── options/
│       ├── index.tsx
│       └── Settings.tsx
├── hooks/                    # 自定义 WXT hooks
├── modules/                  # 自定义模块
├── public/                   # 静态资源
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
├── utils/                    # 工具函数
├── .env                      # 开发环境变量
├── .env.publish              # 发布环境变量
├── wxt.config.ts             # WXT 配置
├── tsconfig.json
└── package.json
```

### 6.1.2 代码组织原则

1. **单一职责**：每个文件只做一件事
2. **模块化**：将相关功能组织在一起
3. **可复用**：提取公共组件和工具函数
4. **类型安全**：使用 TypeScript 保障类型安全

### 6.1.3 性能优化

**代码分割：**

```typescript
// 不要导入整个库
import _ from 'lodash';  // ❌

// 只导入需要的函数
import debounce from 'lodash/debounce';  // ✅
```

**图片优化：**
- 使用 WebP 格式
- 提供多尺寸图标
- 延迟加载非关键图片

**减少 Manifest 权限：**
```typescript
// wxt.config.ts
export default defineConfig({
  manifest: {
    // 只请求需要的权限
    permissions: ['storage', 'activeTab'],
    host_permissions: ['*://*.example.com/*'],
  },
});
```

### 6.1.4 安全最佳实践

1. **不要在代码中硬编码密钥**
   ```typescript
   // ❌ 错误
   const API_KEY = 'sk-xxxxx';
   
   // ✅ 正确
   const API_KEY = process.env.API_KEY;
   ```

2. **验证用户输入**
   ```typescript
   // 验证来自 content script 的消息
   browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
     if (!isValidMessage(message)) {
       sendResponse({ error: 'Invalid message' });
       return;
     }
     // 处理消息
   });
   ```

3. **使用 CSP**
   ```typescript
   // wxt.config.ts
   export default defineConfig({
     manifest: {
       content_security_policy: {
         extension_pages: "script-src 'self'; object-src 'self'",
       },
     },
   });
   ```

## 6.2 常见问题与解决方案

### 6.2.1 开发问题

**问题：HMR 不工作**

解决方案：
1. 确保使用正确的文件扩展名（`.ts`、`.tsx`、`.vue` 等）
2. 检查 `entrypoints/` 目录结构是否正确
3. 重启开发服务器

**问题：TypeScript 错误**

解决方案：
```bash
# 重新生成 TypeScript 配置
pnpm wxt prepare

# 检查 tsconfig.json
# 确保 include 包含 entrypoints 目录
```

**问题：样式不生效**

解决方案：
1. 检查 CSS 文件是否在入口点目录中
2. 确保 HTML 中正确引入 CSS
3. 检查 CSS 注入模式设置

### 6.2.2 构建问题

**问题：构建失败**

解决方案：
1. 清理构建缓存：`pnpm wxt clean`
2. 重新安装依赖：`pnpm install`
3. 检查 `wxt.config.ts` 配置

**问题：Manifest 错误**

解决方案：
- 检查 `matches` 模式是否正确
- 确保权限名称正确
- 验证入口点文件是否存在

### 6.2.3 发布问题

**问题：商店审核被拒**

常见原因：
1. 权限过度：只请求必需的权限
2. 隐藏功能：确保所有功能都可见
3. 测试不完整：提供测试账户
4. 隐私政策：提供有效的隐私政策链接

**问题：扩展无法安装**

检查清单：
- ✅ Manifest 版本正确（MV2/MV3）
- ✅ 图标格式正确（PNG）
- ✅ 文件大小不超过限制
- ✅ 无语法错误

### 6.2.4 调试技巧

**打开调试日志：**

```typescript
// entrypoints/background.ts
export default defineBackground({
  main() {
    // 开发模式启用日志
    if (import.meta.env.DEV) {
      console.log('Development mode');
    }
  },
});
```

**使用浏览器 DevTools：**

1. 打开扩展管理页面 `chrome://extensions`
2. 启用"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 右键扩展图标 → "检查弹出式窗口"

**Content Script 调试：**

- 在目标页面按 F12 打开 DevTools
- 在 Console 中查看内容脚本日志
- 在 Sources 面板中找到内容脚本

## 6.3 发布到各商店

### 6.3.1 Chrome Web Store

**准备发布：**

1. 创建开发者账户：https://chrome.google.com/webstore/devconsole
2. 准备商店资产：
   - 扩展图标（16, 48, 128 px）
   - 宣传图（1280x800, 440x280）
   - 商店描述
   - 隐私权政策

3. 构建并打包：
   ```bash
   pnpm build
   pnpm zip
   ```

4. 手动上传或使用自动发布

**发布命令：**

```bash
pnpm wxt submit \
  --chrome-zip .output/my-extension-1.0.0-chrome.zip
```

### 6.3.2 Firefox Add-ons

**准备发布：**

1. 创建 Firefox 开发者账户：https://addons.mozilla.org/developers/
2. 准备资产：
   - 扩展图标
   - 创建源代码 ZIP（用于审核）

3. 构建 Firefox 版本：
   ```bash
   pnpm build:firefox
   pnpm zip:firefox
   ```

**发布命令：**

```bash
pnpm wxt submit \
  --firefox-zip .output/my-extension-1.0.0-firefox.zip \
  --firefox-sources-zip .output/my-extension-1.0.0-sources.zip
```

### 6.3.3 Microsoft Edge Add-ons

**准备发布：**

1. 登录 Edge 开发者仪表板：https://partner.microsoft.com/dashboard/microsoftedge
2. 准备与 Chrome 相同的资产

3. 构建：
   ```bash
   pnpm build -b edge
   pnpm zip -b edge
   ```

**发布命令：**

```bash
pnpm wxt submit \
  --edge-zip .output/my-extension-1.0.0-edge.zip
```

### 6.3.4 Apple Safari (macOS)

Safari 扩展需要特殊处理：

1. 使用 Xcode 创建 Safari 扩展项目
2. 导出为 `.safariextz` 文件
3. 通过 Safari Developer Program 分发

> **注意**：WXT 不直接支持 Safari 打包，需要使用额外的工具。

## 6.4 版本管理

### 6.4.1 版本号规范

遵循语义化版本（SemVer）：

```
主版本.次版本.补丁版本
1.0.0
  │   │   │
  │   │   └── 补丁：bug 修复
  │   └── 次版本：新功能（向后兼容）
  └── 主版本：重大变更（不兼容）
```

### 6.4.2 自动版本更新

```bash
# 使用 standard-version
pnpm add -D standard-version
```

```json
// package.json
{
  "scripts": {
    "release": "standard-version",
    "release:patch": "standard-version --release-as patch",
    "release:minor": "standard-version --release-as minor",
    "release:major": "standard-version --release-as major"
  }
}
```

### 6.4.3 更新日志

使用 conventionalcommits 自动生成：

```
fix: 修复存储问题

# 详细说明...

Closes #123
```

## 6.5 维护与更新

### 6.5.1 监控问题

1. 关注用户反馈
2. 监控商店评论
3. 设置错误报告

### 6.5.2 定期更新

- 定期更新依赖
- 适配浏览器新版本
- 响应用户需求

### 6.5.3 兼容性测试

测试矩阵：

| Chrome | Firefox | Edge | Safari |
|--------|---------|------|--------|
| 最新 | 最新 | 最新 | 最新 |
| -2 版本 | -2 版本 | -2 版本 | -1 版本 |

## 6.6 常用资源

### 6.6.1 官方资源

- 📖 文档：https://wxt.dev/
- 💬 Discord：https://discord.gg/wxt
- 🐙 GitHub：https://github.com/wxt-dev/wxt
- 📦 NPM：https://npmjs.com/package/wxt

### 6.6.2 学习资源

- 示例项目：https://wxt.dev/examples
- 博客文章：https://wxt.dev/blog

### 6.6.3 浏览器文档

- Chrome扩展文档：https://developer.chrome.com/docs/extensions/
- Firefox WebExtensions：https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions
- Edge 扩展文档：https://docs.microsoft.com/en-us/microsoft-edge/extensions-chromium/

## 6.7 本章小结

本章我们学习了：
- ✅ **开发最佳实践**：项目结构、代码组织、性能优化、安全
- ✅ **常见问题与解决方案**：开发问题、构建问题、发布问题
- ✅ **发布流程**：Chrome、Firefox、Edge 商店发布
- ✅ **版本管理**：语义化版本、自动更新
- ✅ **维护与更新**：监控、更新、兼容性测试

---

## 🎉 恭喜完成本教程！

您现在已经掌握了 WXT 开发的核心知识：

| 章节 | 技能 |
|------|------|
| 第一章 | WXT 简介、环境安装、第一个项目 |
| 第二章 | 项目结构、入口点类型 |
| 第三章 | 内容脚本、后台脚本、存储、消息通信 |
| 第四章 | React、Vue、Svelte 集成 |
| 第五章 | 模块系统、自动化发布、测试 |
| 第六章 | 最佳实践、发布流程、版本管理 |

### 继续学习建议

1. **深入研究**：阅读 WXT 官方文档了解细节
2. **实战项目**：创建一个真实的扩展应用
3. **参与社区**：加入 Discord 与其他开发者交流
4. **贡献代码**：为 WXT 项目贡献代码或文档

---

**参考资料**：
- [WXT 官方文档](https://wxt.dev/)
- [WXT 示例](https://wxt.dev/examples)
- [WXT GitHub](https://github.com/wxt-dev/wxt)