export type AttributeCode = 'FR' | 'AGI' | 'DEX' | 'CON' | 'INT' | 'WILL' | 'PER' | 'CAR'

export type CharacterClass = 'fighter' | 'wizard' | 'thief'

export interface Character {
  id: string
  characterClass: CharacterClass
  attributes: Record<AttributeCode, number>
  weaponSlug: string | null
}
