import { createPool, PoolConfig } from 'mariadb';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

export interface DatabasePoolOptions {
  database: string;
  envUrlKey?: string;
  connectionLimit?: number;
}

/**
 * Creates a configured MariaDB pool and Prisma adapter using environment variables
 * with fallback to local development defaults.
 */
export function createMariaDbAdapter(options: DatabasePoolOptions): PrismaMariaDb {
  const { database, envUrlKey, connectionLimit = 10 } = options;

  let poolConfig: PoolConfig;

  const defaultPassword = process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || process.env.MYSQL_ROOT_PASSWORD || '';
  const defaultUser = process.env.DB_USER || process.env.MYSQL_USER || 'root';

  const url = envUrlKey ? process.env[envUrlKey] : undefined;
  if (url) {
    try {
      const parsedUrl = new URL(url);
      poolConfig = {
        host: parsedUrl.hostname || process.env.DB_HOST || '127.0.0.1',
        port: parsedUrl.port ? parseInt(parsedUrl.port, 10) : Number(process.env.DB_PORT) || 3306,
        user: decodeURIComponent(parsedUrl.username || defaultUser),
        password: decodeURIComponent(parsedUrl.password || defaultPassword),
        database: parsedUrl.pathname ? parsedUrl.pathname.replace(/^\//, '') : database,
        allowPublicKeyRetrieval: true,
        connectTimeout: 15000,
        acquireTimeout: 15000,
        connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || connectionLimit,
      };
    } catch {
      // If URL parsing fails, fallback to standard env vars
      poolConfig = buildEnvPoolConfig(database, connectionLimit);
    }
  } else {
    poolConfig = buildEnvPoolConfig(database, connectionLimit);
  }

  const pool = createPool(poolConfig);
  return new PrismaMariaDb(pool as any);
}

function buildEnvPoolConfig(database: string, connectionLimit: number): PoolConfig {
  const defaultPassword = process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || process.env.MYSQL_ROOT_PASSWORD || '';
  const defaultUser = process.env.DB_USER || process.env.MYSQL_USER || 'root';

  return {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    user: defaultUser,
    password: defaultPassword,
    database: database,
    allowPublicKeyRetrieval: true,
    connectTimeout: 15000,
    acquireTimeout: 15000,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || connectionLimit,
  };
}
