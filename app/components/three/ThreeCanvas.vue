<script setup lang="ts">
import { useThreeScene } from '~/three/useThreeScene'

const props = withDefaults(defineProps<{
  class?: string
}>(), {
  class: '',
})

const containerRef = ref<HTMLElement | null>(null)
const threeScene = useThreeScene()

defineExpose({
  scene: computed(() => threeScene.scene),
  camera: computed(() => threeScene.camera),
  onUpdate: threeScene.onUpdate,
})

onMounted(() => {
  if (containerRef.value) {
    threeScene.init(containerRef.value)
  }
})

onUnmounted(() => {
  threeScene.dispose()
})
</script>

<template>
  <div
    ref="containerRef"
    :class="['w-full h-full', props.class]"
  />
</template>
