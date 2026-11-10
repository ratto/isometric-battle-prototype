<script setup lang="ts">
defineProps<{
  label: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  click: []
}>()

function handleClick() {
  emit('click')
}
</script>

<template>
  <button
    type="button"
    class="px-6 py-3 text-sm tracking-wider uppercase transition-colors"
    :class="
      disabled
        ? 'cursor-not-allowed bg-slate-700 text-slate-500'
        : 'cursor-pointer bg-slate-800 text-slate-100 hover:bg-slate-700'
    "
    :disabled="disabled"
    @click="handleClick"
  >
    {{ label }}
  </button>
</template>
