import { loadGameDatabase, queryTable, type Database } from './sqliteDatabase'
import { WeaponSkillGroup } from './weaponSkillGroup'
import type { Weapon } from './weapon'

export const loadWeaponryDatabase = loadGameDatabase

export function mapRowToWeapon(rowObject: Record<string, unknown>): Weapon {
  return {
    slug: rowObject.slug as string,
    name: rowObject.name as string,
    description: rowObject.description as string,
    category: rowObject.category as Weapon['category'],
    damageDice: rowObject.damage_dice as string,
    initiativeModifier: rowObject.initiative_modifier as string,
    rangeShort: rowObject.range_short as number | null,
    rangeLong: rowObject.range_long as number | null,
    skillGroup: rowObject.skill_group as WeaponSkillGroup,
    twoHanded: rowObject.two_handed === 1,
    source: rowObject.source as string,
  }
}

export function queryAllWeapons(db: Database): Weapon[] {
  return queryTable(db, 'WEAPONRY', mapRowToWeapon)
}
