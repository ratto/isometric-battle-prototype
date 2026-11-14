<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { useEnhancementsQuery } from '@/composables/useEnhancementsQuery'
import { useCharactersStore } from '@/stores/characters'
import type { Enhancement, EnhancementPolarity } from '@/utils/enhancement'
import {
  calculateNegativePointsTaken,
  calculatePositiveBudget,
  calculatePositiveSpent,
  isOptionSelectable,
} from '@/utils/enhancementBudget'

const SLOT_COUNT = 3

const props = defineProps<{
  characterId: string
  enhancementIds: string[]
}>()

const charactersStore = useCharactersStore()
const { enhancements, loading } = useEnhancementsQuery()

const positiveSlots = ref<(string | null)[]>(Array(SLOT_COUNT).fill(null))
const negativeSlots = ref<(string | null)[]>(Array(SLOT_COUNT).fill(null))

// Splits the character's already-selected enhancement ids into the positive/negative
// slots once the ENHANCEMENTS table has loaded (ids alone don't carry polarity).
watch(
  enhancements,
  (loadedEnhancements) => {
    if (loadedEnhancements.length === 0) return

    const selected = props.enhancementIds
      .map((id) => loadedEnhancements.find((enhancement) => enhancement.id === id))
      .filter((enhancement): enhancement is Enhancement => enhancement !== undefined)

    positiveSlots.value = fillSlots(
      selected.filter((enhancement) => enhancement.polarity === 'positive'),
    )
    negativeSlots.value = fillSlots(
      selected.filter((enhancement) => enhancement.polarity === 'negative'),
    )
  },
  { immediate: true },
)

function fillSlots(selected: Enhancement[]): (string | null)[] {
  const slots: (string | null)[] = Array(SLOT_COUNT).fill(null)
  selected.slice(0, SLOT_COUNT).forEach((enhancement, index) => {
    slots[index] = enhancement.id
  })
  return slots
}

function findById(id: string | null): Enhancement | undefined {
  if (id === null) return undefined
  return enhancements.value.find((enhancement) => enhancement.id === id)
}

const selectedPositive = computed(() =>
  positiveSlots.value.map(findById).filter((enhancement): enhancement is Enhancement => !!enhancement),
)
const selectedNegative = computed(() =>
  negativeSlots.value.map(findById).filter((enhancement): enhancement is Enhancement => !!enhancement),
)

const negativePointsTaken = computed(() => calculateNegativePointsTaken(selectedNegative.value))
const positiveBudget = computed(() => calculatePositiveBudget(negativePointsTaken.value))
const positiveSpent = computed(() => calculatePositiveSpent(selectedPositive.value))

// Options excluded by the mutual-exclusion rule (another slot already holds a tier
// of the same groupKey) are removed from the list entirely. Options excluded only
// because they would exceed the remaining budget stay in the list but disabled (see
// isPositiveOptionDisabled below), so the player can see what they can't afford.
function optionsFor(polarity: EnhancementPolarity, slots: (string | null)[], slotIndex: number): Enhancement[] {
  const otherGroupKeys = new Set(
    slots
      .filter((_, index) => index !== slotIndex)
      .map(findById)
      .filter((enhancement): enhancement is Enhancement => !!enhancement)
      .map((enhancement) => enhancement.groupKey),
  )

  return enhancements.value.filter(
    (enhancement) => enhancement.polarity === polarity && !otherGroupKeys.has(enhancement.groupKey),
  )
}

const positiveOptions = computed(() =>
  positiveSlots.value.map((_, index) => optionsFor('positive', positiveSlots.value, index)),
)
const negativeOptions = computed(() =>
  negativeSlots.value.map((_, index) => optionsFor('negative', negativeSlots.value, index)),
)

function isPositiveOptionDisabled(option: Enhancement, slotIndex: number): boolean {
  const currentSlotId = positiveSlots.value[slotIndex]
  if (option.id === currentSlotId) return false

  const ownCost = findById(currentSlotId)?.cost ?? 0
  const spentExcludingThisSlot = positiveSpent.value - ownCost

  return !isOptionSelectable(option, new Set(), spentExcludingThisSlot, positiveBudget.value)
}

function commitSelection(): void {
  const ids = [...positiveSlots.value, ...negativeSlots.value].filter(
    (id): id is string => id !== null,
  )
  charactersStore.setCharacterEnhancements(props.characterId, ids)
}

function handlePositiveChange(index: number, event: Event): void {
  const value = (event.target as HTMLSelectElement).value
  positiveSlots.value[index] = value === '' ? null : value
  commitSelection()
}

function handleNegativeChange(index: number, event: Event): void {
  const value = (event.target as HTMLSelectElement).value
  negativeSlots.value[index] = value === '' ? null : value
  commitSelection()
}
</script>

<template>
  <div class="flex w-full flex-col gap-1 text-xs text-slate-300">
    <p v-if="loading" class="text-xs text-slate-400">Loading enhancements…</p>
    <template v-else>
      <p>
        Enhancement points: {{ positiveSpent }} / {{ positiveBudget }} (+{{ negativePointsTaken }} from
        Negative Enhancements)
      </p>
      <p class="text-slate-400">Positive Enhancements</p>
      <select
        v-for="(slot, index) in positiveSlots"
        :key="`positive-${index}`"
        class="w-full border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-slate-100"
        :value="slot ?? ''"
        @change="handlePositiveChange(index, $event)"
      >
        <option value="">None</option>
        <option
          v-for="option in positiveOptions[index]"
          :key="option.id"
          :value="option.id"
          :disabled="isPositiveOptionDisabled(option, index)"
        >
          {{ option.name }} ({{ option.cost }})
        </option>
      </select>
      <p class="text-slate-400">Negative Enhancements</p>
      <select
        v-for="(slot, index) in negativeSlots"
        :key="`negative-${index}`"
        class="w-full border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-slate-100"
        :value="slot ?? ''"
        @change="handleNegativeChange(index, $event)"
      >
        <option value="">None</option>
        <option v-for="option in negativeOptions[index]" :key="option.id" :value="option.id">
          {{ option.name }} ({{ option.cost }})
        </option>
      </select>
    </template>
  </div>
</template>
