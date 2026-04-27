<script setup lang="ts">
const activeTab = ref<'api-keys' | 'webhooks' | 'automations'>('api-keys')
const ui = useUiStore()

// api keys state
const apiKeys = ref<Array<{
  id: string
  name: string
  prefix: string
  permissions: Record<string, boolean>
  lastUsedAt: string | null
  createdAt: string
}>>([])
const newKeyName = ref('')
const newKeyPermissions = ref({ employees: true, shifts: true, vehicles: true, workflows: true })
const showCreateKey = ref(false)
const createdKey = ref('')

// webhooks state
const webhooks = ref<Array<{
  id: string
  url: string
  eventTypes: string[]
  active: boolean
  failureCount: number
  lastTriggeredAt: string | null
  createdAt: string
}>>([])
const showCreateWebhook = ref(false)
const newWebhookUrl = ref('')
const newWebhookEvents = ref<string[]>([])

// automations state
const automations = ref<Array<{
  id: string
  name: string
  trigger: string
  conditions: unknown[]
  actions: unknown[]
  active: boolean
  triggerCount: number
  lastTriggeredAt: string | null
  createdAt: string
}>>([])
const showCreateAutomation = ref(false)
const newAutomationName = ref('')
const newAutomationTrigger = ref('shift.created')

const webhookEventOptions = [
  'shift.created', 'shift.updated', 'shift.completed', 'shift.cancelled',
  'employee.created', 'employee.updated',
  'workflow.created', 'workflow.completed',
  'vehicle.status_changed',
  'approval.created', 'approval.resolved',
  'escalation.created', 'escalation.resolved',
]

const automationTriggerOptions = [
  'shift.created', 'shift.completed', 'shift.cancelled',
  'employee.created', 'vehicle.status_changed',
  'approval.resolved', 'escalation.created',
]

onMounted(() => {
  loadApiKeys()
  loadWebhooks()
  loadAutomations()
})

async function loadApiKeys() {
  try {
    const data = await $fetch<{ keys: typeof apiKeys.value }>('/api/api-keys')
    apiKeys.value = data.keys
  } catch { /* handled */ }
}

async function loadWebhooks() {
  try {
    const data = await $fetch<{ webhooks: typeof webhooks.value }>('/api/webhooks')
    webhooks.value = data.webhooks
  } catch { /* handled */ }
}

async function loadAutomations() {
  try {
    const data = await $fetch<{ automations: typeof automations.value }>('/api/automations')
    automations.value = data.automations
  } catch { /* handled */ }
}

async function createApiKey() {
  if (!newKeyName.value.trim()) return
  try {
    const data = await $fetch<{ key: { key: string } }>('/api/api-keys', {
      method: 'POST',
      body: { name: newKeyName.value, permissions: newKeyPermissions.value },
    })
    createdKey.value = data.key.key
    newKeyName.value = ''
    ui.addToast({ type: 'success', message: 'api key created — copy it now, it won\'t be shown again' })
    await loadApiKeys()
  } catch {
    ui.addToast({ type: 'error', message: 'failed to create api key' })
  }
}

async function revokeKey(id: string) {
  try {
    await $fetch('/api/api-keys/revoke', { method: 'POST', body: { id } })
    ui.addToast({ type: 'success', message: 'api key revoked' })
    await loadApiKeys()
  } catch {
    ui.addToast({ type: 'error', message: 'failed to revoke key' })
  }
}

async function createWebhook() {
  if (!newWebhookUrl.value.trim() || !newWebhookEvents.value.length) return
  try {
    await $fetch('/api/webhooks', {
      method: 'POST',
      body: { url: newWebhookUrl.value, eventTypes: newWebhookEvents.value },
    })
    showCreateWebhook.value = false
    newWebhookUrl.value = ''
    newWebhookEvents.value = []
    ui.addToast({ type: 'success', message: 'webhook created' })
    await loadWebhooks()
  } catch {
    ui.addToast({ type: 'error', message: 'failed to create webhook' })
  }
}

async function toggleWebhook(id: string, active: boolean) {
  try {
    await $fetch('/api/webhooks/update', { method: 'PUT', body: { id, active: !active } })
    await loadWebhooks()
  } catch {
    ui.addToast({ type: 'error', message: 'failed to update webhook' })
  }
}

