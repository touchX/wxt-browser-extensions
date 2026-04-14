# iMedical HIS R8.4.1 完整技术分析

> 探索时间：2026-04-14 | 目标版本：iMedical HIS R8.4.1 | 部署环境：内网 `http://127.0.0.1:81`

---

## 1. 系统概览

| 属性 | 值 |
|------|-----|
| 系统名称 | iMedical HIS R8.4.1 |
| 开发商 | 东华医为科技有限公司 |
| 入口地址 | `http://127.0.0.1:81/imedical/web/csp/dhc.logon.csp` |
| 主服务器 IP | `10.254.8.163` |
| 本机 IP | `10.1.18.233` |
| 登录账号 | `tjai` / `qaz@123` |
| 科室 | 健康管理中心 |

---

## 2. 登录流程与 DOM 结构

### 2.1 登录页初始 DOM

```
顶层窗口 (dhc.logon.csp)
├── dialog (安装客户端基础环境弹窗) ← 需按 Escape 关闭
├── textbox[e17] (用户名输入)
├── textbox[e22] (密码输入)
├── textbox[e27] (科室选择)
└── button[e28] "登录"
```

### 2.2 登录步骤

1. 打开 `http://127.0.0.1:81/imedical/web/csp/dhc.logon.csp`
2. 关闭弹窗（按 `Escape` 或点击确定）
3. 填写用户名 `tjai`、密码 `qaz@123`
4. 点击科室选择框 → 选择「健康管理中心」
5. 点击「登录」按钮

### 2.3 登录后页面标题

```
体检AI 体检医生 健康管理中心 开强纪念医院 H44010501449
```

---

## 3. 多层 iframe 嵌套架构

这是 iMedical HIS 的核心架构特征，必须完整理解。

### 3.1 嵌套层级

```
顶层窗口 (http://127.0.0.1:81/imedical/web/csp/dhc.logon.csp)
├── iframe[ref=e46] ← 登录后变为体检系统主框架
│   └── 内部 iframe (websys.csp)
│       ├── 左侧导航栏 (叫号列表/体检列表)
│       ├── 患者列表区域 (CheckListAc div)
│       │   └── DataGrid 表格 (datagrid-row-r5-2-*)
│       └── 患者详情区域 (底部 SPAN 元素)
│           ├── patName SPAN   ← 姓名
│           ├── sexName SPAN  ← 性别
│           ├── Age SPAN       ← 年龄
│           ├── PatNo SPAN     ← 登记号
│           └── PEDate SPAN    ← 体检日期
└── iframe[ref=e47] ← 空 iframe
```

### 3.2 各层职责

| 层级 | URL | 职责 | 动态性 |
|------|-----|------|--------|
| 顶层 | `dhc.logon.csp` | 登录界面、顶部导航 | 登录前/后切换 |
| 第一层 iframe | — | 体检系统主框架容器 | 静态 |
| 内层 iframe | `websys.csp?TEPRSTART=...` | 患者列表、体检数据 | 点击患者后更新 |

### 3.3 页面 URL 变化

| 阶段 | URL |
|------|-----|
| 登录页 | `http://127.0.0.1:81/imedical/web/csp/dhc.logon.csp` |
| 登录后主框架 | `http://127.0.0.1:81/imedical/web/csp/dhc.logon.csp` (iframe 内部变化) |
| 体检数据页 | `http://127.0.0.1:81/imedical/web/csp/websys.csp?TEPRSTART=TEPRSTART&TWKFL=50201&TWKFLI=0` |

---

## 4. 患者数据元素（精确 ID）

> 以下 ID 通过 Playwright 双击选中患者行后确认。只有在**点击患者行**后，这些 SPAN 元素才会被填充。

### 4.1 患者详情区域（底部 SPAN 元素）

位于内层 iframe (`websys.csp`) 中，选择患者后填充：

| 字段 | 元素类型 | ID | 示例值 |
|------|---------|-----|-------|
| 姓名 | SPAN | `patName` | 李壮壮 |
| 性别 | SPAN | `sexName` | 男 |
| 年龄 | SPAN | `Age` | 25岁 |
| 登记号 | SPAN | `PatNo` | 0000083267 |
| 体检日期 | SPAN | `PEDate` | 2026-04-07 |

