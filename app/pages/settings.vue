<script setup lang="ts">
import type { Plan, Usage, PlanLimits } from '@shared/types/plan'

const auth = useAuthStore()
const ui = useUiStore()

const profileName = ref(auth.user?.name ?? '')
const profileEmail = ref(auth.user?.email ?? '')

const showUpgrade = ref(false)
const planName = ref('free')
const planId = ref('free')
const usage = ref<Usage>({ employees: 0, shifts: 0, totalShifts: 0, workflows: 0 })
const limits = ref<PlanLimits>({
  maxUsers: 3,
  maxEmployees: 5,
  maxShiftsPerMonth: 50,
  maxWorkflows: 2,
  features: {},
})

onMounted(async () => {
  profileName.value = auth.user?.name ?? ''
  profileEmail.value = auth.user?.email ?? ''

  try {
    const data = await $fetch<{ limits: PlanLimits; usage: Usage; plan: { planName: string; planId: string } }>('/api/plans/usage')
    limits.value = data.limits
    usage.value = data.usage
    planName.value = data.plan.planName
    planId.value = data.plan.planId
  } catch {
    // fallback to defaults
  }
})

async function handlePlanChange(_newPlanId: string) {
  // modal handles stripe redirect internally
  // this callback fires for direct plan changes (free plan)
  ui.addToast({ type: 'success', message: 'plan updated' })
  showUpgrade.value = false

  try {
    const data = await $fetch<{ limits: PlanLimits; usage: Usage; plan: { planName: string; planId: string } }>('/api/plans/usage')
    limits.value = data.limits
    usage.value = data.usage
    planName.value = data.plan.planName
    planId.value = data.plan.planId
  } catch {
    // refresh on next page load
  }
}

async function handleLogout() {
  await auth.logout()
  navigateTo('/login')
}
</script>

<template>
  <div class="space-y-8 animate-fade-in">
    <div>
      <h1 class="text-2xl font-bold text-white mb-1">settings</h1>
      <p class="text-sm text-white/40">manage your account and preferences</p>
    </div>

    <div class="grid lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <UiCard padding="lg">
          <h2 class="text-sm font-semibold text-white/70 mb-6">profile</h2>
          <div class="space-y-4">
            <UiInput v-model="profileName" label="name" placeholder="enter your name" />
            <UiInput v-model="profileEmail" label="email" placeholder="enter your email" type="email" />
          </div>
          <div class="mt-6 flex justify-end">
            <UiButton variant="primary" size="sm">save changes</UiButton>
          </div>
        </UiCard>

        <UiCard padding="lg">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-sm font-semibold text-white/70">plan & usage</h2>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-1 rounded-lg text-[11px] font-medium capitalize" :class="{
                'bg-white/[0.06] text-white/40': planName === 'free',
                'bg-sky-pastel/10 text-sky-pastel border border-sky-pastel/20': planName === 'pro',
                'bg-mint/10 text-mint border border-mint/20': planName === 'enterprise',
              }">
                {{ planName }}
              </span>
              <UiButton v-if="auth.isAdmin" variant="ghost" size="sm" @click="showUpgrade = true">
                upgrade
              </UiButton>
            </div>
          </div>

          <div class="space-y-4">
            <UiUsageBar label="employees" :current="usage.employees" :max="limits.maxEmployees" />
            <UiUsageBar label="shifts this month" :current="usage.shifts" :max="limits.maxShiftsPerMonth" />
            <UiUsageBar label="workflows" :current="usage.workflows" :max="limits.maxWorkflows" />
          </div>
        </UiCard>

        <UiCard padding="lg">
          <h2 class="text-sm font-semibold text-white/70 mb-6">appearance</h2>
          <div class="flex items-center justify-between p-3 rounded-xl bg-glass-white/50">
            <div>
              <p class="text-sm text-white/80">dark mode</p>
              <p class="text-xs text-white/30">enabled by default</p>
            </div>
            <div class="w-10 h-6 rounded-full bg-sky-pastel/30 flex items-center justify-end px-1">
              <div class="w-4 h-4 rounded-full bg-sky-pastel" />
            </div>
          </div>
        </UiCard>
      </div>

      <div class="space-y-6">
        <UiCard padding="lg">
          <h2 class="text-sm font-semibold text-white/70 mb-4">company</h2>
          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="text-white/40">name</span>
              <span class="text-white/60">{{ auth.user?.companyName }}</span>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-white/40">your role</span>
              <span class="text-white/60 capitalize">{{ auth.user?.role }}</span>
            </div>
          </div>
        </UiCard>

        <UiCard padding="lg">
          <h2 class="text-sm font-semibold text-white/70 mb-4">account</h2>
          <div class="space-y-3">
            <div class="flex items-center gap-3 p-3 rounded-xl bg-glass-white/50 cursor-pointer hover:bg-glass-hover transition-all duration-200">
              <svg class="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span class="text-sm text-white/60">change password</span>
            </div>
            <button
              class="w-full flex items-center gap-3 p-3 rounded-xl bg-glass-white/50 hover:bg-red-400/[0.06] transition-all duration-200"
              @click="handleLogout"
            >
              <svg class="w-4 h-4 text-red-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span class="text-sm text-red-400/60">sign out</span>
            </button>
          </div>
        </UiCard>
      </div>
    </div>

    <UiUpgradeModal
      :open="showUpgrade"
      :current-plan-id="planId"
      @close="showUpgrade = false"
      @select="handlePlanChange"
    />
  </div>
</template>
