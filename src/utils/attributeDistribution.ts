import type { AttributeCode, CharacterClass } from '@/model/character'

const CLASS_TIERS: Record<
  CharacterClass,
  { high: AttributeCode[]; mid: AttributeCode[]; low: AttributeCode[] }
> = {
  fighter: {
    high: ['FR', 'AGI', 'DEX', 'CON'],
    mid: [],
    low: ['INT', 'WILL', 'PER', 'CAR'],
  },
  wizard: {
    high: ['INT', 'WILL'],
    mid: ['FR', 'AGI', 'DEX', 'CON'],
    low: ['PER', 'CAR'],
  },
  thief: {
    high: ['AGI', 'DEX', 'INT'],
    mid: [],
    low: ['FR', 'CON', 'WILL', 'PER', 'CAR'],
  },
}

function shuffle<T>(items: T[]): T[] {
  const shuffled = [...items]

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled
}

function assignTier(
  attributes: Record<AttributeCode, number>,
  codes: AttributeCode[],
  values: number[],
): void {
  const shuffledCodes = shuffle(codes)

  shuffledCodes.forEach((code, index) => {
    attributes[code] = values[index]
  })
}

/**
 * Assigns the 8 rolled attribute values onto the 8 attribute codes according to the
 * given class's tier rule (high/mid/low groups of rolled values sorted descending),
 * randomizing placement within each tier.
 */
export function distributeAttributes(
  pool: number[],
  characterClass: CharacterClass,
): Record<AttributeCode, number> {
  const { high, mid, low } = CLASS_TIERS[characterClass]
  const sortedDescending = [...pool].sort((a, b) => b - a)

  const highValues = sortedDescending.slice(0, high.length)
  const midValues = sortedDescending.slice(high.length, high.length + mid.length)
  const lowValues = sortedDescending.slice(
    high.length + mid.length,
    high.length + mid.length + low.length,
  )

  const attributes = {} as Record<AttributeCode, number>
  assignTier(attributes, high, highValues)
  assignTier(attributes, mid, midValues)
  assignTier(attributes, low, lowValues)

  return attributes
}
