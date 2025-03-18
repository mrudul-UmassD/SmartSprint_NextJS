import mysql from 'mysql2/promise';

let cachedConnection: mysql.Pool | null = null;

/**
 * Create a database connection pool
 */
export async function getConnection(): Promise<mysql.Pool> {
  if (cachedConnection) {
    return cachedConnection;
  }

  // Check if we have all the required environment variables
  const missingEnvVars: string[] = [];
  ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_NAME'].forEach(varName => {
    if (!process.env[varName]) {
      missingEnvVars.push(varName);
    }
  });

  if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  }

  // Create connection pool
  cachedConnection = mysql.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  // Test connection
  try {
    const connection = await cachedConnection.getConnection();
    console.log('Database connection established successfully');
    connection.release();
    return cachedConnection;
  } catch (error) {
    console.error('Failed to connect to database:', error);
    throw error;
  }
}

/**
 * Execute a SQL query on the database
 */
export async function query<T>(sql: string, params?: any[]): Promise<T> {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute(sql, params);
    return rows as T;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Execute a single row query, returns the first row or null
 */
export async function queryOne<T>(sql: string, params?: any[]): Promise<T | null> {
  const results = await query<T[]>(sql, params);
  return results && results.length > 0 ? results[0] : null;
}

/**
 * Insert a record and return the inserted ID
 */
export async function insert(table: string, data: Record<string, any>): Promise<string> {
  // Generate UUID for id if not provided
  if (!data.id) {
    data.id = generateUUID();
  }
  
  const keys = Object.keys(data);
  const placeholders = keys.map(() => '?').join(', ');
  const columnNames = keys.join(', ');
  const values = Object.values(data);
  
  const sql = `INSERT INTO ${table} (${columnNames}) VALUES (${placeholders})`;
  
  await query(sql, values);
  return data.id;
}

/**
 * Update a record by ID
 */
export async function update(table: string, id: string, data: Record<string, any>): Promise<boolean> {
  const keys = Object.keys(data);
  if (keys.length === 0) return false;
  
  const updates = keys.map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(data), id];
  
  const sql = `UPDATE ${table} SET ${updates} WHERE id = ?`;
  
  const result = await query<mysql.ResultSetHeader>(sql, values);
  return result.affectedRows > 0;
}

/**
 * Delete a record by ID
 */
export async function deleteById(table: string, id: string): Promise<boolean> {
  const sql = `DELETE FROM ${table} WHERE id = ?`;
  const result = await query<mysql.ResultSetHeader>(sql, [id]);
  return result.affectedRows > 0;
}

/**
 * Generate a UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
} 