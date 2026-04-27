<script setup lang="ts">
import type { Plan } from '@shared/types/plan'
import { reportClientError } from '~/utils/reportClientError'

const props = defineProps<{
  open: boolean
  currentPlanId: string
}>()

const emit = defineEmits<{
  close: []
  select: [planId: string]
}>()

const ui = useUiStore()
const plans = ref<Plan[]>([])
const loading = ref(true)
const changing = ref(false)

watch(() => props.open, async (isOpen) => {
  if (!isOpen || plans.value.length > 0) return
  try {
    const data = await $fetch<{ plans: Plan[] }>('/api/plans')
    plans.value = data.plans
  } catch (error) {
    reportClientError('billing.loadPlans', error)
    ui.addToast({ type: 'error', message: 'failed to load billing plans' })
  } finally {
    loading.value = false
  }
})

async function selectPlan(planId: string) {
  if (planId === props.currentPlanId || changing.value) return
  changing.value = true

  try {
    const result = await $fetch<{ redirect?: string; subscription?: unknown }>('/api/plans/change', {
      method: 'POST',
      body: { planId },
    })

    // stripe checkout redirect
    if (result.redirect) {
      window.location.href = result.redirect
      return
    }

    // direct plan change (free plan or stripe not configured)
    emit('select', planId)
  } catch (error) {
    reportClientError('billing.selectPlan', error, { planId })
    ui.addToast({ type: 'error', message: 'failed to change plan' })
  } finally {
    changing.value = false
  }
}

const planHighlights: Record<string, { badge: string; border: string; features: string[] }> = {
  free: {
    badge: '',
    border: 'border-white/[0.08]',
    features: ['5 employees', '50 shifts/month', '2 workflows', 'basic dashboard'],
  },
  pro: {
    badge: 'popular',
    border: 'border-sky-pastel/30',
    features: ['50 employees', '500 shifts/month', '20 workflows', 'replay + insights', 'audit log', 'priority support'],
  },
  enterprise: {
    badge: '',
    border: 'border-mint/20',
    features: ['unlimited employees', 'unlimited shifts', 'unlimited workflows', 'all features', 'dedicated support', 'api access'],
  },
}

function formatPrice(price: number): string {
  if (price === 0) return 'free'
  if (price === -1) return 'custom'
  return `$${price}/mo`
}
</script>

<template>
  <UiModal :open="open" @close="emit('close')">
    <div class="p-6 space-y-6 max-w-2xl">
      <div class="text-center">
        <h2 class="text-xl font-bold text-white">choose your plan</h2>
        <p class="text-sm text-white/40 mt-1">unlock more power for your operations</p>
      </div>

      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="w-6 h-6 border-2 border-sky-pastel/30 border-t-sky-pastel rounded-full animate-spin" />
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          v-for="plan in plans"
          :key="plan.id"
          class="relative rounded-2xl border p-5 space-y-4 transition-all duration-200 hover:bg-white/[0.02]"
          :class="[
            planHighlights[plan.name]?.border ?? 'border-white/[0.08]',
            plan.id === currentPlanId ? 'bg-white/[0.04]' : '',
          ]"
        >
          <span
            v-if="planHighlights[plan.name]?.badge"
            class="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-medium bg-sky-pastel/20 text-sky-pastel border border-sky-pastel/20"
          >
            {{ planHighlights[plan.name].badge }}
          </span>

          <div>
            <h3 class="text-sm font-semibold text-white capitalize">{{ plan.name }}</h3>
            <p class="text-2xl font-bold text-white mt-1">{{ formatPrice(plan.price) }}</p>
          </div>

          <ul class="space-y-2">
            <li
              v-for="feature in planHighlights[plan.name]?.features ?? []"
              :key="feature"
              class="flex items-center gap-2 text-xs text-white/50"
            >
              <svg class="w-3.5 h-3.5 text-mint/60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              {{ feature }}
            </li>
          </ul>

          <button
            v-if="plan.id === currentPlanId"
            class="w-full py-2 rounded-xl text-xs text-white/30 border border-white/[0.06] cursor-default"
            disabled
          >
            current plan
          </button>
          <button
            v-else-if="plan.price === -1"
            class="w-full py-2 rounded-xl text-xs text-white/50 border border-white/[0.08] hover:border-white/[0.15] transition-all duration-200"
          >
            contact sales
          </button>
          <button
            v-else
            class="w-full py-2 rounded-xl text-xs font-medium transition-all duration-200"
            :class="planHighlights[plan.name]?.badge
              ? 'bg-sky-pastel/15 text-sky-pastel hover:bg-sky-pastel/25 border border-sky-pastel/20'
              : 'bg-white/[0.06] text-white/60 hover:bg-white/[0.1] border border-white/[0.08]'
            "
            :disabled="changing"
            @click="selectPlan(plan.id)"
          >
            <span v-if="changing" class="inline-flex items-center gap-1.5">
              <span class="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
              processing...
            </span>
            <span v-else>
              {{ plan.price > (plans.find(p => p.id === currentPlanId)?.price ?? 0) ? 'upgrade' : 'switch' }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </UiModal>
</template>
