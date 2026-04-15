import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Dashboard from './views/Dashboard.vue'
import Settings from './views/Settings.vue'
import ApiTest from './views/ApiTest.vue'
import PatientData from './views/PatientData.vue'

const routes = [
  { path: '/', component: Dashboard },
  { path: '/patient-data', component: PatientData },
  { path: '/api-test', component: ApiTest },
  { path: '/settings', component: Settings }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.mount('#app')
