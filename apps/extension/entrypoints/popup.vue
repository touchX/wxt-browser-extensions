<template>
  <div class="popup">
    <h1>WXT Extension</h1>
    <div class="status" v-if="status">{{ status }}</div>
    <button @click="checkStatus">Check Status</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const status = ref('')

onMounted(() => {
  console.log('Extension popup loaded')
})

async function checkStatus() {
  try {
    const response = await fetch('http://localhost:3000/health')
    const data = await response.json()
    status.value = `Server: ${data.status}`
  } catch (error) {
    status.value = 'Server: unreachable'
  }
}
</script>

<style scoped>
.popup {
  padding: 16px;
  min-width: 300px;
  font-family: system-ui, -apple-system, sans-serif;
}
h1 {
  font-size: 18px;
  margin: 0 0 16px;
}
.status {
  padding: 8px 12px;
  background: #f0f0f0;
  border-radius: 4px;
  margin-bottom: 12px;
}
button {
  padding: 8px 16px;
  background: #007acc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background: #005a9e;
}
</style>
