/**
 * MariaDB Database Connection
 * Uses mysql2 with connection pooling for production-ready database access.
 * Configure via environment variables in .env
 */

import mysql, { RowDataPacket, ResultSetHeader } from "mysql2/promise";

// Connection pool (singleton)
let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "3306"),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "hr_management",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
  }
  return pool;
}

/**
 * Execute a query and return results
 */
export async function query<T = RowDataPacket[]>(
  sql: string,
  params?: (string | number | boolean | null | undefined)[]
): Promise<T> {
  const db = getPool();
  const [results] = await db.execute<RowDataPacket[]>(sql, params);
  return results as unknown as T;
}

/**
 * Execute an INSERT and return the insertId
 */
export async function insert(
  sql: string,
  params?: (string | number | boolean | null | undefined)[]
): Promise<number> {
  const db = getPool();
  const [result] = await db.execute<ResultSetHeader>(sql, params);
  return result.insertId;
}

/**
 * Execute an UPDATE/DELETE and return affected rows count
 */
export async function execute(
  sql: string,
  params?: (string | number | boolean | null | undefined)[]
): Promise<number> {
  const db = getPool();
  const [result] = await db.execute<ResultSetHeader>(sql, params);
  return result.affectedRows;
}

/**
 * Get a single row or null
 */
export async function queryOne<T = RowDataPacket>(
  sql: string,
  params?: (string | number | boolean | null | undefined)[]
): Promise<T | null> {
  const db = getPool();
  const [rows] = await db.execute<RowDataPacket[]>(sql, params);
  return rows.length > 0 ? (rows[0] as unknown as T) : null;
}