### 4.2 患者列表区域（表格单元格）

位于内层 iframe 的 `CheckListAc` DIV 和 DataGrid 表格中：

| 字段 | 来源位置 | 示例值 |
|------|---------|-------|
| 患者摘要 | TD 合并单元格 | 李壮壮男/25岁2026-04-07特殊备注:无 ID:00 |
| 登记号 | 表格列 `[3]` | 0000083267 |
| 体检日期 | 表格列 `[4]` | 2026-04-07 |
| 姓名 | 表格列 `[5]` | 李壮壮 |
| 年龄 | 表格列 `[6]` | 25岁 |
| 性别 | 表格列 `[7]` | 男 |
| VIP等级 | 表格列 `[9]` | 普通 / VVIP |

### 4.3 DataGrid 行结构

```
表格行: datagrid-row-r5-2-0 (第一行 → 李壮壮)
├── TD ← 点击此行触发数据填充到底部 SPAN
│   └── DIV
│       ├── H3: 李壮壮
│       ├── H3: 男/25岁
│       └── H3: 2026-04-07
├── TD[3]: 0000083267 (登记号)
├── TD[4]: 2026-04-07 (体检日期)
├── TD[5]: 李壮壮 (姓名)
├── TD[6]: 25岁 (年龄)
├── TD[7]: 男 (性别)
└── ...
```

---

## 5. 当前患者数据示例

### 5.1 已检队列（第一页部分患者）

| 登记号 | 姓名 | 性别 | 年龄 | 体检日期 | VIP等级 |
|--------|------|------|------|---------|---------|
| 0000083267 | 李壮壮 | 男 | 25岁 | 2026-04-07 | 普通 |
| 0000083268 | 文琼 | 女 | 45岁 | 2026-04-07 | 普通 |
| 0000076494 | 陈秀芳 | 女 | 73岁 | 2026-04-07 | 普通 |
| 0000083272 | 赵鲲鹏 | 男 | 26岁 | 2026-04-07 | 普通 |
| 0000083275 | 贺琨 | 男 | 27岁 | 2026-04-07 | 普通 |
| 0000063792 | 邱培杰 | 男 | 29岁 | 2026-04-07 | 普通 |
| 0000083280 | 罗莹 | 女 | 22岁 | 2026-04-07 | 普通 |
| 0000083295 | 麦国武 | 男 | 23岁 | 2026-04-07 | 普通 |
| 0000083304 | 江栖 | 女 | 33岁 | 2026-04-07 | 普通 |

> 共有约 7 页患者数据，体检日期分布：2026-04-07 ~ 2026-04-13

### 5.2 选中患者详情（李壮壮）

| 字段 | 值 |
|------|-----|
| 姓名 | 李壮壮 |
| 性别 | 男 |
| 年龄 | 25岁 |
| 登记号 | 0000083267 |
| 体检日期 | 2026-04-07 |
| VIP等级 | 普通 |
| 特殊备注 | 无 |

---

## 6. 扩展交互方案

### 6.1 脚本注入策略

由于目标数据在嵌套 iframe 中，`browser.scripting.executeScript` 必须递归遍历所有 iframe：

```typescript
browser.scripting.executeScript({
  target: { tabId: tab.id },
  func: () => {
    function findById(root: Document, targetId: string): string | null {
      // 1. 先在当前文档查找
      const el = root.getElementById(targetId)
      if (el) {
        return (el as HTMLInputElement).value
            || el.textContent?.trim()
            || el.innerText?.trim()
            || null
      }

      // 2. 递归遍历所有 iframe
      const iframes = root.querySelectorAll('iframe')
      for (let i = 0; i < iframes.length; i++) {
        try {
          const doc = iframes[i].contentDocument
                   || (iframes[i].contentWindow as any)?.document
          if (doc) {
            const found = findById(doc, targetId)
            if (found) return found
          }
        } catch {
          // 跨域 iframe 无法访问，跳过
        }
      }
      return null
    }

    // 批量提取所有字段（一次注入获取全部数据）
    return {
      name:      findById(document, 'patName'),
      gender:     findById(document, 'sexName'),
      age:        findById(document, 'Age'),
      regNo:      findById(document, 'PatNo'),
      checkDate:  findById(document, 'PEDate'),
    }
  },
})
```

