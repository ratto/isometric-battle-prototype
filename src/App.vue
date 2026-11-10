<script setup lang="ts">
import { computed } from 'vue'

import InicialMenuScene from '@/scenes/InicialMenuScene.vue'
import { useSceneStore } from '@/stores/scene'

const sceneStore = useSceneStore()

// The 'battle' scene is not implemented yet; this feature only ever renders the initial menu.
const activeSceneComponent = computed(() =>
  sceneStore.activeScene === 'initial-menu' ? InicialMenuScene : null,
)
</script>

<template>
  <component :is="activeSceneComponent" class="h-full w-full" />
</template>
