import { Request, Response } from 'express';
import { LineFulltextSearchRequestBody } from '../types/Lines';
import { db } from '../db/db';

export const getAndFilterLines = (req: Request, res: Response) => {
    try {
        const filters = req.body;

        res.status(200).json({ message: 'Filters recieved', filters });
    } catch (error) {
        console.error('Neúspěšné zpracování filteru:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getLinesFulltextSearch = async (req: Request, res: Response) => {
    try {
        const { search }: LineFulltextSearchRequestBody = req.body;

        if (!search || search.trim().length < 1) {
            return res.status(400).json({ error: 'Search query is required.' });
        }

        const likeQuery = `%${search}%`;

        const result = await db.query(
            `SELECT route_id,
                    route_short_name,
                    route_long_name,
                    route_type
             FROM routes
             WHERE route_short_name ILIKE $1
                OR route_long_name ILIKE $1
             ORDER BY route_short_name;`,
            [likeQuery]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Neúspěšné zpracování fulltextového vyhledávání:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
