<template>
  <div class="options">
    <h1>扩展设置</h1>

    <div class="setting-group">
      <h2>基本设置</h2>
      <label class="checkbox-label">
        <input type="checkbox" v-model="settings.autoStart" />
        开机自动启动
      </label>
      <label class="checkbox-label">
        <input type="checkbox" v-model="settings.showBadge" />
        显示徽章计数
      </label>
    </div>

    <div class="setting-group">
      <h2>服务器配置</h2>
      <div class="input-group">
        <label>服务器地址</label>
        <input type="text" v-model="settings.serverUrl" placeholder="http://localhost:3000" />
      </div>
    </div>

    <button @click="saveSettings" class="save-btn">保存设置</button>
    <div v-if="saved" class="status success">设置已保存</div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'

const settings = reactive({
  autoStart: false,
  showBadge: false,
  serverUrl: 'http://localhost:3000'
})

const saved = ref(false)

onMounted(() => {
  // 从存储加载设置
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.sync.get(['autoStart', 'showBadge', 'serverUrl'], (result) => {
      settings.autoStart = result.autoStart || false
      settings.showBadge = result.showBadge || false
      settings.serverUrl = result.serverUrl || 'http://localhost:3000'
    })
  }
})

function saveSettings() {
  // 保存到存储
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.sync.set({
      autoStart: settings.autoStart,
      showBadge: settings.showBadge,
      serverUrl: settings.serverUrl
    })
  }
  saved.value = true
  setTimeout(() => { saved.value = false }, 2000)
}
</script>

<style>
.options {
  font-family: system-ui, -apple-system, sans-serif;
  padding: 20px;
  max-width: 500px;
}
h1 {
  font-size: 18px;
  margin-bottom: 20px;
}
.setting-group {
  margin-bottom: 20px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}
.setting-group h2 {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 12px;
}
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  cursor: pointer;
}
.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.input-group label {
  font-size: 14px;
  color: #374151;
}
.input-group input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}
.save-btn {
  padding: 10px 20px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}
.save-btn:hover {
  background: #1d4ed8;
}
.status {
  padding: 10px;
  border-radius: 6px;
  margin-top: 12px;
  font-size: 14px;
}
.status.success {
  background: #d1fae5;
  color: #065f46;
}
</style>
