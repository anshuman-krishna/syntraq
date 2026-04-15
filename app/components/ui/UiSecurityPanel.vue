<script setup lang="ts">
interface SessionInfo {
  id: string
  current: boolean
  expiresAt: string | Date
  fresh: boolean
}

interface OauthAccount {
  id: string
  provider: 'google' | 'microsoft'
  email: string | null
  createdAt: string | Date
}

interface MfaStatus {
  enrolled: boolean
  verified: boolean
  remainingRecoveryCodes: number
}

const ui = useUiStore()

const sessions = ref<SessionInfo[]>([])
const oauth = ref<OauthAccount[]>([])
const mfa = ref<MfaStatus>({ enrolled: false, verified: false, remainingRecoveryCodes: 0 })
const loading = ref(false)

const enrollSecret = ref('')
const enrollUrl = ref('')
const enrollCode = ref('')
const enrolling = ref(false)
const recoveryCodes = ref<string[]>([])

async function refresh() {
  loading.value = true
  try {
    const [s, o, m] = await Promise.all([
      $fetch<{ sessions: SessionInfo[] }>('/api/auth/sessions'),
      $fetch<{ accounts: OauthAccount[] }>('/api/auth/oauth/accounts'),
      $fetch<MfaStatus>('/api/auth/mfa/status'),
    ])
    sessions.value = s.sessions
    oauth.value = o.accounts
    mfa.value = m
  } catch {
    // swallow, the panel just won't populate
  } finally {
    loading.value = false
  }
}

async function revokeSession(id: string) {
  await $fetch('/api/auth/sessions/revoke', { method: 'POST', body: { id } })
  ui.addToast({ type: 'success', message: 'session revoked' })
  if (sessions.value.find(s => s.id === id)?.current) {
    navigateTo('/login')
    return
  }
  refresh()
}

async function revokeOthers() {
  await $fetch('/api/auth/sessions/revoke-others', { method: 'POST' })
  ui.addToast({ type: 'success', message: 'other sessions signed out' })
  refresh()
}

async function unlinkOauth(id: string) {
  await $fetch('/api/auth/oauth/unlink', { method: 'POST', body: { id } })
  ui.addToast({ type: 'success', message: 'account unlinked' })
  refresh()
}

async function startMfaEnroll() {
  enrolling.value = true
  try {
    const r = await $fetch<{ secret: string; otpauthUrl: string }>('/api/auth/mfa/enroll', { method: 'POST' })
    enrollSecret.value = r.secret
    enrollUrl.value = r.otpauthUrl
  } catch (e: unknown) {
    ui.addToast({ type: 'error', message: e instanceof Error ? e.message : 'enroll failed' })
    enrolling.value = false
  }
}

async function verifyMfa() {
  try {
    const r = await $fetch<{ ok: boolean; recoveryCodes?: string[] }>('/api/auth/mfa/verify', {
      method: 'POST',
      body: { code: enrollCode.value },
    })
    if (r.recoveryCodes) recoveryCodes.value = r.recoveryCodes
    ui.addToast({ type: 'success', message: 'mfa enabled' })
    enrollCode.value = ''
    enrollSecret.value = ''
    enrollUrl.value = ''
    enrolling.value = false
    refresh()
  } catch (e: unknown) {
    ui.addToast({ type: 'error', message: e instanceof Error ? e.message : 'invalid code' })
  }
}

async function disableMfa() {
  const code = prompt('enter a current totp or recovery code to disable mfa')
  if (!code) return
  try {
    await $fetch('/api/auth/mfa/disable', { method: 'POST', body: { code } })
    ui.addToast({ type: 'success', message: 'mfa disabled' })
    recoveryCodes.value = []
    refresh()
  } catch (e: unknown) {
    ui.addToast({ type: 'error', message: e instanceof Error ? e.message : 'disable failed' })
  }
}

function formatDate(d: string | Date) {
  return new Date(d).toLocaleString()
}

onMounted(refresh)
</script>

