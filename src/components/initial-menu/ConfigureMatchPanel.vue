<script setup lang="ts">
import { computed } from 'vue'

import panelBackground from '@/assets/ui/menu-panel.svg'
import { useCharactersStore } from '@/stores/characters'

import AttributeList from './AttributeList.vue'
import ClassSelect from './ClassSelect.vue'
import PixelButton from './PixelButton.vue'
import WeaponSelect from './WeaponSelect.vue'

const emit = defineEmits<{
  back: []
  startBattle: []
}>()

const charactersStore = useCharactersStore()

// JSON.stringify quotes the URL so a raw "(" or ")" inside the data URI can never
// break the unquoted CSS url(...) syntax.
const panelStyle = computed(() => ({
  backgroundImage: `url(${JSON.stringify(panelBackground)})`,
}))
</script>

<template>
  <div
    class="flex h-[30rem] w-[28rem] flex-col items-center justify-center gap-3 bg-[length:100%_100%] bg-center bg-no-repeat px-16"
    :style="panelStyle"
  >
    <h2 class="text-lg tracking-widest whitespace-nowrap text-slate-100 uppercase">
      Configure Match
    </h2>
    <template v-if="charactersStore.activeCharacter">
      <ClassSelect
        :character-id="charactersStore.activeCharacter.id"
        :character-class="charactersStore.activeCharacter.characterClass"
      />
      <AttributeList :character="charactersStore.activeCharacter" />
      <WeaponSelect
        :character-id="charactersStore.activeCharacter.id"
        :weapon-slug="charactersStore.activeCharacter.weaponSlug"
      />
    </template>
    <PixelButton label="Start Battle" @click="emit('startBattle')" />
    <PixelButton label="Back" @click="emit('back')" />
  </div>
</template>
