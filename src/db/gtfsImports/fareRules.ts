import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { db } from '../db';

interface FareRule {
    fare_id: string;
    contains_id: string;
    route_id: string;
}

export async function importFareRules(): Promise<void> {
    console.log('Importing fare_rules...');
    const filePath = path.join(__dirname, '../..', 'gtfs', 'fare_rules.txt');
    const stream = fs.createReadStream(filePath).pipe(csv());

    for await (const row of stream as AsyncIterable<FareRule>) {
        try {
            await db.query(
                `INSERT INTO fare_rules (fare_id, contains_id, route_id)
                 VALUES ($1, $2, $3) ON CONFLICT DO NOTHING;`, // nebo přidej UNIQUE constraint podle potřeby
                [row.fare_id, row.contains_id || null, row.route_id || null]
            );
        } catch (err) {
            console.error(`❌ Chyba při importu fare_id=${row.fare_id}:`, err);
        }
    }

    console.log('✅ Fare rules imported successfully.');
}
