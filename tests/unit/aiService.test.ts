import { describe, expect, it } from 'vitest'
import { aiService } from '../../server/services/aiService'
import { llmService } from '../../server/services/llmService'

describe('aiService', () => {
  it('reports the llm as unconfigured when no api key is set', () => {
    expect(llmService.isConfigured()).toBe(false)
  })

  it('falls back to the heuristic responder without a provider', async () => {
    const reply = await aiService.respond('how do i create a shift?', { route: '/roster', module: 'roster' })
    expect(reply.role).toBe('assistant')
    expect(reply.content.length).toBeGreaterThan(0)
  })

  it('still generates a workflow from intent', () => {
    const wf = aiService.generateWorkflow('create an inspection checklist')
    expect(wf?.name).toBe('vehicle inspection')
    expect(wf?.steps.length).toBeGreaterThan(0)
  })
})