async function removeWebhook(id: string) {
  try {
    await $fetch('/api/webhooks/remove', { method: 'POST', body: { id } })
    ui.addToast({ type: 'success', message: 'webhook deleted' })
    await loadWebhooks()
  } catch {
    ui.addToast({ type: 'error', message: 'failed to delete webhook' })
  }
}

async function createAutomation() {
  if (!newAutomationName.value.trim()) return
  try {
    await $fetch('/api/automations', {
      method: 'POST',
      body: {
        name: newAutomationName.value,
        trigger: newAutomationTrigger.value,
        conditions: [],
        actions: [{ type: 'trigger_webhook', config: {} }],
      },
    })
    showCreateAutomation.value = false
    newAutomationName.value = ''
    ui.addToast({ type: 'success', message: 'automation created' })
    await loadAutomations()
  } catch {
    ui.addToast({ type: 'error', message: 'failed to create automation' })
  }
}

async function toggleAutomation(id: string, active: boolean) {
  try {
    await $fetch('/api/automations/update', { method: 'PUT', body: { id, active: !active } })
    await loadAutomations()
  } catch {
    ui.addToast({ type: 'error', message: 'failed to update automation' })
  }
}

async function removeAutomation(id: string) {
  try {
    await $fetch('/api/automations/remove', { method: 'POST', body: { id } })
    ui.addToast({ type: 'success', message: 'automation deleted' })
    await loadAutomations()
  } catch {
    ui.addToast({ type: 'error', message: 'failed to delete automation' })
  }
}

function toggleEventType(event: string) {
  const idx = newWebhookEvents.value.indexOf(event)
  if (idx >= 0) {
    newWebhookEvents.value.splice(idx, 1)
  } else {
    newWebhookEvents.value.push(event)
  }
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
  ui.addToast({ type: 'success', message: 'copied to clipboard' })
}

