import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { db } from '../db';

interface CalendarDate {
    service_id: string;
    date: string;
    exception_type: string;
}

function parseDate(yyyymmdd: string): string {
    return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
}

export async function importCalendarDates(): Promise<void> {
    console.log('Importing calendar_dates...');
    const filePath = path.join(__dirname, '../..', 'gtfs', 'calendar_dates.txt');
    const stream = fs.createReadStream(filePath).pipe(csv());

    for await (const row of stream as AsyncIterable<CalendarDate>) {
        try {
            await db.query(
                `INSERT INTO calendar_dates (service_id, date, exception_type)
                 VALUES ($1, $2, $3) ON CONFLICT (service_id, date) DO
                UPDATE SET
                    exception_type = EXCLUDED.exception_type;`,
                [row.service_id, parseDate(row.date), parseInt(row.exception_type)]
            );
        } catch (err) {
            console.error(`❌ Chyba při importu service_id=${row.service_id}, date=${row.date}:`, err);
        }
    }

    console.log('✅ Calendar dates imported successfully.');
}
