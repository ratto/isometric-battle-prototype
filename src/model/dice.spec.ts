import { describe, expect, it } from 'vitest'

import { d10, d100, d12, d3, d4, d6, d8 } from './dice'

describe('dice constants', () => {
  it.each([
    [d3, 3, 'd3'],
    [d4, 4, 'd4'],
    [d6, 6, 'd6'],
    [d8, 8, 'd8'],
    [d10, 10, 'd10'],
    [d12, 12, 'd12'],
    [d100, 100, 'd100'],
  ])('%o has faceNumber %i and description %s', (dice, faceNumber, description) => {
    expect(dice.faceNumber).toBe(faceNumber)
    expect(dice.description).toBe(description)
  })
})
