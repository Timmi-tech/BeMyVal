import { Pool } from '@neondatabase/serverless';

const connectionString = import.meta.env.VITE_DATABASE_URL;

if (!connectionString) {
  throw new Error('Database connection string not configured in VITE_DATABASE_URL');
}

export const db = new Pool({ connectionString });
