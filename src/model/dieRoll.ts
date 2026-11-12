import type { Dice } from './dice'

export type RollEntry = {
  dice: Dice
  modifier: number
}

export type DetailedRollEntry = {
  dice: Dice
  rolledValue: number
  modifier: number
  subtotal: number
}

export type DetailedResult = {
  entries: DetailedRollEntry[]
  modifier: number
  total: number
}

export class DieRoll {
  private readonly roll: RollEntry[]
  private readonly modifier: number

  constructor(roll: RollEntry[], modifier: number) {
    if (roll.length === 0) {
      throw new Error('DieRoll requires at least one roll entry')
    }

    this.roll = roll
    this.modifier = modifier
  }

  getResult(): number {
    const entriesTotal = this.roll.reduce(
      (sum, entry) => sum + this.rollDie(entry.dice) + entry.modifier,
      0,
    )

    return entriesTotal + this.modifier
  }

  getDetailedResult(): DetailedResult {
    const entries = this.roll.map((entry) => {
      const rolledValue = this.rollDie(entry.dice)
      const subtotal = rolledValue + entry.modifier

      return { dice: entry.dice, rolledValue, modifier: entry.modifier, subtotal }
    })

    const entriesTotal = entries.reduce((sum, entry) => sum + entry.subtotal, 0)

    return {
      entries,
      modifier: this.modifier,
      total: entriesTotal + this.modifier,
    }
  }

  private rollDie(dice: Dice): number {
    return Math.floor(Math.random() * dice.faceNumber) + 1
  }
}
