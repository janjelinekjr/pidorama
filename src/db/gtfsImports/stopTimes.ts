import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { db } from '../db';

interface StopTime {
    trip_id: string;
    arrival_time: string;
    departure_time: string;
    stop_id: string;
    stop_sequence: string;
    stop_headsign: string;
    pickup_type: string;
    drop_off_type: string;
    shape_dist_traveled: string;
    trip_operation_type: string;
    bikes_allowed: string;
}

export async function importStopTimes(): Promise<void> {
    console.log('Importing stop_times...');
    const filePath = path.join(__dirname, '../..', 'gtfs', 'stop_times.txt');
    const stream = fs.createReadStream(filePath).pipe(csv());

    for await (const row of stream as AsyncIterable<StopTime>) {
        try {
            await db.query(
                `INSERT INTO stop_times (trip_id, arrival_time, departure_time, stop_id, stop_sequence,
                                         stop_headsign, pickup_type, drop_off_type,
                                         shape_dist_traveled, trip_operation_type, bikes_allowed)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) ON CONFLICT (trip_id, stop_sequence) DO
                UPDATE SET
                    arrival_time = EXCLUDED.arrival_time,
                    departure_time = EXCLUDED.departure_time,
                    stop_id = EXCLUDED.stop_id,
                    stop_headsign = EXCLUDED.stop_headsign,
                    pickup_type = EXCLUDED.pickup_type,
                    drop_off_type = EXCLUDED.drop_off_type,
                    shape_dist_traveled = EXCLUDED.shape_dist_traveled,
                    trip_operation_type = EXCLUDED.trip_operation_type,
                    bikes_allowed = EXCLUDED.bikes_allowed;`,
                [
                    row.trip_id,
                    row.arrival_time,
                    row.departure_time,
                    row.stop_id,
                    parseInt(row.stop_sequence),
                    row.stop_headsign || null,
                    parseInt(row.pickup_type || '0'),
                    parseInt(row.drop_off_type || '0'),
                    parseFloat(row.shape_dist_traveled || '0'),
                    parseInt(row.trip_operation_type || '0'),
                    parseInt(row.bikes_allowed || '0'),
                ]
            );
        } catch (err) {
            console.error(`❌ Chyba při importu trip_id=${row.trip_id} stop_sequence=${row.stop_sequence}:`, err);
        }
    }

    console.log('✅ Stop times imported successfully.');
}
