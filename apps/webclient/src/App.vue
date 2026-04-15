<template>
  <div id="app" class="dashboard-container">
    <header class="header">
      <h1>WXT Extension Dashboard</h1>
      <nav class="nav">
        <router-link to="/">Dashboard</router-link>
        <router-link to="/patient-data">居民就诊数据</router-link>
        <router-link to="/api-test">接口测试</router-link>
        <router-link to="/settings">Settings</router-link>
      </nav>
    </header>
    <main class="main">
      <router-view
        @refresh-data="handleRefreshData"
        @open-settings="handleOpenSettings"
        @sync-state="handleSyncState"
        ref="routerViewRef"
      />
    </main>
    <!-- Toast 通知 -->
    <div v-if="toast.show" :class="['toast', toast.type]">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useExtension, type ExtensionMessage } from './composables/useExtension'

const router = useRouter()
const routerViewRef = ref<{ refreshData?: () => Promise<void> } | null>(null)
const { onMessage, offMessage } = useExtension()

// Toast 状态
const toast = ref({ show: false, message: '', type: 'info' })
let toastTimer: ReturnType<typeof setTimeout> | null = null

// 显示 Toast
function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  if (toastTimer) clearTimeout(toastTimer)
  toast.value = { show: true, message, type }
  toastTimer = setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

// 处理刷新数据 - 调用 Dashboard 的 refreshData 方法
async function handleRefreshData() {
  showToast('正在刷新数据...', 'info')
  if (routerViewRef.value?.refreshData) {
    await routerViewRef.value.refreshData()
    showToast('数据已刷新', 'success')
  } else {
    router.go(0)
  }
}

// 处理打开设置
function handleOpenSettings() {
  router.push('/settings')
  showToast('已打开设置页面', 'success')
}

// 处理同步状态
async function handleSyncState() {
  try {
    const response = await fetch('http://localhost:3001/api/status')
    const data = await response.json()
    showToast(`状态同步成功: v${data.version}`, 'success')
  } catch {
    showToast('状态同步失败', 'error')
  }
}

// 处理扩展消息
function handleExtensionMessage(message: ExtensionMessage) {
  console.log('[App] 收到扩展消息:', message)

  switch (message.type) {
    case 'REFRESH_DATA':
      handleRefreshData()
      break
    case 'OPEN_SETTINGS':
      handleOpenSettings()
      break
    case 'SYNC_STATE':
      handleSyncState()
      break
    default:
      console.log('[App] 未知消息类型:', message.type)
  }
}

onMounted(() => {
  // 注册扩展消息监听
  onMessage(handleExtensionMessage)
  console.log('[App] 已注册扩展消息监听')
})

onUnmounted(() => {
  offMessage()
})
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: #fff;
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h1 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.nav {
  display: flex;
  gap: 16px;
}

.nav a {
  text-decoration: none;
  color: #64748b;
  font-weight: 500;
}

.nav a:hover,
.nav a.router-link-active {
  color: #2563eb;
}

.main {
  flex: 1;
  padding: 24px;
}

/* Toast 样式 */
.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease;
  z-index: 1000;
}

.toast.success {
  background: #d1fae5;
  color: #065f46;
}

.toast.error {
  background: #fee2e2;
  color: #991b1b;
}

.toast.info {
  background: #dbeafe;
  color: #1e40af;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>