<script setup lang="ts">
import * as THREE from 'three'
import { useThreeScene } from '~/three/useThreeScene'

const containerRef = ref<HTMLElement | null>(null)
const threeScene = useThreeScene()
const roster = useRosterStore()

const mouseX = ref(0)
const mouseY = ref(0)

function handleMouseMove(e: MouseEvent) {
  const rect = containerRef.value?.getBoundingClientRect()
  if (!rect) return
  mouseX.value = ((e.clientX - rect.left) / rect.width - 0.5) * 2
  mouseY.value = ((e.clientY - rect.top) / rect.height - 0.5) * 2
}

const statusColors: Record<string, number> = {
  scheduled: 0xa7d8ff,
  active: 0xb8f2e6,
  completed: 0x666680,
  cancelled: 0xff6b6b,
}

onMounted(() => {
  if (!containerRef.value) return

  threeScene.init(containerRef.value)
  const scene = threeScene.scene
  const camera = threeScene.camera
  if (!scene || !camera) return

  const ambientLight = new THREE.AmbientLight(0xa7d8ff, 0.3)
  scene.add(ambientLight)

  const pointLight = new THREE.PointLight(0xffffff, 0.8, 30)
  pointLight.position.set(5, 5, 10)
  scene.add(pointLight)

  const blockGroup = new THREE.Group()
  scene.add(blockGroup)

  const employees = roster.filteredEmployees.slice(0, 6)

  employees.forEach((emp, empIdx) => {
    const shifts = roster.getEmployeeShifts(emp.id).slice(0, 3)
    const y = (empIdx - employees.length / 2) * 1.2

    shifts.forEach((shift, shiftIdx) => {
      const startHour = parseInt(shift.startTime.split(':')[0])
      const endHour = parseInt(shift.endTime.split(':')[0])
      const width = (endHour - startHour) * 0.2
      const x = (startHour - 12) * 0.2 + shiftIdx * 0.1

      const geometry = new THREE.BoxGeometry(width, 0.4, 0.3)
      const material = new THREE.MeshPhysicalMaterial({
        color: statusColors[shift.status] ?? 0xa7d8ff,
        metalness: 0.1,
        roughness: 0.3,
        transparent: true,
        opacity: 0.7,
        transmission: 0.2,
      })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(x, y, 0)
      blockGroup.add(mesh)
    })
  })

  camera.position.set(0, 0, 6)

  let elapsed = 0
  threeScene.onUpdate((delta) => {
    elapsed += delta

    blockGroup.children.forEach((child, i) => {
      child.position.z = Math.sin(elapsed * 0.5 + i * 0.3) * 0.15
      child.rotation.x = Math.sin(elapsed * 0.3 + i * 0.2) * 0.05
    })

    if (camera) {
      camera.position.x += (mouseX.value * 1.5 - camera.position.x) * delta * 1.5
      camera.position.y += (-mouseY.value * 0.8 - camera.position.y) * delta * 1.5
      camera.lookAt(0, 0, 0)
    }
  })

  window.addEventListener('mousemove', handleMouseMove)
})

onUnmounted(() => {
  threeScene.dispose()
  window.removeEventListener('mousemove', handleMouseMove)
})
</script>

<template>
  <div ref="containerRef" class="w-full h-full" />
</template>
