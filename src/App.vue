<script setup lang="ts">
import { computed } from 'vue'

import CombatScene from '@/scenes/CombatScene.vue'
import InicialMenuScene from '@/scenes/InicialMenuScene.vue'
import { useSceneStore } from '@/stores/scene'

const sceneStore = useSceneStore()

const activeSceneComponent = computed(() =>
  sceneStore.activeScene === 'battle' ? CombatScene : InicialMenuScene,
)
</script>

<template>
  <component :is="activeSceneComponent" class="h-full w-full" />
</template>