### 6.2 元素 ID 汇总表

> ⚠️ 以下 ID 在**点击患者行**后才有效（底部详情 SPAN）。列表表格中的数据无需点击即可从 `CheckListAc` DIV 中提取。

| 字段 | 详情区域 ID (SPAN) | 列表区域 (表格列索引) | 备注 |
|------|-------------------|---------------------|------|
| 姓名 | `patName` | `[5]` | 详情区 SPAN，列表 TD |
| 性别 | `sexName` | `[7]` | 详情区 SPAN，列表 TD |
| 年龄 | `Age` | `[6]` | 详情区 SPAN，列表 TD |
| 登记号 | `PatNo` | `[3]` | 详情区 SPAN，列表 TD |
| 体检日期 | `PEDate` | `[4]` | 详情区 SPAN，列表 TD |

### 6.3 扩展权限配置

`manifest` 中必须声明以下权限：

```typescript
// wxt.config.ts
export default defineConfig({
  browser: 'chrome',
  manifest: {
    permissions: ['storage', 'scripting'],
    host_permissions: [
      'http://127.0.0.1/*',   // iMedical 内网地址
      'http://localhost/*',  // 开发环境
    ],
  },
})
```

### 6.4 当前扩展功能映射

| 按钮 | 函数 | 数据来源 | 目标 ID |
|------|------|---------|---------|
| 获取患者信息 | `extractIdCardFromPage()` | iframe SPAN | `patName`, `sexName`, `Age`, `PatNo`, `PEDate` |
| 获取患者数据 | `fetchUserDataFromServer()` | 服务端 API | `idcard`, `height`, `weight`, `sbp`, `dbp`, `pulse`, `fbs` |
| 插入患者数据 | `showPluginData()` | `browser.storage.sync` | — |
| 自动提取（打开时） | `autoExtractPatName()` | iframe SPAN | 同"获取患者信息" |

---

## 7. 已知限制与注意事项

### 7.1 前置条件

- 用户必须**已登录** iMedical 系统
- 用户必须**点击选中**患者列表中的一行
- 只有选中患者后，底部 SPAN 元素才会被填充

### 7.2 跨域限制

如果 iframe 内容来自不同域，`contentWindow.document` 访问会抛 `SecurityError`，此时只能通过服务端 API 获取数据。

### 7.3 WXT 开发模式

- `pnpm dev`（dev server）下 WXT 会自动添加 dev server 的 host 权限
- 从 `.output/chrome-mv3/` 加载**生产构建**时，需要手动授予 host 权限
- Tab 切换功能在**生产构建**下正常工作

### 7.4 Session 维持

iMedical HIS 依赖 Session/Cookie 维持登录状态。扩展执行脚本时，目标标签页必须已登录。

---

## 8. 后续优化方向

| 优先级 | 功能 | 说明 |
|--------|------|------|
| 高 | 从列表直接提取 | 无需点击，从 `CheckListAc` DIV 或表格中提取当前页所有患者数据 |
| 高 | 自动轮询新患者 | 监听患者列表变化，自动提取最新选中患者 |
| 中 | 体格检查数据提取 | 从 iframe 中提取身高/体重/血压等体格检查数据 |
| 中 | 一键回填体检报告 | 将提取的数据自动填入体检报告表单 |
| 低 | 历史记录对比 | 对比多次体检数据的变化趋势 |
| 低 | 血糖报告 PDF | 下载并解析体检报告 PDF 中的血糖数据 |

---

## 9. 文件变更记录

| 日期 | 变更内容 |
|------|---------|
| 2026-04-14 | 初始探索完成，确认 iframe 嵌套架构，发现 SPAN 元素 ID (`patName`/`sexName`/`Age`/`PatNo`/`PEDate`) |
