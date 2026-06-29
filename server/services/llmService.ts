import Anthropic from '@anthropic-ai/sdk'
import { loggerService } from './loggerService'

// provider-agnostic llm wrapper. anthropic is the only provider wired today;
// the surface (isConfigured / complete) is deliberately small so a second
// provider can be added without touching callers. callers must tolerate a null
// return — the ai assistant falls back to its heuristic when no key is set.
const MODEL = process.env.AI_MODEL || 'claude-opus-4-8'
const MAX_TOKENS = 1024

let client: Anthropic | null = null

function getClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return null
  if (!client) client = new Anthropic({ apiKey })
  return client
}

export interface LlmMessage {
  role: 'user' | 'assistant'
  content: string
}

export const llmService = {
  isConfigured(): boolean {
    return Boolean(process.env.ANTHROPIC_API_KEY)
  },

  async complete(system: string, messages: LlmMessage[]): Promise<string | null> {
    const anthropic = getClient()
    if (!anthropic) return null

    try {
      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system,
        messages,
      })

      const text = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === 'text')
        .map(block => block.text)
        .join('')
        .trim()

      return text || null
    } catch (e) {
      loggerService.error('llm completion failed', { error: e instanceof Error ? e.message : 'unknown' })
      return null
    }
  },
}
