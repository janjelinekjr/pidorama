import { DaysInWeekEnum } from './General';

enum SortByEnum {
    SHORT_NAME = 'short_name',
    LONG_NAME = 'long_name',
    LENGTH = 'length',
    STOPS = 'stops',
    TYPE = 'type',
    AGENCY = 'agency',
    DURATION = 'duration'
}

export type LinesFilterRequestBody = {
    search: string;
    type: Array<'0' | '1' | '2' | '3' | '4'>
    agency: string[];
    night: boolean;
    regional: boolean;
    substitute: boolean;
    minStops: number;
    maxStops: number;
    minLength: number;
    maxLength: number;
    minDuration: number;
    maxDuration: number;
    days: Array<DaysInWeekEnum>
    sort: Array<{ by: SortByEnum; order: 'asc' | 'desc' }>
}