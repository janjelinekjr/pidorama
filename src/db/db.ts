import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const db = new Pool({
    user: String(process.env.DB_USERNAME),
    host: String(process.env.DB_HOST),
    database: String(process.env.DB_NAME),
    password: String(process.env.DB_PASSWORD),
    port: Number(process.env.DB_PORT),
});
