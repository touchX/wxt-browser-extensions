// 扩展通信 Composable
// 封装与扩展 Content Script 的消息通信逻辑

import { ref, onMounted, onUnmounted } from 'vue'

// 消息类型
export type ExtensionMessageType = 'REFRESH_DATA' | 'OPEN_SETTINGS' | 'SYNC_STATE'

// 消息格式
export interface ExtensionMessage {
  type: ExtensionMessageType
  payload?: unknown
  source?: string
}

// 响应格式
export interface ExtensionResponse {
  type: 'ACTION_COMPLETED' | 'ACTION_FAILED'
  payload: {
    success: boolean
    message?: string
  }
}

// 回调函数类型
type MessageHandler = (message: ExtensionMessage) => void

export function useExtension() {
  const isConnected = ref(false)
  const lastMessage = ref<ExtensionMessage | null>(null)

  let messageHandler: ((event: MessageEvent) => void) | null = null

  // 注册消息监听
  function onMessage(handler: MessageHandler) {
    if (messageHandler) {
      // 移除旧的监听器
      window.removeEventListener('message', messageHandler)
    }

    messageHandler = (event: MessageEvent) => {
      // 仅处理来自扩展的消息
      if (event.data?.source !== 'extension') return

      // 验证消息格式
      if (!event.data?.type) return

      lastMessage.value = event.data as ExtensionMessage
      handler(event.data as ExtensionMessage)
      isConnected.value = true
    }

    window.addEventListener('message', messageHandler)
  }

  // 移除消息监听
  function offMessage() {
    if (messageHandler) {
      window.removeEventListener('message', messageHandler)
      messageHandler = null
    }
  }

  // 发送响应到扩展
  function sendResponse(response: ExtensionResponse) {
    window.postMessage({
      ...response,
      source: 'webclient'
    }, '*')
  }

  // 清理函数
  onUnmounted(() => {
    offMessage()
  })

  return {
    isConnected,
    lastMessage,
    onMessage,
    offMessage,
    sendResponse
  }
}