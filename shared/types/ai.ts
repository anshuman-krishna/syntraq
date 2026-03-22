export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface ChatRequest {
  message: string
  context: {
    route: string
    module?: string
  }
}

export interface ChatResponse {
  message: ChatMessage
}
