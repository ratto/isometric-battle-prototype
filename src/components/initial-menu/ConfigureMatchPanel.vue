<script setup lang="ts">
import { computed } from 'vue'

import panelBackground from '@/assets/ui/menu-panel.svg'

import PixelButton from './PixelButton.vue'

const emit = defineEmits<{
  back: []
}>()

// JSON.stringify quotes the URL so a raw "(" or ")" inside the data URI can never
// break the unquoted CSS url(...) syntax.
const panelStyle = computed(() => ({
  backgroundImage: `url(${JSON.stringify(panelBackground)})`,
}))
</script>

<template>
  <div
    class="flex h-[21rem] w-[28rem] flex-col items-center justify-center gap-6 bg-[length:100%_100%] bg-center bg-no-repeat px-16"
    :style="panelStyle"
  >
    <h2 class="text-lg tracking-widest whitespace-nowrap text-slate-100 uppercase">
      Configure Match
    </h2>
    <p class="text-sm text-slate-400">Coming soon</p>
    <PixelButton label="Back" @click="emit('back')" />
  </div>
</template>
