# iMedical HIS 插件开发实战指导

> 基于 WXT 浏览器扩展与 iMedical HIS 系统集成的完整开发经验总结

---

## 一、项目背景与架构概览

### 1.1 系统架构

本项目是一个 pnpm monorepo，包含三个主要应用：

| 应用 | 技术栈 | 端口 | 说明 |
|------|--------|------|------|
| `apps/extension` | WXT 0.19 + Vue 3.5 | - | 浏览器扩展（popup/options/background/content） |
| `apps/server` | Hono 4.x | 3001 | API 服务端，模拟体检数据 |
| `apps/webclient` | Vue 3.5 + Vite 6.x | 5173 | Web 管理端 |

### 1.2 iMedical HIS 系统架构

iMedical 是一个基于 Web 的医院信息系统（HIS），其核心特点：

```
主页面 (dhc.logon.csp)
  └── iframe[name="TRAK_main"]
        └── iframe[StationID=1]    ← 一般检查（含身高/体重/血压/脉率）
        └── iframe[StationID=43]   ← 体格检查
        └── iframe (其他工作站)
```

**关键发现**：
- iMedical 使用深层的 iframe 嵌套结构
- 不同检查项目通过不同的 `StationID` 参数区分
- 表单字段的 ID 格式为动态的 `EpisodeID||StationNum^ItemCode`

---

## 二、核心问题：元素定位失败

### 2.1 错误的做法（导致"未找到目标表单"）

**致命错误：将 Playwright snapshot 的 `ref` 当作 DOM `id` 使用**

```typescript
// ❌ 错误代码 —— 这是导致"未找到目标表单"的根因
const fieldMap: Record<string, string> = {
  'f3e59': fields.height,    // f3e59 是 Playwright 内部 accessibility ref，不是 DOM id！
  'f3e66': fields.weight,
  'f3e80': fields.leftSystolic,
  'f3e87': fields.leftDiastolic,
  'f3e94': fields.pulseRate,
}
```

**为什么这是错的**：

Playwright 的 `ref=xxx`（如 `f3e59`）是 Accessibility Tree 的内部引用，仅用于 Playwright CLI 的交互操作，**不是** HTML 元素的 `id` 属性。两者是完全不同的系统。

### 2.2 正确的做法：三步定位法

#### 第一步：在嵌套 iframe 中找到目标 frame

```typescript
function findTargetFrame(root: Document): Document | null {
  const iframes = root.querySelectorAll('iframe')
  for (let i = 0; i < iframes.length; i++) {
    try {
      const iframe = iframes[i]
      const src = iframe.src || ''
      // StationID=1 = 一般检查（包含身高/体重/血压/脉率）
      if (src.includes('StationID=1')) {
        const doc = iframe.contentDocument
        if (doc && doc.getElementById('IDStr')) return doc
      }
      // 递归进入嵌套 iframe
      const subIframes = iframe.contentDocument?.querySelectorAll('iframe')
      if (subIframes) {
        for (let j = 0; j < subIframes.length; i++) {
          try {
            const subSrc = subIframes[j].src || ''
            if (subSrc.includes('StationID=1')) {
              const subDoc = subIframes[j].contentDocument
              if (subDoc && subDoc.getElementById('IDStr')) return subDoc
            }
          } catch { /* cross-origin */ }
        }
      }
    } catch { /* cross-origin */ }
  }
  return null
}
```

#### 第二步：从 IDStr 获取患者 EpisodeID

```typescript
// IDStr 格式: "EpisodeId||1^1||22&EpisodeId||1^1||21&..."
const idStrEl = targetDoc.getElementById('IDStr') as HTMLInputElement
const idStrVal = idStrEl.value || ''
const firstPart = idStrVal.split('&')[0] || ''
const episodeId = firstPart.split('||')[0]  // 例如: "235251"
```

#### 第三步：动态构建 textarea ID 并填值

