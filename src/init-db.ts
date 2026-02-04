import { db } from './lib/db';

const initDB = async () => {
    console.log('Initializing database...');
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS cards (
                id TEXT PRIMARY KEY,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status TEXT DEFAULT 'waiting',
                interactions INTEGER DEFAULT 0
            );
        `);
        console.log('Table "cards" created successfully.');
    } catch (err) {
        console.error('Error creating table:', err);
    } finally {
        await db.end();
    }
};

initDB();
