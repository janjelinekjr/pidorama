import fetch from 'node-fetch';
import unzipper from 'unzipper';
import fs from 'fs';
import path from 'path';
import { GTFS_URL } from '../constants/appConstants';

export async function downloadAndExtractGTFS(): Promise<void> {
    console.log('Downloading GTFS ZIP...');
    const response = await fetch(GTFS_URL);

    if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    await new Promise((resolve, reject) => {
        response
            .body!.pipe(unzipper.Parse())
            .on('entry', (entry) => {
                const filePath = path.join(__dirname, '..', 'gtfs', entry.path);
                entry.pipe(fs.createWriteStream(filePath));
            })
            .on('close', () => {
                console.log('Unzipped to ./gtfs');
                resolve(null);
            })
            .on('error', reject);
    });
}
