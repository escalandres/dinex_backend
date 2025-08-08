import { createClient } from '@libsql/client';

// process.loadEnvFile();

const db = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN
});

export default db;