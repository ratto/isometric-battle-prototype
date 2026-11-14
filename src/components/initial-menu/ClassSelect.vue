<script setup lang="ts">
import type { CharacterClass } from '@/model/character'
import { useCharactersStore } from '@/stores/characters'

const props = defineProps<{
  characterId: string
  characterClass: CharacterClass
}>()

const charactersStore = useCharactersStore()

const CLASS_OPTIONS: { value: CharacterClass; label: string }[] = [
  { value: 'fighter', label: 'Fighter' },
  { value: 'wizard', label: 'Wizard' },
  { value: 'thief', label: 'Thief' },
]

function handleChange(event: Event) {
  const characterClass = (event.target as HTMLSelectElement).value as CharacterClass
  charactersStore.setCharacterClass(props.characterId, characterClass)
}
</script>

<template>
  <select
    class="w-full border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-slate-100"
    :value="characterClass"
    @change="handleChange"
  >
    <option v-for="option in CLASS_OPTIONS" :key="option.value" :value="option.value">
      {{ option.label }}
    </option>
  </select>
</template>
