import { Request, Response } from 'express';
import { db } from '../db/db';
import { LinesFilterRequestBody } from '../types/Lines';

export const getLines = async (req: Request, res: Response) => {
    try {
        const filter: LinesFilterRequestBody = req.body;

        if (!filter.search || filter.search.trim().length < 1) {
            return res.status(400).json({ error: 'Search query is required.' });
        }

        const likeQuery = `%${filter.search.trim()}%`;

        const result = await db.query(
            `WITH trip_durations AS (SELECT t.route_id,
                                            t.trip_id,
                                            t.shape_id,
                                            MIN(
                                                split_part(st.arrival_time, ':', 1) ::int * 3600 +
                                                                                    split_part(st.arrival_time, ':', 2)
                                                ::int * 60 +
                                                split_part(st.arrival_time, ':', 3) ::int
                                            )                          AS min_arrival,
                                            MAX(
                                                split_part(st.departure_time, ':', 1) ::int * 3600 +
                                                                                      split_part(st.departure_time, ':', 2)
                                                ::int * 60 +
                                                split_part(st.departure_time, ':', 3) ::int
                                            )                          AS max_departure,
                                            COUNT(DISTINCT st.stop_id) AS stop_count
                                     FROM trips t
                                              JOIN stop_times st ON st.trip_id = t.trip_id
                                     GROUP BY t.route_id, t.trip_id, t.shape_id),
                  longest_trip_per_route AS (SELECT DISTINCT
             ON (td.route_id)
                 td.route_id,
                 td.trip_id,
                 td.shape_id,
                 td.max_departure - td.min_arrival AS duration_secs,
                 td.stop_count
             FROM trip_durations td
             ORDER BY td.route_id, td.max_departure - td.min_arrival DESC
                 ),
                 trip_metrics AS (
             SELECT
                 ltr.route_id, ltr.stop_count, MAX (s.shape_dist_traveled) AS length_km, ltr.duration_secs / 60 AS duration_minutes
             FROM longest_trip_per_route ltr
                 LEFT JOIN shapes s
             ON s.shape_id = ltr.shape_id
             GROUP BY ltr.route_id, ltr.duration_secs, ltr.stop_count
                 )
            SELECT r.route_id,
                   r.route_short_name,
                   r.route_long_name,
                   r.route_type,
                   r.agency_id,
                   r.is_night,
                   r.is_regional,
                   r.is_substitute_transport,
                   rsa.sub_agency_name,
                   tm.stop_count,
                   tm.length_km,
                   tm.duration_minutes
            FROM routes r
                     LEFT JOIN route_sub_agencies rsa ON r.route_id = rsa.route_id
                     LEFT JOIN trip_metrics tm ON r.route_id = tm.route_id
            WHERE r.route_short_name ILIKE $1
               OR r.route_long_name ILIKE $1
            ORDER BY r.route_short_name;`,
            [likeQuery]
        );

        // const result = await db.query(
        //     `WITH first_trip_per_route AS (SELECT DISTINCT
        //      ON (t.route_id) t.route_id, t.trip_id
        //      FROM trips t
        //      ORDER BY t.route_id, t.trip_id
        //          ),
        //          stop_counts AS (
        //      SELECT ft.route_id, COUNT (st.stop_id) AS stop_count
        //      FROM first_trip_per_route ft
        //          JOIN stop_times st
        //      ON st.trip_id = ft.trip_id
        //      GROUP BY ft.route_id
        //          )
        //     SELECT r.route_id,
        //            r.route_short_name,
        //            r.route_long_name,
        //            r.route_type,
        //            r.agency_id,
        //            r.is_night,
        //            r.is_regional,
        //            r.is_substitute_transport,
        //            rsa.sub_agency_name,
        //            sc.stop_count
        //     FROM routes r
        //              LEFT JOIN route_sub_agencies rsa ON r.route_id = rsa.route_id
        //              LEFT JOIN stop_counts sc ON r.route_id = sc.route_id
        //     WHERE r.route_short_name ILIKE $1
        //        OR r.route_long_name ILIKE $1
        //     ORDER BY r.route_short_name;`,
        //     [likeQuery]
        // );

        return res.status(200).json(result.rows);
    } catch (error) {
        console.error('Neúspěšné zpracování fulltextového vyhledávání:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
