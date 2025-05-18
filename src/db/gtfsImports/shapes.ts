import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { db } from '../db';

interface Shape {
    shape_id: string;
    shape_pt_lat: string;
    shape_pt_lon: string;
    shape_pt_sequence: string;
    shape_dist_traveled: string;
}

export async function importShapes(): Promise<void> {
    console.log('Importing shapes...');
    const filePath = path.join(__dirname, '../..', 'gtfs', 'shapes.txt');
    const stream = fs.createReadStream(filePath).pipe(csv());

    for await (const row of stream as AsyncIterable<Shape>) {
        try {
            await db.query(
                `INSERT INTO shapes (shape_id, shape_pt_lat, shape_pt_lon, shape_pt_sequence, shape_dist_traveled)
                 VALUES ($1, $2, $3, $4, $5) ON CONFLICT (shape_id, shape_pt_sequence) DO
                UPDATE SET
                    shape_pt_lat = EXCLUDED.shape_pt_lat,
                    shape_pt_lon = EXCLUDED.shape_pt_lon,
                    shape_dist_traveled = EXCLUDED.shape_dist_traveled;`,
                [
                    row.shape_id,
                    parseFloat(row.shape_pt_lat),
                    parseFloat(row.shape_pt_lon),
                    parseInt(row.shape_pt_sequence),
                    parseFloat(row.shape_dist_traveled),
                ]
            );
            console.log(row.shape_id)
        } catch (err) {
            console.error(`❌ Chyba při importu shape_id=${row.shape_id}, seq=${row.shape_pt_sequence}:`, err);
        }
    }

    console.log('✅ Shapes imported successfully.');
}
