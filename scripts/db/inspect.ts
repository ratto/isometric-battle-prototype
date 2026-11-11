import { openDatabase, listTableNames } from './sqliteFile.ts'

async function main(): Promise<void> {
  const db = await openDatabase()
  const tableNames = listTableNames(db)

  if (tableNames.length === 0) {
    console.log('No tables found in the database.')
  }

  for (const tableName of tableNames) {
    const result = db.exec(`SELECT * FROM ${tableName};`)
    console.log(`\n=== ${tableName} (${result[0]?.values.length ?? 0} rows) ===`)
    if (result.length === 0) {
      console.log('(empty)')
      continue
    }
    const { columns, values } = result[0]
    for (const row of values) {
      const rowObject: Record<string, unknown> = {}
      columns.forEach((column, index) => {
        rowObject[column] = row[index]
      })
      console.log(JSON.stringify(rowObject))
    }
  }

  db.close()
}

main()
