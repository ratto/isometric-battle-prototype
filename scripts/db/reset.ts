import { openDatabase, saveDatabase, DB_FILE_PATH } from './sqliteFile.ts'
import { DROP_WEAPONRY_TABLE_SQL, CREATE_WEAPONRY_TABLE_SQL, WEAPONRY_TABLE } from './schema.ts'

async function main(): Promise<void> {
  const db = await openDatabase()
  db.run(DROP_WEAPONRY_TABLE_SQL)
  db.run(CREATE_WEAPONRY_TABLE_SQL)
  saveDatabase(db)
  db.close()
  console.log(`Recreated ${WEAPONRY_TABLE} schema in ${DB_FILE_PATH}`)
}

main()
