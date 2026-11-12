import initSqlJs from 'sql.js'

export type SqlJsStatic = Awaited<ReturnType<typeof initSqlJs>>
export type Database = InstanceType<SqlJsStatic['Database']>