function formatDate(date: string | null) {
  if (!date) return 'never'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <div>
      <h1 class="text-2xl font-bold text-white mb-1">integrations</h1>
      <p class="text-sm text-white/40">manage api keys, webhooks, and automations</p>
    </div>

    <!-- tabs -->
    <div class="flex gap-1 p-1 rounded-xl bg-glass-white/50 w-fit">
      <button
        v-for="tab in (['api-keys', 'webhooks', 'automations'] as const)"
        :key="tab"
        class="px-4 py-2 rounded-lg text-sm transition-all duration-200"
        :class="activeTab === tab
          ? 'bg-white/[0.08] text-white shadow-sm'
          : 'text-white/40 hover:text-white/60'"
        @click="activeTab = tab"
      >
        {{ tab.replace('-', ' ') }}
      </button>
    </div>

    <!-- api keys tab -->
    <div v-if="activeTab === 'api-keys'" class="space-y-4">
      <div class="flex items-center justify-between">
        <p class="text-sm text-white/50">{{ apiKeys.length }} key{{ apiKeys.length !== 1 ? 's' : '' }}</p>
        <button
          class="px-4 py-2 rounded-xl bg-sky-pastel/10 text-sky-pastel text-sm hover:bg-sky-pastel/20 transition-all duration-200"
          @click="showCreateKey = !showCreateKey; createdKey = ''"
        >
          + create key
        </button>
      </div>

      <!-- create key form -->
      <UiCard v-if="showCreateKey" padding="lg">
        <h3 class="text-sm font-semibold text-white/70 mb-4">new api key</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-xs text-white/40 mb-1.5">name</label>
            <input
              v-model="newKeyName"
              class="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm text-white placeholder-white/20 focus:outline-none focus:border-sky-pastel/30"
              placeholder="e.g. production, staging"
            >
          </div>
          <div>
            <label class="block text-xs text-white/40 mb-2">permissions</label>
            <div class="flex flex-wrap gap-2">
              <label
                v-for="perm in ['employees', 'shifts', 'vehicles', 'workflows']"
                :key="perm"
                class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] cursor-pointer hover:bg-white/[0.06] transition-all"
              >
                <input
                  v-model="newKeyPermissions[perm as keyof typeof newKeyPermissions]"
                  type="checkbox"
                  class="rounded"
                >
                <span class="text-xs text-white/60">{{ perm }}</span>
              </label>
            </div>
          </div>
          <button
            class="px-4 py-2 rounded-xl bg-sky-pastel/20 text-sky-pastel text-sm hover:bg-sky-pastel/30 transition-all"
            @click="createApiKey"
          >
            generate key
          </button>
        </div>

        <!-- show created key -->
        <div v-if="createdKey" class="mt-4 p-3 rounded-xl bg-mint/5 border border-mint/20">
          <p class="text-xs text-mint/70 mb-2">copy this key now — it won't be shown again</p>
          <div class="flex items-center gap-2">
            <code class="flex-1 text-xs text-mint bg-black/20 px-3 py-2 rounded-lg break-all">{{ createdKey }}</code>
            <button
              class="px-3 py-2 rounded-lg bg-mint/10 text-mint text-xs hover:bg-mint/20 transition-all"
              @click="copyToClipboard(createdKey)"
            >
              copy
            </button>
          </div>
        </div>
      </UiCard>

      <!-- key list -->
      <UiCard v-for="key in apiKeys" :key="key.id" padding="md">
        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="text-sm text-white/80 font-medium">{{ key.name }}</span>
              <code class="text-[10px] text-white/30 bg-white/[0.04] px-1.5 py-0.5 rounded">{{ key.prefix }}...</code>
            </div>
            <div class="flex items-center gap-3 text-[11px] text-white/30">
              <span>created {{ formatDate(key.createdAt) }}</span>
              <span>last used {{ formatDate(key.lastUsedAt) }}</span>
            </div>
          </div>
          <button
            class="px-3 py-1.5 rounded-lg text-xs text-red-400/60 hover:bg-red-400/[0.06] transition-all"
            @click="revokeKey(key.id)"
          >
            revoke
          </button>
        </div>
      </UiCard>

      <p v-if="!apiKeys.length && !showCreateKey" class="text-center text-sm text-white/30 py-8">
        no api keys yet. create one to access the public api.
      </p>
    </div>

    <!-- webhooks tab -->
    <div v-if="activeTab === 'webhooks'" class="space-y-4">
      <div class="flex items-center justify-between">
        <p class="text-sm text-white/50">{{ webhooks.length }} webhook{{ webhooks.length !== 1 ? 's' : '' }}</p>
        <button
          class="px-4 py-2 rounded-xl bg-sky-pastel/10 text-sky-pastel text-sm hover:bg-sky-pastel/20 transition-all duration-200"
          @click="showCreateWebhook = !showCreateWebhook"
        >
          + add webhook
        </button>
      </div>

      <!-- create webhook form -->
      <UiCard v-if="showCreateWebhook" padding="lg">
        <h3 class="text-sm font-semibold text-white/70 mb-4">new webhook</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-xs text-white/40 mb-1.5">endpoint url</label>
            <input
              v-model="newWebhookUrl"
              class="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm text-white placeholder-white/20 focus:outline-none focus:border-sky-pastel/30"
              placeholder="https://your-server.com/webhook"
            >
          </div>
          <div>
            <label class="block text-xs text-white/40 mb-2">events</label>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="evt in webhookEventOptions"
                :key="evt"
                class="px-2.5 py-1 rounded-lg text-[11px] transition-all"
                :class="newWebhookEvents.includes(evt)
                  ? 'bg-sky-pastel/20 text-sky-pastel border border-sky-pastel/30'
                  : 'bg-white/[0.04] text-white/40 hover:text-white/60 border border-transparent'"
                @click="toggleEventType(evt)"
              >
                {{ evt }}
              </button>
            </div>
          </div>
          <button
            class="px-4 py-2 rounded-xl bg-sky-pastel/20 text-sky-pastel text-sm hover:bg-sky-pastel/30 transition-all"
            @click="createWebhook"
          >
            create webhook
          </button>
        </div>
      </UiCard>

      <!-- webhook list -->
      <UiCard v-for="wh in webhooks" :key="wh.id" padding="md">
        <div class="flex items-center justify-between">
          <div class="space-y-1 min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <div
                class="w-2 h-2 rounded-full"
                :class="wh.active ? 'bg-mint' : 'bg-white/20'"
              />
              <span class="text-sm text-white/80 truncate">{{ wh.url }}</span>
            </div>
            <div class="flex items-center gap-3 text-[11px] text-white/30">
              <span>{{ wh.eventTypes.length }} event{{ wh.eventTypes.length !== 1 ? 's' : '' }}</span>
              <span v-if="wh.failureCount > 0" class="text-peach-glow/60">{{ wh.failureCount }} failures</span>
              <span>last triggered {{ formatDate(wh.lastTriggeredAt) }}</span>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button
              class="px-3 py-1.5 rounded-lg text-xs transition-all"
              :class="wh.active
                ? 'text-white/40 hover:bg-white/[0.04]'
                : 'text-mint/60 hover:bg-mint/[0.06]'"
              @click="toggleWebhook(wh.id, wh.active)"
            >
              {{ wh.active ? 'disable' : 'enable' }}
            </button>
            <button
              class="px-3 py-1.5 rounded-lg text-xs text-red-400/60 hover:bg-red-400/[0.06] transition-all"
              @click="removeWebhook(wh.id)"
            >
              delete
            </button>
          </div>
        </div>
      </UiCard>

      <p v-if="!webhooks.length && !showCreateWebhook" class="text-center text-sm text-white/30 py-8">
        no webhooks configured. add one to receive event notifications.
      </p>
    </div>

    <!-- automations tab -->
    <div v-if="activeTab === 'automations'" class="space-y-4">
      <div class="flex items-center justify-between">
        <p class="text-sm text-white/50">{{ automations.length }} automation{{ automations.length !== 1 ? 's' : '' }}</p>
        <button
          class="px-4 py-2 rounded-xl bg-sky-pastel/10 text-sky-pastel text-sm hover:bg-sky-pastel/20 transition-all duration-200"
          @click="showCreateAutomation = !showCreateAutomation"
        >
          + create automation
        </button>
      </div>

      <!-- create automation form -->
      <UiCard v-if="showCreateAutomation" padding="lg">
        <h3 class="text-sm font-semibold text-white/70 mb-4">new automation</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-xs text-white/40 mb-1.5">name</label>
            <input
              v-model="newAutomationName"
              class="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm text-white placeholder-white/20 focus:outline-none focus:border-sky-pastel/30"
              placeholder="e.g. notify on shift completion"
            >
          </div>
          <div>
            <label class="block text-xs text-white/40 mb-2">trigger</label>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="trig in automationTriggerOptions"
                :key="trig"
                class="px-2.5 py-1 rounded-lg text-[11px] transition-all"
                :class="newAutomationTrigger === trig
                  ? 'bg-sky-pastel/20 text-sky-pastel border border-sky-pastel/30'
                  : 'bg-white/[0.04] text-white/40 hover:text-white/60 border border-transparent'"
                @click="newAutomationTrigger = trig"
              >
                {{ trig }}
              </button>
            </div>
          </div>
          <button
            class="px-4 py-2 rounded-xl bg-sky-pastel/20 text-sky-pastel text-sm hover:bg-sky-pastel/30 transition-all"
            @click="createAutomation"
          >
            create automation
          </button>
        </div>
      </UiCard>

      <!-- automation list -->
      <UiCard v-for="auto in automations" :key="auto.id" padding="md">
        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <div
                class="w-2 h-2 rounded-full"
                :class="auto.active ? 'bg-mint' : 'bg-white/20'"
              />
              <span class="text-sm text-white/80 font-medium">{{ auto.name }}</span>
              <span class="text-[10px] text-white/30 bg-white/[0.04] px-1.5 py-0.5 rounded">
                {{ auto.trigger }}
              </span>
            </div>
            <div class="flex items-center gap-3 text-[11px] text-white/30">
              <span>triggered {{ auto.triggerCount }} time{{ auto.triggerCount !== 1 ? 's' : '' }}</span>
              <span>last run {{ formatDate(auto.lastTriggeredAt) }}</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button
              class="px-3 py-1.5 rounded-lg text-xs transition-all"
              :class="auto.active
                ? 'text-white/40 hover:bg-white/[0.04]'
                : 'text-mint/60 hover:bg-mint/[0.06]'"
              @click="toggleAutomation(auto.id, auto.active)"
            >
              {{ auto.active ? 'disable' : 'enable' }}
            </button>
            <button
              class="px-3 py-1.5 rounded-lg text-xs text-red-400/60 hover:bg-red-400/[0.06] transition-all"
              @click="removeAutomation(auto.id)"
            >
              delete
            </button>
          </div>
        </div>
      </UiCard>

      <p v-if="!automations.length && !showCreateAutomation" class="text-center text-sm text-white/30 py-8">
        no automations yet. create one to automate workflows.
      </p>
    </div>
  </div>
</template>
