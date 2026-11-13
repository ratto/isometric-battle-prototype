<script setup lang="ts">
import type { AttributeCode, Character } from '@/model/character'
import { ATTRIBUTE_INFO, ATTRIBUTE_ORDER } from '@/model/attribute'

const props = defineProps<{
  character: Character
}>()

function valueFor(code: AttributeCode): number {
  return props.character.attributes[code]
}
</script>

<template>
  <ul class="grid w-full grid-cols-2 gap-1 text-xs text-slate-300">
    <li
      v-for="code in ATTRIBUTE_ORDER"
      :key="code"
      class="flex items-center justify-between gap-2 border-b border-slate-700 py-0.5"
      :title="ATTRIBUTE_INFO[code].description"
    >
      <span>{{ ATTRIBUTE_INFO[code].name }}</span>
      <span class="font-bold text-slate-100">{{ valueFor(code) }}</span>
    </li>
  </ul>
</template>
