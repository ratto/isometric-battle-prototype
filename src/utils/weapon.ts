import type { WeaponSkillGroup } from './weaponSkillGroup'

export type WeaponCategory = 'melee' | 'ranged'

export interface Weapon {
  slug: string
  name: string
  description: string
  category: WeaponCategory
  damageDice: string
  initiativeModifier: string
  rangeShort: number | null
  rangeLong: number | null
  skillGroup: WeaponSkillGroup
  twoHanded: boolean
  source: string
}
