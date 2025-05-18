import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { db } from '../db';

interface RouteSubAgency {
    route_id: string;
    route_licence_number: string;
    sub_agency_id: string;
    sub_agency_name: string;
}

export async function importRouteSubAgencies(): Promise<void> {
    console.log('Importing route_sub_agencies...');
    const filePath = path.join(__dirname, '../..', 'gtfs', 'route_sub_agencies.txt');
    const stream = fs.createReadStream(filePath).pipe(csv());

    for await (const row of stream as AsyncIterable<RouteSubAgency>) {
        try {
            await db.query(
                `INSERT INTO route_sub_agencies (route_id, route_licence_number, sub_agency_id, sub_agency_name)
                 VALUES ($1, $2, $3, $4) ON CONFLICT (route_id, sub_agency_id) DO
                UPDATE SET
                    route_licence_number = EXCLUDED.route_licence_number,
                    sub_agency_name = EXCLUDED.sub_agency_name;`,
                [row.route_id, row.route_licence_number || null, row.sub_agency_id || null, row.sub_agency_name || null]
            );
        } catch (err) {
            console.error(`❌ Chyba při importu route_id=${row.route_id}:`, err);
        }
    }

    console.log('✅ Route sub-agencies imported successfully.');
}
