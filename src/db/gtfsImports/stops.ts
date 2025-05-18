import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { db } from '../db';

interface Stop {
    stop_id: string;
    stop_name: string;
    stop_lat: string;
    stop_lon: string;
    zone_id: string;
    stop_url: string;
    location_type: string;
    parent_station: string;
    wheelchair_boarding: string;
    level_id: string;
    platform_code: string;
    asw_node_id: string;
    asw_stop_id: string;
    zone_region_type: string;
}

export async function importStops(): Promise<void> {
    console.log('Importing stops...');
    const filePath = path.join(__dirname, '../..', 'gtfs', 'stops.txt');

    const stream = fs.createReadStream(filePath).pipe(csv());

    for await (const row of stream as AsyncIterable<Stop>) {
        try {
            await db.query(
                `INSERT INTO stops (
          stop_id, stop_name, stop_lat, stop_lon, zone_id, stop_url,
          location_type, parent_station, wheelchair_boarding, level_id,
          platform_code, asw_node_id, asw_stop_id, zone_region_type
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (stop_id) DO UPDATE SET
          stop_name = EXCLUDED.stop_name,
          stop_lat = EXCLUDED.stop_lat,
          stop_lon = EXCLUDED.stop_lon,
          zone_id = EXCLUDED.zone_id,
          stop_url = EXCLUDED.stop_url,
          location_type = EXCLUDED.location_type,
          parent_station = EXCLUDED.parent_station,
          wheelchair_boarding = EXCLUDED.wheelchair_boarding,
          level_id = EXCLUDED.level_id,
          platform_code = EXCLUDED.platform_code,
          asw_node_id = EXCLUDED.asw_node_id,
          asw_stop_id = EXCLUDED.asw_stop_id,
          zone_region_type = EXCLUDED.zone_region_type;`,
                [
                    row.stop_id,
                    row.stop_name,
                    parseFloat(row.stop_lat),
                    parseFloat(row.stop_lon),
                    row.zone_id || null,
                    row.stop_url || null,
                    row.location_type ? parseInt(row.location_type) : 0,
                    row.parent_station || null,
                    row.wheelchair_boarding ? parseInt(row.wheelchair_boarding) : 0,
                    row.level_id || null,
                    row.platform_code || null,
                    row.asw_node_id || null,
                    row.asw_stop_id || null,
                    row.zone_region_type ? parseInt(row.zone_region_type) : 0,
                ]
            );
        } catch (err) {
            console.error(`❌ Chyba při importu stop_id=${row.stop_id}:`, err);
        }
    }

    console.log('✅ Stops imported successfully.');
}
