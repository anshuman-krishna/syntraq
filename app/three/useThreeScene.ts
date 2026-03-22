import * as THREE from 'three'

export interface ThreeSceneOptions {
  antialias?: boolean
  alpha?: boolean
  autoRotate?: boolean
}

export function useThreeScene(options: ThreeSceneOptions = {}) {
  const { antialias = true, alpha = true } = options

  let renderer: THREE.WebGLRenderer | null = null
  let scene: THREE.Scene | null = null
  let camera: THREE.PerspectiveCamera | null = null
  let animationId: number | null = null
  let container: HTMLElement | null = null

  const callbacks: Array<(delta: number) => void> = []
  const clock = new THREE.Clock()

  function init(el: HTMLElement) {
    container = el

    scene = new THREE.Scene()

    camera = new THREE.PerspectiveCamera(
      50,
      el.clientWidth / el.clientHeight,
      0.1,
      1000,
    )
    camera.position.z = 5

    renderer = new THREE.WebGLRenderer({ antialias, alpha })
    renderer.setSize(el.clientWidth, el.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    el.appendChild(renderer.domElement)

    window.addEventListener('resize', handleResize)
    animate()
  }

  function handleResize() {
    if (!camera || !renderer || !container) return
    camera.aspect = container.clientWidth / container.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(container.clientWidth, container.clientHeight)
  }

  function animate() {
    animationId = requestAnimationFrame(animate)
    const delta = clock.getDelta()
    callbacks.forEach(cb => cb(delta))
    if (renderer && scene && camera) {
      renderer.render(scene, camera)
    }
  }

  function onUpdate(cb: (delta: number) => void) {
    callbacks.push(cb)
  }

  function dispose() {
    if (animationId !== null) cancelAnimationFrame(animationId)
    window.removeEventListener('resize', handleResize)
    renderer?.dispose()
    renderer?.domElement.remove()
    renderer = null
    scene = null
    camera = null
    callbacks.length = 0
  }

  return {
    init,
    dispose,
    onUpdate,
    get scene() { return scene },
    get camera() { return camera },
    get renderer() { return renderer },
  }
}
