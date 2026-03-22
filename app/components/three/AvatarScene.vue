<script setup lang="ts">
import * as THREE from 'three'
import { useThreeScene } from '~/three/useThreeScene'

const props = withDefaults(defineProps<{
  primaryColor?: string
  secondaryColor?: string
}>(), {
  primaryColor: '#a7d8ff',
  secondaryColor: '#b8f2e6',
})

const containerRef = ref<HTMLElement | null>(null)
const threeScene = useThreeScene()

function hexToThreeColor(hex: string): THREE.Color {
  return new THREE.Color(hex)
}

onMounted(() => {
  if (!containerRef.value) return

  threeScene.init(containerRef.value)
  const scene = threeScene.scene
  const camera = threeScene.camera
  if (!scene || !camera) return

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
  dirLight.position.set(2, 3, 5)
  scene.add(dirLight)

  // head
  const headGeo = new THREE.SphereGeometry(0.5, 16, 16)
  const headMat = new THREE.MeshPhysicalMaterial({
    color: hexToThreeColor(props.primaryColor),
    metalness: 0.1,
    roughness: 0.3,
    transparent: true,
    opacity: 0.8,
  })
  const head = new THREE.Mesh(headGeo, headMat)
  head.position.y = 0.8
  scene.add(head)

  // body
  const bodyGeo = new THREE.CapsuleGeometry(0.35, 0.6, 8, 16)
  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: hexToThreeColor(props.secondaryColor),
    metalness: 0.1,
    roughness: 0.3,
    transparent: true,
    opacity: 0.7,
  })
  const body = new THREE.Mesh(bodyGeo, bodyMat)
  body.position.y = -0.2
  scene.add(body)

  // ring detail
  const ringGeo = new THREE.TorusGeometry(0.55, 0.03, 8, 32)
  const ringMat = new THREE.MeshBasicMaterial({
    color: hexToThreeColor(props.primaryColor),
    transparent: true,
    opacity: 0.3,
  })
  const ring = new THREE.Mesh(ringGeo, ringMat)
  ring.position.y = 0.8
  ring.rotation.x = Math.PI * 0.4
  scene.add(ring)

  camera.position.set(0, 0.3, 2.5)
  camera.lookAt(0, 0.3, 0)

  let elapsed = 0
  threeScene.onUpdate((delta) => {
    elapsed += delta
    head.rotation.y = Math.sin(elapsed * 0.5) * 0.2
    body.rotation.y = Math.sin(elapsed * 0.5) * 0.1
    ring.rotation.z += delta * 0.5
    head.position.y = 0.8 + Math.sin(elapsed * 0.8) * 0.03
  })
})

onUnmounted(() => {
  threeScene.dispose()
})
</script>

<template>
  <div ref="containerRef" class="w-full h-full" />
</template>
