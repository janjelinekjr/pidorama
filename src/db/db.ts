import { Pool } from 'pg';

export const db = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'gtfs',
    password: '86811868',
    port: 5432,
});
