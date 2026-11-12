import { Application } from 'pixi.js'
import { onMounted, onUnmounted, ref, type Ref } from 'vue'

export type UsePixiAppOptions = {
  width: number
  height: number
  backgroundColor?: number
}

/**
 * Owns a Pixi Application's lifecycle, tied to the host component: initializes it on
 * mount and tears it down (canvas, children, textures) on unmount, so repeated
 * mount/unmount cycles never leak canvases or GPU resources.
 */
export function usePixiApp(canvasHost: Ref<HTMLElement | null>, options: UsePixiAppOptions) {
  const app = ref<Application | null>(null) as Ref<Application | null>

  onMounted(async () => {
    const host = canvasHost.value
    if (!host) return

    const instance = new Application()
    await instance.init({
      width: options.width,
      height: options.height,
      backgroundColor: options.backgroundColor ?? 0x000000,
    })

    host.appendChild(instance.canvas)
    app.value = instance
  })

  onUnmounted(() => {
    // `texture`/`textureSource` must stay false: tile textures are loaded via `Assets.load`,
    // which caches them globally by URL for reuse across mounts. Destroying them here would
    // corrupt that shared cache (Pixi warns "A TextureSource managed by Assets was destroyed
    // instead of unloaded!") and leave the next CombatScene mount with dead textures.
    app.value?.destroy({ removeView: true }, { children: true })
    app.value = null
  })

  return { app }
}
