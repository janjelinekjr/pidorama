import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { db } from '../db';

interface FareAttribute {
    fare_id: string;
    price: string;
    currency_type: string;
    payment_method: string;
    transfers: string;
    agency_id: string;
    transfer_duration: string;
}

export async function importFareAttributes(): Promise<void> {
    console.log('Importing fare_attributes...');
    const filePath = path.join(__dirname, '../..', 'gtfs', 'fare_attributes.txt');
    const stream = fs.createReadStream(filePath).pipe(csv());

    for await (const row of stream as AsyncIterable<FareAttribute>) {
        try {
            await db.query(
                `INSERT INTO fare_attributes (fare_id, price, currency_type, payment_method, transfers, agency_id,
                                              transfer_duration)
                 VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (fare_id) DO
                UPDATE SET
                    price = EXCLUDED.price,
                    currency_type = EXCLUDED.currency_type,
                    payment_method = EXCLUDED.payment_method,
                    transfers = EXCLUDED.transfers,
                    agency_id = EXCLUDED.agency_id,
                    transfer_duration = EXCLUDED.transfer_duration;`,
                [
                    row.fare_id,
                    parseFloat(row.price),
                    row.currency_type,
                    parseInt(row.payment_method),
                    row.transfers ? parseInt(row.transfers) : null,
                    row.agency_id || null,
                    parseInt(row.transfer_duration || '0'),
                ]
            );
        } catch (err) {
            console.error(`❌ Chyba při importu fare_id=${row.fare_id}:`, err);
        }
    }

    console.log('✅ Fare attributes imported successfully.');
}
