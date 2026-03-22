<script setup lang="ts">
import * as THREE from 'three'
import { useThreeScene } from '~/three/useThreeScene'

const containerRef = ref<HTMLElement | null>(null)
const threeScene = useThreeScene()
const roster = useRosterStore()

const hoveredLabel = ref('')
const hoveredType = ref('')
const tooltipX = ref(0)
const tooltipY = ref(0)
const showTooltip = ref(false)

const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()
const targetCameraPos = new THREE.Vector3(0, 2, 12)

interface NodeData {
  type: 'employee' | 'vehicle' | 'shift'
  label: string
  detail: string
}

const nodeMap = new Map<THREE.Object3D, NodeData>()

const statusColors: Record<string, number> = {
  available: 0xb8f2e6,
  'on-route': 0xa7d8ff,
  maintenance: 0xffd6c9,
  active: 0xb8f2e6,
  scheduled: 0xa7d8ff,
  completed: 0x555570,
  cancelled: 0xff6b6b,
}

const roleColors: Record<string, number> = {
  driver: 0xa7d8ff,
  operator: 0xb8f2e6,
  mechanic: 0xffd6c9,
  supervisor: 0xe8c4ff,
}

function createGlowSprite(color: number, size: number): THREE.Sprite {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  const c = new THREE.Color(color)
  gradient.addColorStop(0, `rgba(${c.r * 255},${c.g * 255},${c.b * 255},0.4)`)
  gradient.addColorStop(1, `rgba(${c.r * 255},${c.g * 255},${c.b * 255},0)`)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 64, 64)

  const texture = new THREE.CanvasTexture(canvas)
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true })
  const sprite = new THREE.Sprite(material)
  sprite.scale.set(size, size, 1)
  return sprite
}

