<script setup lang="ts">
import type { PlanLimits, Usage } from '@shared/types/plan'
import { reportClientError } from '~/utils/reportClientError'

const auth = useAuthStore()
const ui = useUiStore()

const loading = ref(true)
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

const planThemes: Record<string, { badge: string; border: string; accent: string; copy: string }> = {
  free: {
    badge: 'starter',
    border: 'border-white/[0.08]',
    accent: 'text-white/55',
    copy: 'built for smaller teams validating their operating rhythm.',
  },
  pro: {
    badge: 'growth',
    border: 'border-sky-pastel/25',
    accent: 'text-sky-pastel',
    copy: 'unlocks replay, insights, and a larger operating envelope.',
  },
  enterprise: {
    badge: 'scale',
    border: 'border-mint/25',
    accent: 'text-mint',
    copy: 'for larger fleets that need wider limits and api-driven expansion.',
  },
}

const featureFlags = computed(() => {
  const enabled = Object.entries(limits.value.features)
    .filter(([, enabled]) => enabled)
    .map(([name]) => name.replace(/_/g, ' '))

  return enabled.length > 0
    ? enabled
    : ['core roster', 'shift scheduling', 'basic dashboard']
})

async function loadBillingState() {
  loading.value = true

  try {
    const data = await $fetch<{ limits: PlanLimits; usage: Usage; plan: { planName: string; planId: string } }>('/api/plans/usage')
    limits.value = data.limits
    usage.value = data.usage
    planName.value = data.plan.planName
    planId.value = data.plan.planId
  } catch (error) {
    reportClientError('billing.loadState', error)
    ui.addToast({ type: 'error', message: 'failed to load billing details' })
  } finally {
    loading.value = false
  }
}

async function handlePlanChange(_newPlanId: string) {
  showUpgrade.value = false
  await loadBillingState()
  ui.addToast({ type: 'success', message: 'billing plan updated' })
}

onMounted(loadBillingState)
</script>

<template>
  <div class="space-y-8 animate-fade-in">
    <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white mb-1">billing</h1>
        <p class="text-sm text-white/40">manage subscription limits, upgrade paths, and plan posture.</p>
      </div>

      <div class="flex items-center gap-2">
        <span
          class="px-2.5 py-1 rounded-lg text-[11px] font-medium uppercase tracking-[0.18em] border"
          :class="planThemes[planName]?.border ?? 'border-white/[0.08]'"
        >
          {{ planThemes[planName]?.badge ?? planName }}
        </span>
        <UiButton v-if="auth.isAdmin" variant="primary" size="sm" @click="showUpgrade = true">
          manage plan
        </UiButton>
      </div>
    </div>

    <div class="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <UiCard padding="lg" :class="planThemes[planName]?.border ?? 'border-white/[0.08]'">
        <template v-if="loading">
          <div class="space-y-4">
            <UiSkeleton variant="line" />
            <UiSkeleton variant="card" />
            <UiSkeleton variant="line" />
            <UiSkeleton variant="line" />
          </div>
        </template>

        <template v-else>
          <div class="flex flex-col gap-5">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-[11px] uppercase tracking-[0.18em] text-white/30">current plan</p>
                <h2 class="text-2xl font-semibold text-white capitalize mt-1">{{ planName }}</h2>
                <p class="text-sm mt-2 max-w-xl" :class="planThemes[planName]?.accent ?? 'text-white/55'">
                  {{ planThemes[planName]?.copy ?? 'subscription limits are active for this workspace.' }}
                </p>
              </div>

              <div class="text-right">
                <p class="text-[11px] uppercase tracking-[0.18em] text-white/30">workspace</p>
                <p class="text-sm text-white/65 mt-1">{{ auth.user?.companyName }}</p>
              </div>
            </div>

            <div class="grid gap-3 md:grid-cols-3">
              <div class="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                <p class="text-[11px] uppercase tracking-[0.16em] text-white/25">employees</p>
                <p class="text-2xl font-semibold text-white mt-2">{{ usage.employees }}</p>
                <p class="text-xs text-white/35 mt-1">of {{ limits.maxEmployees }} available seats</p>
              </div>

              <div class="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                <p class="text-[11px] uppercase tracking-[0.16em] text-white/25">monthly shifts</p>
                <p class="text-2xl font-semibold text-white mt-2">{{ usage.shifts }}</p>
                <p class="text-xs text-white/35 mt-1">of {{ limits.maxShiftsPerMonth }} scheduled this month</p>
              </div>

              <div class="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                <p class="text-[11px] uppercase tracking-[0.16em] text-white/25">workflows</p>
                <p class="text-2xl font-semibold text-white mt-2">{{ usage.workflows }}</p>
                <p class="text-xs text-white/35 mt-1">of {{ limits.maxWorkflows }} active workflow slots</p>
              </div>
            </div>

            <div class="space-y-4">
              <UiUsageBar label="employees" :current="usage.employees" :max="limits.maxEmployees" />
              <UiUsageBar label="shifts this month" :current="usage.shifts" :max="limits.maxShiftsPerMonth" />
              <UiUsageBar label="workflows" :current="usage.workflows" :max="limits.maxWorkflows" />
            </div>
          </div>
        </template>
      </UiCard>

      <div class="space-y-6">
        <UiCard padding="lg">
          <h2 class="text-sm font-semibold text-white/70 mb-4">enabled capabilities</h2>

          <template v-if="loading">
            <div class="space-y-3">
              <UiSkeleton v-for="i in 4" :key="i" variant="line" />
            </div>
          </template>

          <template v-else>
            <div class="space-y-2.5">
              <div
                v-for="feature in featureFlags"
                :key="feature"
                class="flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-2.5"
              >
                <svg class="w-4 h-4 text-mint/60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-sm text-white/60 capitalize">{{ feature }}</span>
              </div>
            </div>
          </template>
        </UiCard>

        <UiCard padding="lg">
          <h2 class="text-sm font-semibold text-white/70 mb-4">plan actions</h2>
          <div class="space-y-3">
            <UiButton v-if="auth.isAdmin" variant="primary" size="sm" class="w-full justify-center" @click="showUpgrade = true">
              review plans
            </UiButton>
            <UiButton variant="ghost" size="sm" class="w-full justify-center" @click="navigateTo('/pricing')">
              compare public pricing
            </UiButton>
            <UiButton variant="secondary" size="sm" class="w-full justify-center" @click="navigateTo('/settings')">
              account settings
            </UiButton>
          </div>

          <p v-if="!auth.isAdmin" class="text-xs text-white/35 mt-4">
            only admins can change subscription state. current access is read-only.
          </p>
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
