import { Pool } from '@neondatabase/serverless';

const connectionString = import.meta.env.VITE_DATABASE_URL;

if (!connectionString) {
  console.error('Database connection string not configured in VITE_DATABASE_URL. App will load but DB features will fail.');
}

export const db = new Pool({ connectionString: connectionString || '' });
