<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue?: string
  label?: string
  placeholder?: string
  type?: string
  error?: string
}>(), {
  modelValue: '',
  type: 'text',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const focused = ref(false)
const hasValue = computed(() => props.modelValue.length > 0)
const showFloatingLabel = computed(() => props.label && (focused.value || hasValue.value))

function handleInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <div class="input-wrapper relative">
      <label
        v-if="label"
        class="input-label absolute left-4 transition-all duration-200 ease-out pointer-events-none"
        :class="showFloatingLabel
          ? 'top-1 text-[10px] text-sky-pastel/70'
          : 'top-1/2 -translate-y-1/2 text-sm text-white/25'
        "
      >
        {{ label }}
      </label>

      <input
        :type="type"
        :value="modelValue"
        :placeholder="showFloatingLabel ? placeholder : label || placeholder"
        class="input-glass w-full px-4 text-sm text-white/90 placeholder:text-white/25 outline-none"
        :class="[
          showFloatingLabel ? 'pt-5 pb-1.5' : 'py-2.5',
          error && '!border-red-400/40',
        ]"
        @input="handleInput"
        @focus="focused = true"
        @blur="focused = false"
      />
    </div>

    <p v-if="error" class="text-xs text-red-400/80 pl-1">{{ error }}</p>
  </div>
</template>

<style scoped>
.input-glass {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.input-glass:focus {
  border-color: rgba(167, 216, 255, 0.4);
  box-shadow: 0 0 0 3px rgba(167, 216, 255, 0.08), 0 0 15px rgba(167, 216, 255, 0.06);
}
</style>
