import { d6 } from '@/model/dice'
import { DieRoll } from '@/model/dieRoll'

const DICE_PER_ROLL = 4
const TOTAL_ROLLS = 9
const ATTRIBUTE_POOL_SIZE = 8

function rollOneTotal(): number {
  const roll = new DieRoll(
    Array.from({ length: DICE_PER_ROLL }, () => ({ dice: d6, modifier: 0 })),
    0,
  )
  const { entries } = roll.getDetailedResult()
  const rolledValues = entries.map((entry) => entry.rolledValue).sort((a, b) => a - b)

  return rolledValues.slice(1).reduce((sum, value) => sum + value, 0)
}

/**
 * Rolls four d6, drops the lowest die, and sums the rest; repeats nine times and
 * drops the lowest of the nine totals, returning the remaining 8 (unordered).
 */
export function rollAttributePool(): number[] {
  const totals = Array.from({ length: TOTAL_ROLLS }, () => rollOneTotal())
  const lowestIndex = totals.indexOf(Math.min(...totals))
  totals.splice(lowestIndex, 1)

  return totals.slice(0, ATTRIBUTE_POOL_SIZE)
}
