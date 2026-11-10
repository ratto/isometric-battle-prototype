<script setup lang="ts">
import { computed, ref } from 'vue'

import background from '@/assets/ui/initial-screen-background.svg'
import ConfigureMatchPanel from '@/components/initial-menu/ConfigureMatchPanel.vue'
import MainMenuPanel from '@/components/initial-menu/MainMenuPanel.vue'

type InnerMenu = 'main' | 'configure-match'

const activeMenu = ref<InnerMenu>('main')

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
    <MainMenuPanel v-if="activeMenu === 'main'" @start="activeMenu = 'configure-match'" />
    <ConfigureMatchPanel v-else @back="activeMenu = 'main'" />
  </div>
</template>
