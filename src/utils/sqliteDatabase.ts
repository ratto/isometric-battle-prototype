import initSqlJs from 'sql.js'
import sqlWasmUrl from 'sql.js/dist/sql-wasm-browser.wasm?url'

import gameDataUrl from '@/data/game-data.sqlite?url'

type SqlJsStatic = Awaited<ReturnType<typeof initSqlJs>>
export type Database = InstanceType<SqlJsStatic['Database']>

export async function loadGameDatabase(): Promise<Database> {
  const SQL = await initSqlJs({ locateFile: () => sqlWasmUrl })
  const response = await fetch(gameDataUrl)
  const buffer = await response.arrayBuffer()

  return new SQL.Database(new Uint8Array(buffer))
}

export function queryTable<T>(
  db: Database,
  tableName: string,
  mapRow: (rowObject: Record<string, unknown>) => T,
): T[] {
  const result = db.exec(`SELECT * FROM ${tableName};`)
  if (result.length === 0) return []

  const { columns, values } = result[0]
  return values.map((row: unknown[]) => {
    const rowObject: Record<string, unknown> = {}
    columns.forEach((column, index) => {
      rowObject[column] = row[index]
    })
    return mapRow(rowObject)
  })
}
