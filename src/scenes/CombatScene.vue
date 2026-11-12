<script setup lang="ts">
import { ref } from 'vue'

import { useBattlefieldCamera } from '@/composables/useBattlefieldCamera'
import { useBattlefieldRenderer } from '@/composables/useBattlefieldRenderer'
import { usePixiApp } from '@/composables/usePixiApp'
import { forestClearingGrid } from '@/model/battlefieldGrid'
import { useSceneStore } from '@/stores/scene'

const CANVAS_WIDTH = 1280
const CANVAS_HEIGHT = 720

const sceneStore = useSceneStore()

const canvasHost = ref<HTMLElement | null>(null)
const { app } = usePixiApp(canvasHost, {
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  backgroundColor: 0x1a1a1a,
})

const { worldContainer } = useBattlefieldRenderer(app, forestClearingGrid)
useBattlefieldCamera(app, worldContainer)
</script>

<template>
  <div class="relative flex h-full w-full items-center justify-center bg-black">
    <div ref="canvasHost" :style="{ width: `${CANVAS_WIDTH}px`, height: `${CANVAS_HEIGHT}px` }" />
    <button
      type="button"
      class="absolute top-4 left-4 cursor-pointer rounded border border-slate-500 bg-slate-900/80 px-4 py-2 text-sm tracking-wider text-slate-100 uppercase hover:bg-slate-800"
      @click="sceneStore.setActiveScene('initial-menu')"
    >
      Back
    </button>
  </div>
</template>
