import { importRoutes } from './db/gtfsImports/routes';
import { importStops } from './db/gtfsImports/stops';
import { importTrips } from './db/gtfsImports/trips';
import { importStopTimes } from './db/gtfsImports/stopTimes';
import { importCalendar } from './db/gtfsImports/calendar';
import { importShapes } from './db/gtfsImports/shapes';
import { importCalendarDates } from './db/gtfsImports/calendarDates';
import { importFareAttributes } from './db/gtfsImports/fareAttributes';
import { importFareRules } from './db/gtfsImports/fareRules';
import { importRouteSubAgencies } from './db/gtfsImports/routeSubAgencies';
import { EnvironmentEnum } from './types/General';
import { downloadAndExtractGTFS } from './utils/general';

const environment = process.env.NODE_ENV || 'dev';

(async () => {
    try {
        if (environment === EnvironmentEnum.PROD) {
            await downloadAndExtractGTFS();
            await importRoutes();
            await importStops();
            await importTrips();
            await importCalendar();
            await importStopTimes();
            await importShapes();
            await importCalendarDates();
            await importFareAttributes();
            await importFareRules();
            await importRouteSubAgencies();
            console.log('✅ Download and imports done!');
        }
        console.log('Without download and imports in dev!');
    } catch (err) {
        console.error('❌ Error:', err);
    }
})();
