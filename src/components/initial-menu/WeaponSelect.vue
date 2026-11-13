<script setup lang="ts">
import { watch } from 'vue'

import { useWeaponryQuery } from '@/composables/useWeaponryQuery'
import { useCharactersStore } from '@/stores/characters'

const props = defineProps<{
  characterId: string
  weaponSlug: string | null
}>()

const charactersStore = useCharactersStore()
const { weapons, loading } = useWeaponryQuery()

watch(
  weapons,
  (loadedWeapons) => {
    if (props.weaponSlug === null && loadedWeapons.length > 0) {
      charactersStore.setCharacterWeapon(props.characterId, loadedWeapons[0].slug)
    }
  },
  { immediate: true },
)

function handleChange(event: Event) {
  const weaponSlug = (event.target as HTMLSelectElement).value
  charactersStore.setCharacterWeapon(props.characterId, weaponSlug)
}
</script>

<template>
  <p v-if="loading" class="text-xs text-slate-400">Loading weapons…</p>
  <select
    v-else
    class="w-full border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-slate-100"
    :value="weaponSlug"
    @change="handleChange"
  >
    <option v-for="weapon in weapons" :key="weapon.slug" :value="weapon.slug">
      {{ weapon.name }}
    </option>
  </select>
</template>
