import { createClient } from '@libsql/client';

process.loadEnvFile();

const client = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN
});

