import { queryTable, type Database } from './sqliteDatabase'
import type { Enhancement } from './enhancement'

export function mapRowToEnhancement(rowObject: Record<string, unknown>): Enhancement {
  return {
    id: rowObject.id as string,
    name: rowObject.name as string,
    groupKey: rowObject.group_key as string,
    polarity: rowObject.polarity as Enhancement['polarity'],
    cost: rowObject.cost as number,
    effect: rowObject.effect as string,
  }
}

export function queryAllEnhancements(db: Database): Enhancement[] {
  return queryTable(db, 'ENHANCEMENTS', mapRowToEnhancement)
}
