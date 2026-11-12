import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { openDatabase, saveDatabase, DB_FILE_PATH } from './sqliteFile.ts'
import { ensureWeaponrySchema, WEAPONRY_TABLE } from './schema.ts'

interface WeaponSeedRow {
  slug: string
  name: string
  description: string
  category: string
  damage_dice: string
  initiative_modifier: string
  range_short: number | null
  range_long: number | null
  skill_group: string
  two_handed: boolean
  source: string
}

const scriptsDbDir = path.dirname(fileURLToPath(import.meta.url))
const WEAPONS_DATA_PATH = path.join(scriptsDbDir, 'data', 'weapons.json')

const UPSERT_SQL = `
INSERT INTO ${WEAPONRY_TABLE}
  (slug, name, description, category, damage_dice, initiative_modifier, range_short, range_long, skill_group, two_handed, source)
VALUES
  (:slug, :name, :description, :category, :damage_dice, :initiative_modifier, :range_short, :range_long, :skill_group, :two_handed, :source)
ON CONFLICT(slug) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  damage_dice = excluded.damage_dice,
  initiative_modifier = excluded.initiative_modifier,
  range_short = excluded.range_short,
  range_long = excluded.range_long,
  skill_group = excluded.skill_group,
  two_handed = excluded.two_handed,
  source = excluded.source;
`

async function main(): Promise<void> {
  const weapons: WeaponSeedRow[] = JSON.parse(fs.readFileSync(WEAPONS_DATA_PATH, 'utf8'))

  const db = await openDatabase()
  ensureWeaponrySchema(db)

  const statement = db.prepare(UPSERT_SQL)
  for (const weapon of weapons) {
    statement.run({
      ':slug': weapon.slug,
      ':name': weapon.name,
      ':description': weapon.description,
      ':category': weapon.category,
      ':damage_dice': weapon.damage_dice,
      ':initiative_modifier': weapon.initiative_modifier,
      ':range_short': weapon.range_short,
      ':range_long': weapon.range_long,
      ':skill_group': weapon.skill_group,
      ':two_handed': weapon.two_handed ? 1 : 0,
      ':source': weapon.source,
    })
  }
  statement.free()

  saveDatabase(db)
  db.close()

  console.log(`Seeded ${weapons.length} weapons into ${WEAPONRY_TABLE} (${DB_FILE_PATH})`)
}

main()