```typescript
// ItemCode → 字段值映射
const itemCodes: Record<string, string> = {
  '22': fields.height,        // 身高
  '21': fields.weight,        // 体重
  '24': fields.leftSystolic,  // 收缩压
  '25': fields.leftDiastolic, // 舒张压
  '32': fields.pulseRate,     // 脉率
}

let filled = 0
for (const [itemCode, value] of Object.entries(itemCodes)) {
  if (!value) continue
  const taId = episodeId + '||1^1||' + itemCode
  const ta = targetDoc.getElementById(taId) as HTMLTextAreaElement | null
  if (ta) {
    ta.value = value
    ta.dispatchEvent(new Event('input', { bubbles: true }))
    ta.dispatchEvent(new Event('change', { bubbles: true }))
    filled++
  }
}
```

---

## 三、iMedical 表单元素特征

### 3.1 真实 DOM 元素 ID 模式

通过 Playwright `evaluateAll` 验证，StationID=1 frame 中的实际元素：

```javascript
// 获取所有 input 和 textarea
f.locator('input,textarea').evaluateAll(els =>
  els.map(e => ({ id: e.id, tag: e.tagName, val: e.value }))
)
```

结果：

| 元素类型 | ID | 值 | 说明 |
|---------|----|-----|------|
| INPUT | `EpisodeID` | `235477` | Frame URL 中的 PAADM 参数 |
| INPUT | `IDStr` | `235251\|\|1^1\|\|22&...` | **包含实际表单数据的 EpisodeID** |
| TEXTAREA | `235251\|\|1^1\|\|22` | `167` | 身高 |
| TEXTAREA | `235251\|\|1^1\|\|21` | `67.8` | 体重 |
| TEXTAREA | `235251\|\|1^1\|\|24` | `102` | 收缩压 |
| TEXTAREA | `235251\|\|1^1\|\|25` | `65` | 舒张压 |
| TEXTAREA | `235251\|\|1^1\|\|32` | `97` | 脉率 |

### 3.2 重要发现：Frame URL 的 PAADM ≠ 表单数据的 EpisodeID

```
Frame URL PAADM 参数:  235477
IDStr 中的 EpisodeID:   235251 ← 表单数据用这个！
```

Frame URL 中的 `PAADM=235477` 和表单数据中的 EpisodeID `235251` **不是同一个值**。必须从 `IDStr` 隐藏字段提取真实的表单数据 EpisodeID。

### 3.3 readonly textarea 的处理

表单中的 textarea 元素有 `readonly=""` 属性：

```html
<textarea rows="1" readonly onclick="resultClick(this);"
  onchange="resultchange(this)" id="235251||1^1||22">167</textarea>
```

- `readonly=""`（空字符串）会阻止用户直接输入
- 但通过 JavaScript 程序化设值可以绕过：`ta.value = '175'`
- 需要同时触发 `input` 和 `change` 事件以通知系统

---

## 四、Playwright 调试技巧

### 4.1 获取真实 DOM ID（不是 Playwright ref）

```bash
# 使用 run-code + evaluateAll 获取所有元素的 id/tag/value
playwright-cli run-code "async page => { return page.frames().find(f=>f.url().includes('StationID=1')).locator('input,textarea').evaluateAll(els=>els.map(e=>({id:e.id,tag:e.tagName,val:e.value}))); }"
```

### 4.2 查找包含特定文本的 TD 及其相邻 textarea

```bash
# 检查 TD 中的文本是否包含标签名
playwright-cli run-code "async page => { const f = page.frames().find(f=>f.url().includes('StationID=1')); const tds = f.locator('td').filter({hasText: /身高/}); return {count: await tds.count()}; }"
```

### 4.3 列出所有 iframe 及其 src/name

```bash
# 主页面
playwright-cli run-code "async page => { return page.locator('iframe').evaluateAll(els=>els.map(e=>({name:e.name,src:e.src}))); }"

# TRAK_main 子级
playwright-cli run-code "async page => { return page.frameLocator('[name=\"TRAK_main\"]').locator('iframe').evaluateAll(els=>els.map(e=>({name:e.name,src:e.src}))); }"
```

### 4.4 验证 textarea 可写性

```bash
# 测试 JS 设值是否绕过 readonly
playwright-cli run-code "async page => { const f = page.frames().find(f=>f.url().includes('StationID=1')); const ta = f.locator('[id=\"235251||1^1||22\"]'); await ta.evaluate((el,val) => { el.value = val; el.dispatchEvent(new Event('input',{bubbles:true})); }, '175'); return await ta.inputValue(); }"
```

