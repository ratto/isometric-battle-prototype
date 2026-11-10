<script setup lang="ts">
import PixelButton from './PixelButton.vue'

const emit = defineEmits<{
  back: []
}>()
</script>

<template>
  <div class="flex flex-col items-center gap-6 bg-slate-900/80 p-8">
    <h2 class="text-xl tracking-widest text-slate-100 uppercase">Configure Match</h2>
    <p class="text-sm text-slate-400">Coming soon</p>
    <PixelButton label="Back" @click="emit('back')" />
  </div>
</template>
