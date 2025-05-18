import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { db } from '../db';

interface Trip {
    route_id: string;
    service_id: string;
    trip_id: string;
    trip_headsign: string;
    trip_short_name: string;
    direction_id: string;
    block_id: string;
    shape_id: string;
    wheelchair_accessible: string;
    bikes_allowed: string;
    exceptional: string;
    sub_agency_id: string;
}

export async function importTrips(): Promise<void> {
    console.log('Importing trips...');
    const filePath = path.join(__dirname, '../..', 'gtfs', 'trips.txt');
    const stream = fs.createReadStream(filePath).pipe(csv());

    for await (const row of stream as AsyncIterable<Trip>) {
        try {
            await db.query(
                `INSERT INTO trips (
          trip_id, route_id, service_id, trip_headsign, trip_short_name,
          direction_id, block_id, shape_id,
          wheelchair_accessible, bikes_allowed, exceptional, sub_agency_id
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
        ON CONFLICT (trip_id) DO UPDATE SET
          route_id = EXCLUDED.route_id,
          service_id = EXCLUDED.service_id,
          trip_headsign = EXCLUDED.trip_headsign,
          trip_short_name = EXCLUDED.trip_short_name,
          direction_id = EXCLUDED.direction_id,
          block_id = EXCLUDED.block_id,
          shape_id = EXCLUDED.shape_id,
          wheelchair_accessible = EXCLUDED.wheelchair_accessible,
          bikes_allowed = EXCLUDED.bikes_allowed,
          exceptional = EXCLUDED.exceptional,
          sub_agency_id = EXCLUDED.sub_agency_id;`,
                [
                    row.trip_id,
                    row.route_id,
                    row.service_id,
                    row.trip_headsign || null,
                    row.trip_short_name || null,
                    row.direction_id ? parseInt(row.direction_id) : 0,
                    row.block_id || null,
                    row.shape_id || null,
                    row.wheelchair_accessible ? parseInt(row.wheelchair_accessible) : 0,
                    row.bikes_allowed ? parseInt(row.bikes_allowed) : 0,
                    row.exceptional ? parseInt(row.exceptional) : 0,
                    row.sub_agency_id || null
                ]
            );
        } catch (err) {
            console.error(`❌ Chyba při importu trip_id=${row.trip_id}:`, err);
        }
    }

    console.log('✅ Trips imported successfully.');
}
