<template>
  <div class="options">
    <h1>扩展设置</h1>
    <div class="setting-group">
      <h2>基本设置</h2>
      <label>
        <input type="checkbox" v-model="settings.autoStart" />
        开机自动启动
      </label>
    </div>
    <button @click="saveSettings" class="save-btn">保存设置</button>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const settings = reactive({
  autoStart: false
})

function saveSettings() {
  // 保存到 chrome.storage
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.sync.set(settings)
  }
  alert('设置已保存')
}
</script>

<style scoped>
.options {
  padding: 20px;
  max-width: 500px;
}
h1 {
  font-size: 20px;
  margin-bottom: 20px;
}
.setting-group {
  margin-bottom: 20px;
}
.setting-group h2 {
  font-size: 16px;
  margin-bottom: 10px;
}
label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  cursor: pointer;
}
.save-btn {
  padding: 10px 20px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.save-btn:hover {
  background: #1d4ed8;
}
</style>
