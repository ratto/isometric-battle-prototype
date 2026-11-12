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
    app.value?.destroy({ removeView: true }, { children: true, texture: true, textureSource: true })
    app.value = null
  })

  return { app }
}
