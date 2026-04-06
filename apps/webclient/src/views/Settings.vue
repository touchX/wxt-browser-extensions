<template>
  <div class="settings">
    <h2>设置</h2>

    <div class="setting-section">
      <h3>服务器配置</h3>
      <div class="setting-item">
        <label>API 地址</label>
        <input v-model="settings.apiUrl" type="text" placeholder="http://localhost:3000" />
      </div>
      <div class="setting-item">
        <label>请求超时 (ms)</label>
        <input v-model.number="settings.timeout" type="number" min="1000" max="30000" />
      </div>
    </div>

    <div class="setting-section">
      <h3>显示配置</h3>
      <div class="setting-item">
        <label>主题模式</label>
        <select v-model="settings.theme">
          <option value="light">浅色</option>
          <option value="dark">深色</option>
          <option value="auto">跟随系统</option>
        </select>
      </div>
    </div>

    <div class="actions">
      <button @click="saveSettings" class="btn-primary">保存设置</button>
      <button @click="resetSettings" class="btn-secondary">重置</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const settings = reactive({
  apiUrl: 'http://localhost:3000',
  timeout: 5000,
  theme: 'light'
})

function saveSettings() {
  localStorage.setItem('dashboard-settings', JSON.stringify(settings))
  alert('设置已保存')
}

function resetSettings() {
  settings.apiUrl = 'http://localhost:3000'
  settings.timeout = 5000
  settings.theme = 'light'
}
</script>

<style scoped>
.settings h2 {
  font-size: 18px;
  margin-bottom: 24px;
}

.setting-section {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.setting-section h3 {
  font-size: 16px;
  margin: 0 0 16px;
}

.setting-item {
  margin-bottom: 16px;
}

.setting-item:last-child {
  margin-bottom: 0;
}

.setting-item label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #374151;
}

.setting-item input,
.setting-item select {
  width: 100%;
  max-width: 400px;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: #2563eb;
  color: #fff;
}

.btn-secondary {
  background: #fff;
  color: #374151;
  border: 1px solid #d1d5db;
}
</style>
