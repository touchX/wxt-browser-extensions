# pnpm 使用指南

> 内容寻址存储、严格依赖管理、工作区协议、集中式版本目录

## 目录

- [快速开始](#快速开始)
- [CLI 命令](#cli-命令)
- [Monorepo 工作区](#monorepo-工作区)
- [依赖管理](#依赖管理)
- [高级功能](#高级功能)
- [最佳实践](#最佳实践)

---

## 快速开始

### 安装

```bash
# 使用 Corepack（推荐）
corepack enable
corepack prepare pnpm@latest --activate

# 或使用 npm
npm install -g pnpm
```

### 在 package.json 中指定版本

```json
{
  "packageManager": "pnpm@10.28.2"
}
```

### 基本命令

```bash
pnpm install              # 安装所有依赖
pnpm add <pkg>            # 添加生产依赖
pnpm add -D <pkg>         # 添加开发依赖
pnpm run <script>         # 运行脚本
```

---

## CLI 命令

### 安装依赖

```bash
pnpm install              # 安装所有依赖
pnpm i                    # 别名

# 安装选项
pnpm install --frozen-lockfile    # CI 模式 - lockfile 过期则失败
pnpm install --prefer-offline     # 优先使用缓存
pnpm install --offline            # 仅使用存储（无网络）
pnpm install --prod               # 仅生产依赖
pnpm install --no-optional        # 跳过可选依赖
pnpm install --ignore-scripts     # 跳过生命周期脚本

# 平台覆盖 (v10.14+)
pnpm install --cpu=arm64          # 覆盖 CPU 架构
pnpm install --os=darwin          # 覆盖操作系统
pnpm install --libc=musl          # 覆盖原生模块的 libc
```

### 添加依赖

```bash
pnpm add <pkg>            # 生产依赖
pnpm add -D <pkg>         # 开发依赖
pnpm add -O <pkg>         # 可选依赖
pnpm add -g <pkg>         # 全局安装

# 指定版本
pnpm add <pkg>@<version>  # 特定版本
pnpm add <pkg>@next       # 标签
pnpm add <pkg>@^1.0.0     # 版本范围
```

### 移除依赖

```bash
pnpm remove <pkg>
pnpm rm <pkg>
pnpm uninstall <pkg>
pnpm un <pkg>
```

### 更新依赖

```bash
pnpm update               # 更新所有
pnpm up <pkg>             # 更新指定包

pnpm up --latest          # 忽略 semver
pnpm up -L                # 别名

pnpm up --interactive     # 交互模式
pnpm up -i                # 别名
```

### 运行脚本

```bash
pnpm run <script>         # 运行脚本
pnpm <script>             # 简写形式

pnpm run build -- --watch # 传递参数
pnpm run --if-present build  # 缺失时不报错
```

### 执行二进制文件

```bash
pnpm exec <cmd>           # 运行本地二进制
pnpm exec eslint .        # 示例

pnpm dlx <pkg>            # 类似 npx，无需安装
pnpm dlx create-vite my-app
```

---

## Monorepo 工作区

### 工作区配置

创建 `pnpm-workspace.yaml`：

```yaml
# 包含模式
packages:
  - 'packages/*'
  - 'apps/*'
  - 'tools/*/packages/*'
  - '!**/test/**'  # 排除模式

# 集中版本管理（Catalogs）
catalog:
  react: ^18.2.0
  typescript: ~5.3.0
  vite: ^5.0.0

# 命名目录
catalogs:
  react17:
    react: ^17.0.2
    react-dom: ^17.0.2
  react18:
    react: ^18.2.0
    react-dom: ^18.2.0

# 依赖覆盖
overrides:
  lodash: ^4.17.21
  'foo@^1.0.0>bar': ^2.0.0

# 设置（.npmrc 的替代方案）
settings:
  auto-install-peers: true
  strict-peer-dependencies: false
  link-workspace-packages: true
```

### 工作区协议

在 `package.json` 中引用本地包：

```json
{
  "dependencies": {
    "@myorg/utils": "workspace:*",
    "@myorg/core": "workspace:^",
    "@myorg/types": "workspace:~"
  }
}
```

| 协议              | 行为      | 发布为    |
| ----------------- | --------- | --------- |
| `workspace:*`     | 任意版本  | `1.2.3`   |
| `workspace:^`     | 兼容版本  | `^1.2.3`  |
| `workspace:~`     | 补丁版本  | `~1.2.3`  |
| `workspace:^1.0.0` | 版本范围  | `^1.0.0`  |

### 项目结构示例

```
my-monorepo/
├── pnpm-workspace.yaml
├── package.json
├── pnpm-lock.yaml
├── .npmrc
├── packages/
│   ├── core/
│   │   └── package.json
│   ├── utils/
│   │   └── package.json
│   └── types/
│       └── package.json
└── apps/
    ├── web/
    │   └── package.json
    └── api/
        └── package.json
```

### 工作区命令

```bash
# 在所有包中运行
pnpm -r run <script>
pnpm --recursive run <script>

# 并行运行
pnpm -r --parallel run build

# 流式输出
pnpm -r --stream run dev

# 顺序运行（并发=1）
pnpm -r --workspace-concurrency=1 run build
```

### 过滤器

```bash
# 按包名过滤
pnpm --filter <name> <cmd>
pnpm -F <name> <cmd>
pnpm --filter "@scope/pkg" build

# 按目录过滤
pnpm --filter "./packages/core" test

# Glob 模式
pnpm --filter "@myorg/*" lint
pnpm --filter "!@myorg/internal-*" publish

# 包的依赖项
pnpm --filter "...@scope/app" build

# 包的依赖者
pnpm --filter "@scope/core..." test

# 自 git 引用以来的变更
pnpm --filter "...[origin/main]" build
pnpm --filter "[HEAD~5]" lint
```

### 工作区脚本

```bash
# 安装到指定包
pnpm --filter @myorg/app add lodash

# 添加工作区依赖
pnpm --filter @myorg/app add @myorg/utils

# 按拓扑顺序运行
pnpm -r run build

# 执行命令
pnpm -r exec rm -rf dist
```

### 发布

```bash
pnpm publish -r                    # 发布所有变更的包
pnpm publish -r --no-git-checks    # CI 模式
```

发布时 `workspace:*` 会自动转换为实际版本号。

---

## 依赖管理

### Catalogs

集中式版本管理 - 定义一次，到处使用。

**定义版本**：

```yaml
# pnpm-workspace.yaml
catalog:
  lodash: ^4.17.21
  zod: ^3.22.0
```

**使用**：

```json
// package.json
{
  "dependencies": {
    "lodash": "catalog:",
    "zod": "catalog:"
  }
}
```

**命名目录**：

```json
{
  "dependencies": {
    "react": "catalog:react18"
  }
}
```

### 目录设置

```ini
# .npmrc
catalog-mode=manual     # 默认 - 不自动添加到目录
catalog-mode=strict     # 如果依赖不在目录中则失败
catalog-mode=prefer     # 如果存在则使用目录版本，否则使用常规版本

cleanup-unused-catalogs=true  # 安装时删除未使用的条目 (v10.15+)
```

发布时 `catalog:` 变为实际版本。

**优点**：
- **唯一版本** - 防止工作区中的版本冲突
- **易于升级** - 更新一处而不是多个 package.json 文件
- **减少合并冲突** - 变更集中在工作区文件中

### .npmrc 设置

```ini
# 对等依赖
auto-install-peers=true
strict-peer-dependencies=false

# Hoisting
public-hoist-pattern[]=*types*
public-hoist-pattern[]=*eslint*
shamefully-hoist=false

# 存储位置
store-dir=~/.pnpm-store
virtual-store-dir=node_modules/.pnpm

# Lockfile
lockfile=true
prefer-frozen-lockfile=true

# 性能
side-effects-cache=true

# 注册表
registry=https://registry.npmjs.org/
@myorg:registry=https://npm.myorg.com/

# 工作区
link-workspace-packages=true
prefer-workspace-packages=true
shared-workspace-lockfile=true
save-workspace-protocol=rolling
inject-workspace-packages=false  # 硬链接而非符号链接

# Node.js（pnpm 11+ 使用 devEngines.runtime）
use-node-version=20.10.0
node-version-file=.nvmrc
```

### package.json pnpm 字段

```json
{
  "pnpm": {
    "overrides": {
      "lodash": "^4.17.21"
    },
    "peerDependencyRules": {
      "ignoreMissing": ["@babel/*"],
      "allowedVersions": { "react": "17 || 18" },
      "allowAny": ["@types/*"]
    },
    "neverBuiltDependencies": ["fsevents"],
    "onlyBuiltDependencies": ["esbuild"],
    "patchedDependencies": {
      "express@4.18.2": "patches/express@4.18.2.patch"
    },
    "syncInjectedDepsAfterScripts": ["build"]
  }
}
```

### 配置层级

1. `/etc/npmrc` - 全局
2. `~/.npmrc` - 用户
3. `<project>/.npmrc` - 项目
4. `npm_config_<key>=<value>` - 环境变量
5. `pnpm-workspace.yaml` 设置

---

## 高级功能

### 链接包

```bash
pnpm link --global        # 使包全局可用
pnpm link -g

pnpm link --global <pkg>  # 使用已链接的包
```

### 打补丁

```bash
pnpm patch <pkg>@<version>     # 创建用于编辑的临时目录
pnpm patch-commit <path>       # 保存补丁
pnpm patch-remove <pkg>        # 移除补丁
```

### 存储管理

```bash
pnpm store path           # 显示位置
pnpm store prune          # 删除未使用的
pnpm store status         # 检查完整性
pnpm store add <pkg>      # 添加但不安装
```

### 信息命令

```bash
pnpm list                 # 列出已安装的
pnpm ls --depth=0         # 仅顶层
pnpm ls --json            # JSON 输出

pnpm why <pkg>            # 为什么安装
pnpm outdated             # 显示过时的
pnpm audit                # 安全检查
```

### 其他命令

```bash
pnpm import               # 从 npm/yarn lockfile 导入
pnpm rebuild              # 重建原生模块
pnpm pack                 # 创建 tarball
pnpm publish              # 发布到注册表
pnpm publish -r --no-git-checks  # CI 发布
```

---

## 最佳实践

### 1. 始终使用 lockfile

```bash
# CI 中使用
pnpm install --frozen-lockfile
```

### 2. 利用 Catalogs 管理版本

```yaml
# pnpm-workspace.yaml
catalog:
  # 定义一次，到处使用
  react: ^18.2.0
  typescript: ~5.3.0
```

### 3. 使用 Workspace 协议

```json
{
  "dependencies": {
    "@myorg/utils": "workspace:^"
  }
}
```

### 4. 合理使用过滤器

```bash
# 只构建变更的包
pnpm --filter "...[origin/main]" build

# 按拓扑顺序构建
pnpm -r run build
```

### 5. 配置 .npmrc

```ini
# 推荐配置
auto-install-peers=true
strict-peer-dependencies=false
prefer-workspace-packages=true
```

### 6. 安全发布

```bash
# 先干运行
pnpm publish -r --dry-run

# CI 发布
pnpm publish -r --no-git-checks
```

---

## 常见问题

### Q: 如何在 monorepo 中共享依赖？

A: 使用 **Catalogs** 在 `pnpm-workspace.yaml` 中定义共享版本。

### Q: workspace:* 和 workspace:^ 有什么区别？

A: `workspace:*` 匹配任意版本，`workspace:^` 匹配兼容版本。发布时前者转为 `1.2.3`，后者转为 `^1.2.3`。

### Q: 如何只构建变更的包？

A: 使用 `pnpm --filter "...[origin/main]" build`

### Q: pnpm 比 npm/yarn 快多少？

A: 通常快 2-3 倍，因为使用内容寻址存储和硬链接。

---

## 参考资源

- [官方文档](https://pnpm.io)
- [工作区文档](https://pnpm.io/workspaces)
- [CLI 命令](https://pnpm.io/cli/add)
- [Catalogs](https://pnpm.io/catalogs)
