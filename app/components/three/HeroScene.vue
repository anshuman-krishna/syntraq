<script setup lang="ts">
import * as THREE from 'three'
import { useThreeScene } from '~/three/useThreeScene'

const containerRef = ref<HTMLElement | null>(null)
const threeScene = useThreeScene()
const mouseX = ref(0)
const mouseY = ref(0)

function handleMouseMove(e: MouseEvent) {
  const rect = containerRef.value?.getBoundingClientRect()
  if (!rect) return
  mouseX.value = ((e.clientX - rect.left) / rect.width - 0.5) * 2
  mouseY.value = ((e.clientY - rect.top) / rect.height - 0.5) * 2
}

onMounted(() => {
  if (!containerRef.value) return

  threeScene.init(containerRef.value)

  const scene = threeScene.scene
  const camera = threeScene.camera
  if (!scene || !camera) return

  // ambient glow
  const ambientLight = new THREE.AmbientLight(0xa7d8ff, 0.4)
  scene.add(ambientLight)

  const pointLight1 = new THREE.PointLight(0xa7d8ff, 1.5, 20)
  pointLight1.position.set(3, 3, 5)
  scene.add(pointLight1)

  const pointLight2 = new THREE.PointLight(0xb8f2e6, 1, 20)
  pointLight2.position.set(-3, -2, 4)
  scene.add(pointLight2)

  const pointLight3 = new THREE.PointLight(0xffd6c9, 0.8, 20)
  pointLight3.position.set(0, 3, 3)
  scene.add(pointLight3)

  // main icosahedron — represents the system
  const geometry = new THREE.IcosahedronGeometry(1.2, 1)
  const material = new THREE.MeshPhysicalMaterial({
    color: 0xa7d8ff,
    metalness: 0.1,
    roughness: 0.2,
    transmission: 0.6,
    thickness: 0.5,
    transparent: true,
    opacity: 0.7,
  })
  const mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)

  // wireframe overlay
  const wireGeo = new THREE.IcosahedronGeometry(1.25, 1)
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0xb8f2e6,
    wireframe: true,
    transparent: true,
    opacity: 0.15,
  })
  const wireMesh = new THREE.Mesh(wireGeo, wireMat)
  scene.add(wireMesh)

  // orbiting particles
  const particleCount = 60
  const particleGeo = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const r = 2 + Math.random() * 1.5
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    positions[i * 3 + 2] = r * Math.cos(phi)
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const particleMat = new THREE.PointsMaterial({
    color: 0xffd6c9,
    size: 0.03,
    transparent: true,
    opacity: 0.6,
  })
  const particles = new THREE.Points(particleGeo, particleMat)
  scene.add(particles)

  camera.position.set(0, 0, 4.5)

  let elapsed = 0

  threeScene.onUpdate((delta) => {
    elapsed += delta

    // smooth rotation
    mesh.rotation.y += delta * 0.3
    mesh.rotation.x = Math.sin(elapsed * 0.5) * 0.1
    wireMesh.rotation.y -= delta * 0.15
    wireMesh.rotation.z = Math.cos(elapsed * 0.3) * 0.05
    particles.rotation.y += delta * 0.08

    // mouse-driven camera sway
    if (camera) {
      camera.position.x += (mouseX.value * 0.5 - camera.position.x) * delta * 2
      camera.position.y += (-mouseY.value * 0.3 - camera.position.y) * delta * 2
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
