<script setup lang="ts">
import { ref } from 'vue'

import ConfigureMatchPanel from '@/components/initial-menu/ConfigureMatchPanel.vue'
import MainMenuPanel from '@/components/initial-menu/MainMenuPanel.vue'

type InnerMenu = 'main' | 'configure-match'

const activeMenu = ref<InnerMenu>('main')
</script>

<template>
  <div class="flex h-full w-full items-center justify-center bg-slate-950">
    <MainMenuPanel v-if="activeMenu === 'main'" @start="activeMenu = 'configure-match'" />
    <ConfigureMatchPanel v-else @back="activeMenu = 'main'" />
  </div>
</template>
