<template>
  <div id="app" class="dashboard-container">
    <header class="header">
      <h1>WXT Extension Dashboard</h1>
      <nav class="nav">
        <router-link to="/">Dashboard</router-link>
        <router-link to="/settings">Settings</router-link>
      </nav>
    </header>
    <main class="main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
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
</style>
