import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { db } from '../db';

interface Route {
    route_id: string;
    agency_id: string;
    route_short_name: string;
    route_long_name: string;
    route_type: string;
    route_url: string;
    route_color: string;
    route_text_color: string;
    is_night: string;
    is_regional: string;
    is_substitute_transport: string;
}

export async function importRoutes(): Promise<void> {
    console.log('Importing routes...');
    const filePath = path.join(__dirname, '../..', 'gtfs', 'routes.txt');

    const stream = fs.createReadStream(filePath).pipe(csv());

    for await (const row of stream as AsyncIterable<Route>) {
        try {
            await db.query(
                `INSERT INTO routes (route_id, agency_id, route_short_name, route_long_name, route_type, route_url,
                                     route_color, route_text_color, is_night, is_regional, is_substitute_transport)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) ON CONFLICT (route_id) DO
                UPDATE SET
                    agency_id = EXCLUDED.agency_id,
                    route_short_name = EXCLUDED.route_short_name,
                    route_long_name = EXCLUDED.route_long_name,
                    route_type = EXCLUDED.route_type,
                    route_url = EXCLUDED.route_url,
                    route_color = EXCLUDED.route_color,
                    route_text_color = EXCLUDED.route_text_color,
                    is_night = EXCLUDED.is_night,
                    is_regional = EXCLUDED.is_regional,
                    is_substitute_transport = EXCLUDED.is_substitute_transport;`,
                [
                    row.route_id,
                    row.agency_id,
                    row.route_short_name,
                    row.route_long_name,
                    parseInt(row.route_type),
                    row.route_url,
                    row.route_color,
                    row.route_text_color,
                    parseInt(row.is_night),
                    parseInt(row.is_regional),
                    parseInt(row.is_substitute_transport),
                ]
            );
        } catch (err) {
            console.error(`❌ Chyba při importu route_id=${row.route_id}:`, err);
        }
    }

    console.log('✅ Routes imported successfully.');
}