onMounted(() => {
  if (!containerRef.value) return

  threeScene.init(containerRef.value)
  const scene = threeScene.scene
  const camera = threeScene.camera
  if (!scene || !camera) return

  // lighting
  scene.add(new THREE.AmbientLight(0xa7d8ff, 0.4))
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.6)
  dirLight.position.set(8, 10, 8)
  scene.add(dirLight)

  // grid
  const gridHelper = new THREE.GridHelper(20, 20, 0x222240, 0x181830)
  gridHelper.position.y = -2
  scene.add(gridHelper)

  const employees = roster.employees.slice(0, 10)
  const shifts = roster.shifts.filter(s => s.status === 'active' || s.status === 'scheduled').slice(0, 20)

  // collect unique vehicles from shifts
  const vehicleIds = new Set<string>()
  shifts.forEach(s => { if (s.vehicleId) vehicleIds.add(s.vehicleId) })

  // position employees in a circle
  const empRadius = 4
  const empGroup = new THREE.Group()
  scene.add(empGroup)

  employees.forEach((emp, i) => {
    const angle = (i / employees.length) * Math.PI * 2 - Math.PI / 2
    const x = Math.cos(angle) * empRadius
    const z = Math.sin(angle) * empRadius

    // node sphere
    const geo = new THREE.SphereGeometry(0.25, 16, 16)
    const mat = new THREE.MeshPhysicalMaterial({
      color: roleColors[emp.role] ?? 0xa7d8ff,
      metalness: 0.2,
      roughness: 0.3,
      transparent: true,
      opacity: 0.85,
      emissive: roleColors[emp.role] ?? 0xa7d8ff,
      emissiveIntensity: 0.15,
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.set(x, 0, z)
    empGroup.add(mesh)

    // glow
    const glow = createGlowSprite(roleColors[emp.role] ?? 0xa7d8ff, 1.2)
    glow.position.copy(mesh.position)
    empGroup.add(glow)

    nodeMap.set(mesh, {
      type: 'employee',
      label: emp.name,
      detail: `${emp.role} · ${roster.getEmployeeShifts(emp.id).length} shifts`,
    })
  })

  // position vehicles in inner ring
  const vehRadius = 1.8
  const vehicleArr = Array.from(vehicleIds)
  const vehGroup = new THREE.Group()
  scene.add(vehGroup)

  vehicleArr.forEach((_, i) => {
    const angle = (i / Math.max(vehicleArr.length, 1)) * Math.PI * 2
    const x = Math.cos(angle) * vehRadius
    const z = Math.sin(angle) * vehRadius

    const geo = new THREE.OctahedronGeometry(0.18, 0)
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xb8f2e6,
      metalness: 0.3,
      roughness: 0.2,
      transparent: true,
      opacity: 0.8,
      emissive: 0xb8f2e6,
      emissiveIntensity: 0.1,
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.set(x, 0, z)
    vehGroup.add(mesh)

    nodeMap.set(mesh, {
      type: 'vehicle',
      label: `vehicle ${i + 1}`,
      detail: 'assigned',
    })
  })

  // draw connections between employees and their shifts' vehicles
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xa7d8ff, transparent: true, opacity: 0.15 })

  shifts.forEach(shift => {
    if (!shift.vehicleId) return
    const empIdx = employees.findIndex(e => e.id === shift.employeeId)
    const vehIdx = vehicleArr.indexOf(shift.vehicleId)
    if (empIdx === -1 || vehIdx === -1) return

    const empAngle = (empIdx / employees.length) * Math.PI * 2 - Math.PI / 2
    const vehAngle = (vehIdx / Math.max(vehicleArr.length, 1)) * Math.PI * 2

    const points = [
      new THREE.Vector3(Math.cos(empAngle) * empRadius, 0, Math.sin(empAngle) * empRadius),
      new THREE.Vector3(Math.cos(vehAngle) * vehRadius, 0, Math.sin(vehAngle) * vehRadius),
    ]

    const lineGeo = new THREE.BufferGeometry().setFromPoints(points)
    const line = new THREE.Line(lineGeo, lineMaterial)
    scene.add(line)
  })

  // camera
  camera.position.set(0, 6, 10)
  camera.lookAt(0, 0, 0)
  targetCameraPos.copy(camera.position)

  let elapsed = 0
  threeScene.onUpdate((delta) => {
    elapsed += delta

    // gentle float animation
    empGroup.children.forEach((child, i) => {
      if (child instanceof THREE.Mesh) {
        child.position.y = Math.sin(elapsed * 0.6 + i * 0.5) * 0.12
      } else if (child instanceof THREE.Sprite) {
        const meshIdx = Math.floor(i / 2)
        const meshes = empGroup.children.filter(c => c instanceof THREE.Mesh)
        if (meshes[meshIdx]) {
          child.position.y = meshes[meshIdx].position.y
        }
      }
    })

    vehGroup.children.forEach((child, i) => {
      if (child instanceof THREE.Mesh) {
        child.rotation.y = elapsed * 0.3 + i
        child.position.y = Math.sin(elapsed * 0.8 + i * 0.7) * 0.08
      }
    })

    // smooth camera lerp
    if (camera) {
      camera.position.lerp(targetCameraPos, delta * 2)
      camera.lookAt(0, 0, 0)
    }
  })

  // interaction
  containerRef.value.addEventListener('mousemove', (e) => {
    const rect = containerRef.value!.getBoundingClientRect()
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

    tooltipX.value = e.clientX - rect.left
    tooltipY.value = e.clientY - rect.top

    // subtle camera follow
    targetCameraPos.x = mouse.x * 1.5
    targetCameraPos.y = 6 - mouse.y * 0.5

    raycaster.setFromCamera(mouse, camera!)
    const meshes = [...empGroup.children, ...vehGroup.children].filter(c => c instanceof THREE.Mesh)
    const intersects = raycaster.intersectObjects(meshes)

    if (intersects.length > 0) {
      const data = nodeMap.get(intersects[0].object)
      if (data) {
        hoveredLabel.value = data.label
        hoveredType.value = data.detail
        showTooltip.value = true
        document.body.style.cursor = 'pointer'
        return
      }
    }

    showTooltip.value = false
    document.body.style.cursor = 'default'
  })

  containerRef.value.addEventListener('mouseleave', () => {
    showTooltip.value = false
    document.body.style.cursor = 'default'
    targetCameraPos.set(0, 6, 10)
  })
})

onUnmounted(() => {
  threeScene.dispose()
  nodeMap.clear()
  document.body.style.cursor = 'default'
})
</script>

<template>
  <div class="relative w-full h-full">
    <div ref="containerRef" class="w-full h-full" />

    <!-- hover tooltip -->
    <Transition name="fade">
      <div
        v-if="showTooltip"
        class="absolute pointer-events-none z-10 px-3 py-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/[0.08]"
        :style="{
          left: `${tooltipX + 16}px`,
          top: `${tooltipY - 8}px`,
        }"
      >
        <p class="text-xs text-white/80 font-medium">{{ hoveredLabel }}</p>
        <p class="text-[10px] text-white/40 mt-0.5">{{ hoveredType }}</p>
      </div>
    </Transition>

    <!-- legend -->
    <div class="absolute bottom-3 left-3 flex items-center gap-4">
      <div class="flex items-center gap-1.5">
        <div class="w-2 h-2 rounded-full bg-sky-pastel/60" />
        <span class="text-[10px] text-white/30">driver</span>
      </div>
      <div class="flex items-center gap-1.5">
        <div class="w-2 h-2 rounded-full bg-mint/60" />
        <span class="text-[10px] text-white/30">operator</span>
      </div>
      <div class="flex items-center gap-1.5">
        <div class="w-2 h-2 rounded-full bg-peach/60" />
        <span class="text-[10px] text-white/30">mechanic</span>
      </div>
      <div class="flex items-center gap-1.5">
        <div class="w-2.5 h-2.5 rotate-45 bg-mint/60" />
        <span class="text-[10px] text-white/30">vehicle</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
