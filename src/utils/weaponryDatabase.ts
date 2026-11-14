import initSqlJs from 'sql.js'
import sqlWasmUrl from 'sql.js/dist/sql-wasm-browser.wasm?url'

import gameDataUrl from '@/data/game-data.sqlite?url'

import { WeaponSkillGroup } from './weaponSkillGroup'
import type { Weapon } from './weapon'

type SqlJsStatic = Awaited<ReturnType<typeof initSqlJs>>
type Database = InstanceType<SqlJsStatic['Database']>

export async function loadWeaponryDatabase(): Promise<Database> {
  const SQL = await initSqlJs({ locateFile: () => sqlWasmUrl })
  const response = await fetch(gameDataUrl)
  const buffer = await response.arrayBuffer()

  return new SQL.Database(new Uint8Array(buffer))
}

export function mapRowToWeapon(row: unknown[], columns: string[]): Weapon {
  const rowObject: Record<string, unknown> = {}
  columns.forEach((column, index) => {
    rowObject[column] = row[index]
  })

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
  const result = db.exec('SELECT * FROM WEAPONRY;')
  if (result.length === 0) return []

  const { columns, values } = result[0]
  return values.map((row: unknown[]) => mapRowToWeapon(row, columns))
}
