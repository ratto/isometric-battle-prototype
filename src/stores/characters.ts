import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import type { Character, CharacterClass } from '@/model/character'
import { distributeAttributes } from '@/utils/attributeDistribution'
import { rollAttributePool } from '@/utils/attributeGeneration'

export const useCharactersStore = defineStore('characters', () => {
  const characters = ref<Character[]>([])

  const activeCharacter = computed<Character | undefined>(() => characters.value[0])

  function rollNewCharacter(): void {
    const pool = rollAttributePool()

    characters.value = [
      {
        id: crypto.randomUUID(),
        characterClass: 'fighter',
        attributes: distributeAttributes(pool, 'fighter'),
        weaponSlug: null,
        enhancementIds: [],
      },
    ]
  }

  function setCharacterClass(id: string, characterClass: CharacterClass): void {
    const character = characters.value.find((candidate) => candidate.id === id)
    if (!character) return

    const pool = Object.values(character.attributes)
    character.attributes = distributeAttributes(pool, characterClass)
    character.characterClass = characterClass
  }

  function setCharacterWeapon(id: string, weaponSlug: string): void {
    const character = characters.value.find((candidate) => candidate.id === id)
    if (!character) return

    character.weaponSlug = weaponSlug
  }

  function setCharacterEnhancements(id: string, enhancementIds: string[]): void {
    const character = characters.value.find((candidate) => candidate.id === id)
    if (!character) return

    character.enhancementIds = enhancementIds
  }

  return {
    characters,
    activeCharacter,
    rollNewCharacter,
    setCharacterClass,
    setCharacterWeapon,
    setCharacterEnhancements,
  }
})