<template>
  <div class="space-y-6">
    <UiCard padding="lg">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-sm font-semibold text-white/70">active sessions</h2>
        <UiButton
          v-if="sessions.length > 1"
          variant="ghost"
          size="sm"
          @click="revokeOthers"
        >
          sign out others
        </UiButton>
      </div>

      <div v-if="loading && !sessions.length" class="text-xs text-white/30">loading…</div>
      <div v-else-if="!sessions.length" class="text-xs text-white/30">no active sessions</div>
      <ul v-else class="space-y-2">
        <li
          v-for="s in sessions"
          :key="s.id"
          class="flex items-center justify-between p-3 rounded-xl bg-glass-white/50"
        >
          <div class="text-xs space-y-0.5">
            <p class="text-white/80 font-mono text-[11px]">{{ s.id.slice(0, 10) }}…</p>
            <p class="text-white/30">expires {{ formatDate(s.expiresAt) }}</p>
          </div>
          <div class="flex items-center gap-2">
            <span v-if="s.current" class="text-[10px] px-2 py-0.5 rounded-full bg-sky-pastel/10 text-sky-pastel">this device</span>
            <button
              class="text-[11px] text-red-400/60 hover:text-red-400 transition-colors"
              @click="revokeSession(s.id)"
            >
              revoke
            </button>
          </div>
        </li>
      </ul>
    </UiCard>

    <UiCard padding="lg">
      <h2 class="text-sm font-semibold text-white/70 mb-4">two-factor authentication</h2>

      <div v-if="mfa.verified && !recoveryCodes.length" class="space-y-3">
        <div class="flex items-center justify-between p-3 rounded-xl bg-glass-white/50">
          <div class="text-xs">
            <p class="text-white/80">enabled</p>
            <p class="text-white/30">{{ mfa.remainingRecoveryCodes }} recovery codes remaining</p>
          </div>
          <button
            class="text-[11px] text-red-400/60 hover:text-red-400 transition-colors"
            @click="disableMfa"
          >
            disable
          </button>
        </div>
      </div>

      <div v-else-if="recoveryCodes.length" class="space-y-3">
        <p class="text-xs text-white/60">save these recovery codes somewhere safe — they won't be shown again.</p>
        <div class="grid grid-cols-2 gap-2 p-3 rounded-xl bg-glass-white/50 font-mono text-[11px] text-white/80">
          <span v-for="code in recoveryCodes" :key="code">{{ code }}</span>
        </div>
        <UiButton variant="ghost" size="sm" @click="recoveryCodes = []">i've saved them</UiButton>
      </div>

      <div v-else-if="enrolling && enrollSecret" class="space-y-3">
        <p class="text-xs text-white/60">scan this uri with your authenticator, then enter the 6-digit code.</p>
        <div class="p-3 rounded-xl bg-glass-white/50 text-[11px] font-mono text-white/60 break-all">
          {{ enrollUrl }}
        </div>
        <p class="text-[11px] text-white/40">or enter manually: <span class="font-mono text-white/70">{{ enrollSecret }}</span></p>
        <UiInput v-model="enrollCode" label="code" placeholder="123456" />
        <UiButton variant="primary" size="sm" :disabled="enrollCode.length < 6" @click="verifyMfa">
          verify & enable
        </UiButton>
      </div>

      <UiButton v-else variant="primary" size="sm" @click="startMfaEnroll">
        enable 2fa
      </UiButton>
    </UiCard>

    <UiCard padding="lg">
      <h2 class="text-sm font-semibold text-white/70 mb-4">linked accounts</h2>
      <div v-if="!oauth.length" class="text-xs text-white/30">no linked oauth accounts</div>
      <ul v-else class="space-y-2">
        <li
          v-for="a in oauth"
          :key="a.id"
          class="flex items-center justify-between p-3 rounded-xl bg-glass-white/50"
        >
          <div class="text-xs">
            <p class="text-white/80 capitalize">{{ a.provider }}</p>
            <p class="text-white/30">{{ a.email ?? '—' }}</p>
          </div>
          <button
            class="text-[11px] text-red-400/60 hover:text-red-400 transition-colors"
            @click="unlinkOauth(a.id)"
          >
            unlink
          </button>
        </li>
      </ul>
    </UiCard>
  </div>
</template>
