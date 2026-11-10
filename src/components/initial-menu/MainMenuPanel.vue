<script setup lang="ts">
import PixelButton from './PixelButton.vue'
import PulsingTitle from './PulsingTitle.vue'

const emit = defineEmits<{
  start: []
}>()
</script>

<template>
  <div class="flex flex-col items-center gap-10">
    <PulsingTitle />
    <div class="flex flex-col gap-4 bg-slate-900/80 p-8">
      <PixelButton label="Start" @click="emit('start')" />
      <PixelButton label="Options" disabled />
      <PixelButton label="Exit" disabled />
    </div>
  </div>
</template>
