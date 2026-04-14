// Options page main script
// Ref: ts-use-browser-not-chrome, store-use-define-item
// Note: WXT 自动注入 browser 全局变量

const autoStartEl = document.getElementById('autoStart') as HTMLInputElement
const showBadgeEl = document.getElementById('showBadge') as HTMLInputElement
const serverUrlEl = document.getElementById('serverUrl') as HTMLInputElement
const saveBtnEl = document.getElementById('saveBtn') as HTMLButtonElement
const statusEl = document.getElementById('status') as HTMLElement

// 加载设置
async function loadSettings() {
  try {
    const result = await browser.storage.sync.get(['autoStart', 'showBadge', 'serverUrl'])
    const settings = result as Record<string, string | boolean>
    autoStartEl.checked = settings.autoStart ?? false
    showBadgeEl.checked = settings.showBadge ?? false
    serverUrlEl.value = settings.serverUrl ?? import.meta.env.VITE_API_URL ?? 'http://localhost:3001'
  } catch (e) {
    console.error('加载设置失败:', e)
    showError('加载设置失败')
  }
}

// 保存设置
async function saveSettings() {
  try {
    await browser.storage.sync.set({
      autoStart: autoStartEl.checked,
      showBadge: showBadgeEl.checked,
      serverUrl: serverUrlEl.value
    })
    showSuccess('设置已保存')
  } catch (e) {
    console.error('保存设置失败:', e)
    showError('保存设置失败')
  }
}

// 显示成功消息
function showSuccess(message: string) {
  statusEl.textContent = message
  statusEl.className = 'status success'
  statusEl.style.display = 'block'
  setTimeout(() => { statusEl.style.display = 'none' }, 2000)
}

// 显示错误消息
function showError(message: string) {
  statusEl.textContent = message
  statusEl.className = 'status error'
  statusEl.style.display = 'block'
  setTimeout(() => { statusEl.style.display = 'none' }, 3000)
}

saveBtnEl.addEventListener('click', saveSettings)
loadSettings()