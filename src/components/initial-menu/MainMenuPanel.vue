<script setup lang="ts">
import { computed } from 'vue'

import panelBackground from '@/assets/ui/menu-panel.svg'

import PixelButton from './PixelButton.vue'
import PulsingTitle from './PulsingTitle.vue'

const emit = defineEmits<{
  start: []
}>()

// JSON.stringify quotes the URL so a raw "(" or ")" inside the data URI can never
// break the unquoted CSS url(...) syntax.
const panelStyle = computed(() => ({
  backgroundImage: `url(${JSON.stringify(panelBackground)})`,
}))
</script>

<template>
  <div class="flex flex-col items-center gap-10">
    <PulsingTitle />
    <div
      class="flex h-[21rem] w-[28rem] flex-col items-center justify-center gap-4 bg-[length:100%_100%] bg-center bg-no-repeat px-16"
      :style="panelStyle"
    >
      <PixelButton label="Start" @click="emit('start')" />
      <PixelButton label="Options" disabled />
      <PixelButton label="Exit" disabled />
    </div>
  </div>
</template>
