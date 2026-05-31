/** Pool de conexiones pg — singleton compartido por toda la aplicación. */
import { Pool } from 'pg';
import { env } from './env.js';

export const pool = new Pool({ connectionString: env.DATABASE_URL });
