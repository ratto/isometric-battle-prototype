import type { Enhancement } from './enhancement'

const MAX_NEGATIVE_POINTS = 3
const BASE_POSITIVE_BUDGET = 5

/**
 * Sum of the negative Enhancements' cost magnitude currently selected, capped at
 * MAX_NEGATIVE_POINTS per the Sistema Daemon rule (up to 3 Negative Points may be
 * taken, each buying back one positive point).
 */
export function calculateNegativePointsTaken(selectedNegative: Enhancement[]): number {
  const magnitude = selectedNegative.reduce((total, enhancement) => total + Math.abs(enhancement.cost), 0)
  return Math.min(magnitude, MAX_NEGATIVE_POINTS)
}

export function calculatePositiveBudget(negativePointsTaken: number): number {
  return BASE_POSITIVE_BUDGET + negativePointsTaken
}

export function calculatePositiveSpent(selectedPositive: Enhancement[]): number {
  return selectedPositive.reduce((total, enhancement) => total + enhancement.cost, 0)
}

/**
 * Whether a given option should remain selectable in a select, given the groupKeys
 * already taken elsewhere (mutual exclusion between tiers of the same Enhancement)
 * and, for positive options, the remaining budget.
 */
export function isOptionSelectable(
  option: Enhancement,
  selectedGroupKeys: Set<string>,
  positiveSpent: number,
  positiveBudget: number,
): boolean {
  if (selectedGroupKeys.has(option.groupKey)) return false
  if (option.polarity === 'positive') {
    return positiveSpent + option.cost <= positiveBudget
  }
  return true
}