---

## 五、WXT 扩展开发要点

### 5.1 跨 iframe 访问的关键 API

```typescript
// 在 browser.scripting.executeScript 中访问 iframe
browser.scripting.executeScript({
  target: { tabId: tab.id },
  func: (args) => {
    // iframe.contentDocument 可能为 null（跨域），需要 try-catch
    const iframes = root.querySelectorAll('iframe')
    for (const iframe of iframes) {
      try {
        const doc = iframe.contentDocument
        // ...
      } catch {
        // 跨域 iframe 无法访问
      }
    }
  },
  args: [data],
})
```

### 5.2 扩展配置（wxt.config.ts）

必须声明 `scripting` 权限才能使用 `browser.scripting.executeScript`：

```typescript
export default defineConfig({
  permissions: ['storage', 'scripting'],
  hostPermissions: ['http://127.0.0.1/*', 'http://localhost/*'],
})
```

### 5.3 消息传递返回值

`browser.scripting.executeScript` 的返回值通过 `Results` API 传递：

```typescript
const outcomes = await browser.scripting.executeScript({
  target: { tabId: tab.id },
  func: (fields) => {
    // 返回对象必须是可序列化的（不含 DOM 引用）
    return { filled: 5, total: 5, episodeId: '235251' }
  },
  args: [data],
})

// 正确读取返回值
const outcome = outcomes?.[0]?.result as { filled: number; total: number }
```

⚠️ **注意**：返回 Document 对象会导致序列化失败。如果需要从函数内访问 DOM，应在函数体内完成所有操作后再返回值。

---

## 六、完整插件工作流程

```
┌─────────────────────────────────────────────────────────────┐
│  Step 1: 打开 iMedical体检页面，选中患者                      │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 2: 打开扩展 Popup，自动提取患者信息（姓名/性别/年龄）      │
│           调用 extractIdCardFromPage() / autoExtractPatName() │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 3: 点击"获取患者数据"，从服务端查询体检数据               │
│           调用 fetchUserDataFromServer()                     │
│           数据存入 browser.storage.sync                        │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 4: 点击"插入患者数据"，将数据填入 iMedical 表单           │
│           调用 insertDataToPage()                             │
│           ├── findTargetFrame()  → 定位 StationID=1 iframe   │
│           ├── IDStr → episodeId      → 获取真实 EpisodeID     │
│           └── ta.value + dispatchEvent  → 填入 5 个字段       │
└─────────────────────────────────────────────────────────────┘
```

---

## 七、踩坑记录

### 7.1 Playwright ref ≠ DOM id

| 概念 | 示例 | 用途 |
|------|------|------|
| Playwright accessibility ref | `ref=f3e59` | Playwright CLI 内部交互引用 |
| DOM id | `id="235251\|\|1^1\|\|22"` | HTML 元素标识符，`getElementById()` 使用 |

**教训**：永远不要把 Playwright snapshot 中的 `ref` 用作 `getElementById()` 的参数。

### 7.2 iframe 跨域访问

```typescript
// ❌ 错误写法
const doc = iframe.contentDocument  // 可能抛出异常

// ✅ 正确写法
let doc = null
try {
  doc = iframe.contentDocument
} catch {
  doc = null
}
if (doc) { /* 安全使用 */ }
```

### 7.3 readonly 元素的程序化写入

```typescript
// ❌ 直接赋值不够，需要触发事件
ta.value = '175'

// ✅ 完整写法
ta.value = value
ta.dispatchEvent(new Event('input', { bubbles: true }))
ta.dispatchEvent(new Event('change', { bubbles: true }))
```

---

## 八、相关文件索引

| 文件 | 说明 |
|------|------|
| `apps/extension/entrypoints/popup/main.ts` | Popup 主逻辑，包含三个核心函数 |
| `apps/extension/wxt.config.ts` | WXT 扩展配置 |
| `apps/server/src/services/patientData.ts` | 服务端模拟数据 |
| `apps/server/src/routes/preVisit.ts` | 体检数据查询接口 |

---

*本文档基于 2026-04-14 与 iMedical HIS 8.4 的集成实战经验总结*
