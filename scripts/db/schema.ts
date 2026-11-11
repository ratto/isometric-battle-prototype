import type { Database } from './types.ts'

export const WEAPONRY_TABLE = 'WEAPONRY'

export const DROP_WEAPONRY_TABLE_SQL = `DROP TABLE IF EXISTS ${WEAPONRY_TABLE};`

export const CREATE_WEAPONRY_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS ${WEAPONRY_TABLE} (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  damage_dice TEXT NOT NULL,
  initiative_modifier TEXT NOT NULL,
  range_short INTEGER,
  range_long INTEGER,
  skill_group TEXT NOT NULL,
  two_handed INTEGER NOT NULL,
  source TEXT NOT NULL
);
`

export function ensureWeaponrySchema(db: Database): void {
  db.run(CREATE_WEAPONRY_TABLE_SQL)
}
