import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import initSqlJs from 'sql.js'
import type { Database, SqlJsStatic } from './types.ts'

const scriptsDbDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptsDbDir, '..', '..')

export const DB_FILE_PATH = path.join(projectRoot, 'src', 'data', 'game-data.sqlite')

const require = createRequire(import.meta.url)
const sqlWasmDir = path.dirname(require.resolve('sql.js/dist/sql-wasm.js'))

let sqlJs: SqlJsStatic | undefined

async function getSqlJs(): Promise<SqlJsStatic> {
  if (!sqlJs) {
    sqlJs = await initSqlJs({
      locateFile: (file) => path.join(sqlWasmDir, file),
    })
  }
  return sqlJs
}

export async function openDatabase(): Promise<Database> {
  const SQL = await getSqlJs()
  if (fs.existsSync(DB_FILE_PATH)) {
    const fileBuffer = fs.readFileSync(DB_FILE_PATH)
    return new SQL.Database(fileBuffer)
  }
  return new SQL.Database()
}

export function saveDatabase(db: Database): void {
  fs.mkdirSync(path.dirname(DB_FILE_PATH), { recursive: true })
  const buffer = Buffer.from(db.export())
  fs.writeFileSync(DB_FILE_PATH, buffer)
}

export function listTableNames(db: Database): string[] {
  const result = db.exec("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name;")
  if (result.length === 0) return []
  return result[0].values.map((row: unknown[]) => String(row[0]))
}
