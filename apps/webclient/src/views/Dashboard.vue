<template>
  <div class="dashboard">
    <h2>数据概览</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <h3>系统状态</h3>
        <p class="stat-value">{{ status }}</p>
      </div>
      <div class="stat-card">
        <h3>版本信息</h3>
        <p class="stat-value">{{ version }}</p>
      </div>
      <div class="stat-card">
        <h3>浏览器扩展</h3>
        <button @click="openExtension" class="extension-btn">打开扩展</button>
      </div>
    </div>

    <h2>操作日志</h2>
    <div class="logs-section">
      <div v-if="!logs.length" class="no-logs">暂无日志</div>
      <div v-for="log in logs" :key="log.id" class="log-entry">
        <span class="log-time">{{ log.time }}</span>
        <span class="log-message">{{ log.message }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { apiClient } from '../services/api'

// 定义 emit 事件
const emit = defineEmits<{
  (e: 'refresh-data'): void
  (e: 'open-settings'): void
  (e: 'sync-state'): void
}>()

const status = ref('加载中...')
const version = ref('-')
const timestamp = ref('-')
const extensionInstalled = ref(false)
const logs = ref<Array<{id: number; time: string; message: string}>>([])
const isLoading = ref(false)

// 刷新数据方法 - 供外部调用
async function refreshData() {
  isLoading.value = true
  status.value = '刷新中...'

  try {
    const health = await apiClient.get('/health')
    status.value = health.status === 'ok' ? '运行正常' : '异常'

    const statusData = await apiClient.get('/api/status')
    version.value = statusData.version
    timestamp.value = new Date(statusData.timestamp).toLocaleString('zh-CN')

    // 模拟日志数据
    logs.value = [
      { id: Date.now(), time: new Date().toLocaleString('zh-CN'), message: '数据已刷新' },
      ...logs.value
    ].slice(0, 10)
  } catch (error) {
    status.value = '连接失败'
    console.error('Failed to fetch data:', error)
  } finally {
    isLoading.value = false
  }
}

// 暴露方法供父组件调用
defineExpose({
  refreshData
})

onMounted(async () => {
  await refreshData()
})

function openExtension() {
  const win = window as Window & { chrome?: typeof window.chrome }
  if (win.chrome?.runtime?.openOptionsPage) {
    win.chrome.runtime.openOptionsPage()
  } else {
    alert('请在浏览器地址栏输入 chrome://extensions 打开扩展管理页面')
  }
}
</script>

<style scoped>
.dashboard h2 {
  font-size: 18px;
  margin-bottom: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
}

.stat-card h3 {
  font-size: 14px;
  margin: 0 0 8px;
  color: #6b7280;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.logs-section {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  min-height: 100px;
}

.no-logs {
  color: #9ca3af;
  text-align: center;
  padding: 20px;
}

.log-entry {
  display: flex;
  gap: 16px;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
}

.log-entry:last-child {
  border-bottom: none;
}

.log-time {
  color: #9ca3af;
  font-size: 14px;
}

.log-message {
  flex: 1;
  font-size: 14px;
}

.extension-btn {
  padding: 8px 16px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.extension-btn:hover {
  background: #1d4ed8;
}
</style>