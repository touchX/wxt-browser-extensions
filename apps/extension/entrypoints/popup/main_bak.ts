// Popup main script - 包含服务器检查和 WebClient 控制功能

const statusEl = document.getElementById('status') as HTMLElement
const checkBtn = document.getElementById('checkBtn') as HTMLButtonElement
const refreshBtn = document.getElementById('refreshBtn') as HTMLButtonElement
const openSettingsBtn = document.getElementById('openSettingsBtn') as HTMLButtonElement
const syncBtn = document.getElementById('syncBtn') as HTMLButtonElement

// 从存储获取服务器地址
async function getServerUrl(): Promise<string> {
  try {
    const result = await browser.storage.sync.get('serverUrl')
    return (result as Record<string, string>).serverUrl || 'http://localhost:3000'
  } catch {
    return 'http://localhost:3000'
  }
}

// 检查服务器状态
async function checkServer() {
  statusEl.textContent = '检查中...'
  statusEl.className = 'status loading'

  try {
    const serverUrl = await getServerUrl()
    const res = await fetch(`${serverUrl}/health`)
    const data = await res.json()
    statusEl.textContent = `服务器: ${data.status}`
    statusEl.className = data.status === 'ok' ? 'status success' : 'status error'
  } catch {
    statusEl.textContent = '服务器: 无法连接'
    statusEl.className = 'status error'
  }
}

// 发送消息到 WebClient 页面
async function sendToWebClient(message: { type: string; payload?: unknown }) {
  // 获取当前活动的标签页
  const tabs = await browser.tabs.query({ active: true, currentWindow: true })
  const activeTab = tabs[0]

  if (!activeTab?.id) {
    statusEl.textContent = '无法获取活动标签页'
    statusEl.className = 'status error'
    return
  }

  // 检查 URL 是否是 WebClient
  const url = activeTab.url || ''
  if (!url.includes('localhost:5173') && !url.includes('localhost:5174')) {
    statusEl.textContent = '请先打开 WebClient 页面'
    statusEl.className = 'status error'
    return
  }

  try {
    // 发送消息到 Content Script
    const response = await browser.tabs.sendMessage(activeTab.id, {
      ...message,
      target: 'page'
    })

    if (response?.success) {
      statusEl.textContent = `${message.type} 成功`
      statusEl.className = 'status success'
    } else {
      statusEl.textContent = `${message.type} 失败`
      statusEl.className = 'status error'
    }
  } catch (e) {
    console.error('发送消息失败:', e)
    statusEl.textContent = '请确保 WebClient 页面已打开'
    statusEl.className = 'status error'
  }
}

// 刷新数据
async function handleRefresh() {
  await sendToWebClient({ type: 'REFRESH_DATA' })
}

// 打开设置
async function handleOpenSettings() {
  await sendToWebClient({ type: 'OPEN_SETTINGS' })
}

// 同步状态
async function handleSync() {
  await sendToWebClient({ type: 'SYNC_STATE' })
}

// 绑定事件
checkBtn.addEventListener('click', checkServer)
refreshBtn.addEventListener('click', handleRefresh)
openSettingsBtn.addEventListener('click', handleOpenSettings)
syncBtn.addEventListener('click', handleSync)