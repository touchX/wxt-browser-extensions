/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Chrome extension API types (仅在扩展上下文中可用)
interface ChromeRuntime {
  openOptionsPage(): void
  getURL(path: string): string
  id?: string
}

interface ChromeManagement {
  getSelf(callback: (ext: { id: string; name: string }) => void): void
}

interface Window {
  chrome?: {
    runtime?: ChromeRuntime
    management?: ChromeManagement
  }
}
