<script setup lang="ts">
import { Graphics } from 'pixi.js'
import { ref, watch } from 'vue'

import { usePixiApp } from '@/composables/usePixiApp'

const CANVAS_WIDTH = 1280
const CANVAS_HEIGHT = 720

const canvasHost = ref<HTMLElement | null>(null)
const { app } = usePixiApp(canvasHost, {
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  backgroundColor: 0x1a1a1a,
})

watch(app, (instance) => {
  if (!instance) return

  const placeholder = new Graphics()
    .rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    .fill({ color: 0x2d4a2d })
  instance.stage.addChild(placeholder)
})
</script>

<template>
  <div class="flex h-full w-full items-center justify-center bg-black">
    <div ref="canvasHost" :style="{ width: `${CANVAS_WIDTH}px`, height: `${CANVAS_HEIGHT}px` }" />
  </div>
</template>
