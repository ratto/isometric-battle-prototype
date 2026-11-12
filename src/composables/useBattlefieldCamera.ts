import type { Application, Container, FederatedPointerEvent } from 'pixi.js'
import { onUnmounted, watch, type Ref } from 'vue'

type Bounds = {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

function clamp(value: number, a: number, b: number): number {
  const min = Math.min(a, b)
  const max = Math.max(a, b)
  return Math.min(max, Math.max(min, value))
}

function isPannableEvent(event: FederatedPointerEvent): boolean {
  if (event.pointerType === 'touch') return true
  return event.pointerType === 'mouse' && event.button === 2
}

/**
 * Wires right-mouse-drag / touch-drag panning onto the battlefield's world container,
 * clamped so the rendered map's edges never leave the canvas showing empty space beyond
 * them. Owns no Pinia state: the pan offset only matters for the running combat scene.
 */
export function useBattlefieldCamera(
  app: Ref<Application | null>,
  worldContainer: Ref<Container | null>,
) {
  let bounds: Bounds = { minX: 0, maxX: 0, minY: 0, maxY: 0 }
  let activePointerId: number | null = null
  let dragStartPointer = { x: 0, y: 0 }
  let dragStartPosition = { x: 0, y: 0 }
  let detachContextMenu: (() => void) | null = null

  function computeBounds(instance: Application, world: Container): Bounds {
    const local = world.getLocalBounds()
    const canvasWidth = instance.screen.width
    const canvasHeight = instance.screen.height

    return {
      minX: canvasWidth - local.x - local.width,
      maxX: -local.x,
      minY: canvasHeight - local.y - local.height,
      maxY: -local.y,
    }
  }

  function centerWorld(world: Container) {
    world.position.set((bounds.minX + bounds.maxX) / 2, (bounds.minY + bounds.maxY) / 2)
  }

  function stopDragging() {
    activePointerId = null
  }

  function onPointerDown(event: FederatedPointerEvent) {
    if (activePointerId !== null || !isPannableEvent(event) || !worldContainer.value) return

    activePointerId = event.pointerId
    dragStartPointer = { x: event.global.x, y: event.global.y }
    dragStartPosition = {
      x: worldContainer.value.position.x,
      y: worldContainer.value.position.y,
    }
  }

  function onPointerMove(event: FederatedPointerEvent) {
    if (activePointerId === null || event.pointerId !== activePointerId || !worldContainer.value) {
      return
    }

    const dx = event.global.x - dragStartPointer.x
    const dy = event.global.y - dragStartPointer.y
    worldContainer.value.position.set(
      clamp(dragStartPosition.x + dx, bounds.minX, bounds.maxX),
      clamp(dragStartPosition.y + dy, bounds.minY, bounds.maxY),
    )
    // Force a render on every pan update rather than relying solely on the ticker: for
    // this static scene, the (cheap) extra render is worth not depending on ticker timing.
    app.value?.render()
  }

  function onPointerUp(event: FederatedPointerEvent) {
    if (event.pointerId !== activePointerId) return
    stopDragging()
  }

  function onContextMenu(event: Event) {
    event.preventDefault()
  }

  function detachInputListeners(instance: Application) {
    instance.stage.off('pointerdown', onPointerDown)
    instance.stage.off('globalpointermove', onPointerMove)
    instance.stage.off('pointerup', onPointerUp)
    instance.stage.off('pointerupoutside', onPointerUp)
    detachContextMenu?.()
    detachContextMenu = null
  }

  watch(
    [app, worldContainer],
    ([instance, world]) => {
      if (!instance || !world) return

      bounds = computeBounds(instance, world)
      centerWorld(world)
      // Centering the freshly-built world can otherwise leave a stale, uncentered frame
      // on screen until the next ticker-driven render happens to pick it up; render now.
      instance.render()

      instance.stage.eventMode = 'static'
      instance.stage.hitArea = instance.screen
      instance.stage.on('pointerdown', onPointerDown)
      instance.stage.on('globalpointermove', onPointerMove)
      instance.stage.on('pointerup', onPointerUp)
      instance.stage.on('pointerupoutside', onPointerUp)

      instance.canvas.addEventListener('contextmenu', onContextMenu)
      detachContextMenu = () => instance.canvas.removeEventListener('contextmenu', onContextMenu)

      window.addEventListener('blur', stopDragging)
    },
    { immediate: true },
  )

  onUnmounted(() => {
    const instance = app.value
    if (instance) detachInputListeners(instance)
    window.removeEventListener('blur', stopDragging)
  })
}
