<script setup lang="ts">
import { computed, ref } from 'vue'

import buttonDisabled from '@/assets/ui/pixel-button-disabled.svg'
import buttonHover from '@/assets/ui/pixel-button-hover.svg'
import buttonNormal from '@/assets/ui/pixel-button-normal.svg'

const props = defineProps<{
  label: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  click: []
}>()

const isHovered = ref(false)

const sprite = computed(() => {
  if (props.disabled) return buttonDisabled
  return isHovered.value ? buttonHover : buttonNormal
})

// JSON.stringify quotes the URL so a raw "(" or ")" inside a data URI (e.g. from an
// SVG's own text content) can never break the unquoted CSS url(...) syntax.
const buttonStyle = computed(() => ({
  backgroundImage: `url(${JSON.stringify(sprite.value)})`,
}))

function handleClick() {
  emit('click')
}
</script>

<template>
  <button
    type="button"
    class="h-14 w-56 bg-contain bg-center bg-no-repeat text-sm tracking-wider text-slate-100 uppercase"
    :class="disabled ? 'cursor-not-allowed text-slate-500' : 'cursor-pointer'"
    :style="buttonStyle"
    :disabled="disabled"
    @click="handleClick"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    {{ label }}
  </button>
</template>
