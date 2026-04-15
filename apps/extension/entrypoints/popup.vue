<template>
  <div class="popup">
    <h1>WXT 浏览器扩展</h1>
    <div class="status" :class="statusClass">{{ status }}</div>
    <button @click="checkServer" class="btn">检查服务器</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const status = ref('点击按钮检查服务器状态')
const statusClass = ref('')

async function checkServer() {
  status.value = '检查中...'
  statusClass.value = ''

  try {
    const res = await fetch('http://localhost:3000/health')
    const data = await res.json()
    status.value = `服务器: ${data.status}`
    statusClass.value = data.status === 'ok' ? 'success' : 'error'
  } catch (e) {
    status.value = '服务器: 无法连接'
    statusClass.value = 'error'
  }
}
</script>

<style>
.popup {
  font-family: system-ui, -apple-system, sans-serif;
  padding: 16px;
  min-width: 280px;
}
h1 {
  font-size: 16px;
  margin-bottom: 12px;
  color: #111827;
}
.status {
  padding: 12px;
  border-radius: 6px;
  font-size: 14px;
  margin-bottom: 12px;
}
.status.success {
  background: #d1fae5;
  color: #065f46;
}
.status.error {
  background: #fee2e2;
  color: #991b1b;
}
.btn {
  width: 100%;
  padding: 10px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}
.btn:hover {
  background: #1d4ed8;
}
</style>
