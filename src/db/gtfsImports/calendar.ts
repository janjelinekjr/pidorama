import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { db } from '../db';

interface Calendar {
    service_id: string;
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
    start_date: string;
    end_date: string;
}

function parseDate(yyyymmdd: string): string {
    return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
}

export async function importCalendar(): Promise<void> {
    console.log('Importing calendar...');
    const filePath = path.join(__dirname, '../..', 'gtfs', 'calendar.txt');
    const stream = fs.createReadStream(filePath).pipe(csv());

    for await (const row of stream as AsyncIterable<Calendar>) {
        try {
            await db.query(
                `INSERT INTO calendar (service_id, monday, tuesday, wednesday, thursday,
                                       friday, saturday, sunday, start_date, end_date)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (service_id) DO
                UPDATE SET
                    monday = EXCLUDED.monday,
                    tuesday = EXCLUDED.tuesday,
                    wednesday = EXCLUDED.wednesday,
                    thursday = EXCLUDED.thursday,
                    friday = EXCLUDED.friday,
                    saturday = EXCLUDED.saturday,
                    sunday = EXCLUDED.sunday,
                    start_date = EXCLUDED.start_date,
                    end_date = EXCLUDED.end_date;`,
                [
                    row.service_id,
                    parseInt(row.monday),
                    parseInt(row.tuesday),
                    parseInt(row.wednesday),
                    parseInt(row.thursday),
                    parseInt(row.friday),
                    parseInt(row.saturday),
                    parseInt(row.sunday),
                    parseDate(row.start_date),
                    parseDate(row.end_date),
                ]
            );
        } catch (err) {
            console.error(`❌ Chyba při importu service_id=${row.service_id}:`, err);
        }
    }

    console.log('✅ Calendar imported successfully.');
}
