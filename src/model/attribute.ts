import type { AttributeCode } from './character'

export interface AttributeInfo {
  code: AttributeCode
  name: string
  description: string
}

export const ATTRIBUTE_ORDER: AttributeCode[] = [
  'FR',
  'AGI',
  'DEX',
  'CON',
  'INT',
  'WILL',
  'PER',
  'CAR',
]

export const ATTRIBUTE_INFO: Record<AttributeCode, AttributeInfo> = {
  FR: { code: 'FR', name: 'Strength', description: "Measures a character's physical power." },
  AGI: { code: 'AGI', name: 'Agility', description: "Measures a character's whole-body agility." },
  DEX: { code: 'DEX', name: 'Dexterity', description: "Measures a character's manual dexterity." },
  CON: {
    code: 'CON',
    name: 'Constitution',
    description: "Measures a character's vigor and physical resistance.",
  },
  INT: {
    code: 'INT',
    name: 'Intelligence',
    description: 'Measures learning speed and mental power — the "strength" of magic.',
  },
  WILL: {
    code: 'WILL',
    name: 'Willpower',
    description: 'The power to resist magic and mental attacks.',
  },
  PER: {
    code: 'PER',
    name: 'Perception',
    description: 'Measures the ability to notice the surrounding environment.',
  },
  CAR: { code: 'CAR', name: 'Charisma', description: 'The power to persuade NPCs.' },
}
