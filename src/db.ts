import { Pool } from 'pg';

export const db = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'gtfs',
    password: 'yourpassword',
    port: 5432,
});
