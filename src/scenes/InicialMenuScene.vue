<script setup lang="ts">
import { computed, ref } from 'vue'

import background from '@/assets/ui/initial-screen-background.svg'
import ConfigureMatchPanel from '@/components/initial-menu/ConfigureMatchPanel.vue'
import MainMenuPanel from '@/components/initial-menu/MainMenuPanel.vue'
import { useCharactersStore } from '@/stores/characters'
import { useSceneStore } from '@/stores/scene'

type InnerMenu = 'main' | 'configure-match'

const activeMenu = ref<InnerMenu>('main')
const sceneStore = useSceneStore()
const charactersStore = useCharactersStore()

function handleStart() {
  charactersStore.rollNewCharacter()
  activeMenu.value = 'configure-match'
}

// JSON.stringify quotes the URL so a raw "(" or ")" inside the data URI can never
// break the unquoted CSS url(...) syntax.
const backgroundStyle = computed(() => ({
  backgroundImage: `url(${JSON.stringify(background)})`,
}))
</script>

<template>
  <div
    class="flex h-full w-full items-center justify-center bg-cover bg-center"
    :style="backgroundStyle"
  >
    <MainMenuPanel v-if="activeMenu === 'main'" @start="handleStart" />
    <ConfigureMatchPanel
      v-else
      @back="activeMenu = 'main'"
      @start-battle="sceneStore.setActiveScene('battle')"
    />
  </div>
</template>
