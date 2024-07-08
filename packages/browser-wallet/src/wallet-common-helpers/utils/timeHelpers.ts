import {
    BakerPoolPendingChangeReduceBakerCapital,
    BakerPoolPendingChangeRemovePool,
    ChainParameters,
    ConsensusStatus,
    Duration,
    RewardStatus,
    StakePendingChange,
} from '@concordium/web-sdk';
import { ensureNumberLength } from './basicHelpers.js';
/* eslint-disable import/prefer-default-export */
type YearMonth = string; // "YYYYMM"
type YearMonthDate = string; // "YYYYMMDD"

/**
 * Units of Time for the unix timestamp.
 * Values are set so that (time in unit) * unit = (time in milliseconds)
 */
export enum TimeStampUnit {
    seconds = 1e3,
    milliSeconds = 1,
}

/**
 * Given a YearMonth | YearMonthDate string (YYYYMM | YYYYMMDD), returns
 * a displayable format.
 *
 * @example
 * formatDate("202001") => "January 2020"
 * formatDate("20200101") => "1 January 2020"
 * formatDate("202001", "da") => "1. januar 2020"
 */
export function formatDate(date: YearMonth | YearMonthDate, locale?: string) {
    const y = date.slice(0, 4);
    const m = date.slice(4, 6);
    const d = date.slice(6, 8);

    const dtFormat = new Intl.DateTimeFormat(locale || 'en-GB', {
        day: d ? '2-digit' : undefined,
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    });

    return dtFormat.format(new Date(`${y}-${m}${d ? `-${d}` : ''}`));
}

// Returns the YearMonth string (YYYYMM), of the current time.
export function getCurrentYearMonth(): YearMonth {
    const date = new Date();
    let month = (date.getMonth() + 1).toString();
    if (month.length === 1) {
        month = `0${month}`;
    }
    return date.getFullYear() + month;
}

/**
 * Converts a unix timestamp to a Date type.
 * @param timestamp the unix timestamp, in seconds or milliseconds.
 * @param unit the unit of timestamp
 * @returns a Date representing the unix timestamp
 */
export function dateFromTimestamp(timestamp: string | bigint, unit: TimeStampUnit = TimeStampUnit.seconds): Date {
    return new Date(parseInt(timestamp.toString(), 10) * unit);
}

/**
 * Given a unix timeStamp, return the date in ISO formatted string.
 * Assumes the timestamp is in seconds, otherwise the unit should be specified.
 */
export const getISOFormat = (timeStamp: string | bigint, unit: TimeStampUnit = TimeStampUnit.seconds) =>
    dateFromTimestamp(timeStamp, unit).toISOString();

export enum TimeConstants {
    Second = 1000,
    Minute = 60 * Second,
    Hour = 60 * Minute,
    Day = 24 * Hour,
    Week = 7 * Day,
    Month = 30 * Day,
}

// default expiry on transactions (1 hour from now).
export function getDefaultExpiry() {
    return new Date(Date.now() + TimeConstants.Hour);
}

/** Convert a date to seconds since Unix epoch */
export function secondsSinceUnixEpoch(date: Date) {
    return Math.floor(date.getTime() / TimeStampUnit.seconds);
}

/**
 * Given a date, return a new date, which is the next whole hour, i.e. f(13.14) = 14.00.
 * N.B. if the given date is already the whole hour, the same date is returned. i.e. f(13.00:00) = 13.00:00.
 *  @param baseline the date from which to get the next whole hour.
 *  @param hoursToIncrease optional parameter, increases the output by the given number of hours. i.e. f(13.14, 2) = 16.
 */
export function getNextWholeHour(baseline: Date, hoursToIncrease = 0) {
    const date = new Date(baseline.getTime());
    if (date.getSeconds() === 0 && date.getMinutes() === 0) {
        date.setHours(date.getHours() + hoursToIncrease);
    } else {
        date.setSeconds(0);
        date.setMinutes(0);
        date.setHours(date.getHours() + hoursToIncrease + 1);
    }
    return date;
}

export function getDefaultScheduledStartTime() {
    return getNextWholeHour(new Date(), 2);
}

export function getNow(unit: TimeStampUnit = TimeStampUnit.milliSeconds): number {
    return Math.floor(new Date().getTime() / unit);
}

export interface DateParts {
    year: string;
    month: string;
    date: string;
    hours: string;
    minutes: string;
    seconds: string;
}

interface TimeParts {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

/**
 * Converts miliseconds into days, hours, minutes, and seconds.
 *
 * @param miliseconds time to convert in ms.
 *
 * @example
 * convertMiliseconds(1000) => { ..., seconds: 1 };
 * convertMiliseconds(1000 * 3603) => { days: 0, hours: 1, minutes: 0, seconds: 3 };
 * convertMiliseconds(1000 * 3600 * 36) => { days: 1, hours: 12, minutes: 0, seconds: 0 };
 */
export function msToTimeParts(miliseconds: number | undefined): TimeParts | undefined {
    if (!miliseconds) {
        return undefined;
    }

    const totalSeconds = Math.floor(miliseconds / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const days = Math.floor(totalHours / 24);

    const seconds = totalSeconds % 60;
    const minutes = totalMinutes % 60;
    const hours = totalHours % 24;

    return { days, hours, minutes, seconds };
}

export function datePartsFromDate(date?: Date): DateParts | undefined {
    if (!date) {
        return undefined;
    }

    return {
        year: `${date.getFullYear()}`,
        month: `${date.getMonth() + 1}`,
        date: `${date.getDate()}`,
        hours: `${date.getHours()}`,
        minutes: `${date.getMinutes()}`,
        seconds: `${date.getSeconds()}`,
    };
}

export function dateFromDateParts(date: DateParts): Date {
    return new Date(
        parseInt(date.year, 10),
        parseInt(date.month, 10) - 1,
        parseInt(date.date, 10),
        parseInt(date.hours, 10),
        parseInt(date.minutes, 10),
        parseInt(date.seconds, 10)
    );
}

type DatePartFormatters = { [key in keyof DateParts]: (v?: string) => string };

export const datePartFormatters: DatePartFormatters = {
    year: ensureNumberLength(4),
    month: ensureNumberLength(2),
    date: ensureNumberLength(2),
    hours: ensureNumberLength(2),
    minutes: ensureNumberLength(2),
    seconds: ensureNumberLength(2),
};

export const getFormattedDateString = (date: Date): string => {
    const parts = datePartsFromDate(date);

    if (!parts) {
        return '';
    }

    const p: DateParts = (Object.keys(parts) as Array<keyof DateParts>).reduce<DateParts>(
        (acc, k) => ({
            ...acc,
            [k]: datePartFormatters[k](parts[k]),
        }),
        {} as DateParts
    );

    const { year, month, date: d, hours, minutes, seconds } = p;

    return `${year}-${month}-${d} at ${hours}:${minutes}:${seconds}`;
};

/** Calculates the epoch index from a given date */
export function getEpochIndexAt(epochAtDate: Date, epochDurationMillis: bigint, genesisTime: Date) {
    const genesis = genesisTime.getTime();
    const now = epochAtDate.getTime();
    const millisSinceGenesis = now - genesis;
    return Math.floor(millisSinceGenesis / Number(epochDurationMillis));
}

/** Calculates the start date of an epoch index */
export function epochDate(epochIndex: number, epochDurationMillis: bigint, genesisTime: Date): Date {
    return new Date(genesisTime.getTime() + epochIndex * Number(epochDurationMillis));
}

/** Predicates whether a date is in the future based on the current time,
 * sampled at time of call */
export function isFutureDate(date: Date) {
    const now = new Date();
    return now < date;
}

/** Subtract a number of hours from a date */
export function subtractHours(hours: number, date: Date) {
    const before = new Date(date);
    before.setHours(before.getHours() - hours);
    return before;
}

/**
 * Given a unix timeStamp, return the date and time in a displayable format.
 * Assumes the timestamp is in seconds, otherwise the unit should be specified.
 */
export function parseTime(timeStamp: string | bigint, unit?: TimeStampUnit) {
    return getFormattedDateString(dateFromTimestamp(timeStamp, unit));
}

const stripTime = (date: Date) => {
    const clone = new Date(date.valueOf());
    clone.setHours(0, 0, 0, 0);

    return clone;
};

export const isDateEqual = (left: Date | undefined, right: Date | undefined) => {
    if (left === undefined && right === undefined) {
        return true;
    }
    if (left === undefined || right === undefined) {
        return false;
    }

    return stripTime(left).getTime() === stripTime(right).getTime();
};

/**
 * Gets time of the payday after a given time.
 *
 * @param time the time for which the succeeding payday is returned
 * @param nextPayday the next payday in relation to current time
 * @param rewardPeriodLengthMS the length of a payday in milliseconds
 */
export const getSucceedingPayday = (time: Date, nextPayday: Date, rewardPeriodLengthMS: bigint): Date => {
    const timeMS = time.getTime();
    const npdMS = nextPayday.getTime();
    const rplMS = Number(rewardPeriodLengthMS);

    if (timeMS < npdMS) {
        return nextPayday;
    }

    const periods = Math.ceil((timeMS - npdMS) / rplMS);
    return new Date(npdMS + periods * rplMS);
};

function dateFromPendingChangeEffectiveTime(
    effectiveTime: Date,
    cs: ConsensusStatus | undefined,
    rs: RewardStatus | undefined,
    cp: ChainParameters | undefined
): Date | undefined {
    if (cs === undefined || rs === undefined || cp === undefined) {
        return undefined;
    }

    if (rs.version === 0 || cp.version === 0) {
        throw new Error(
            'Not possible to calculate date due to mismatch between reward status, chain parameters, and pending change versions.'
        );
    }

    const rewardPeriodLengthMS = Duration.toMillis(cs.epochDuration) * cp.rewardPeriodLength;

    return getSucceedingPayday(effectiveTime, rs.nextPaydayTime, rewardPeriodLengthMS);
}

export function dateFromBakerPoolPendingChange(
    bakerPoolPendingChange: BakerPoolPendingChangeReduceBakerCapital | BakerPoolPendingChangeRemovePool,
    cs: ConsensusStatus | undefined,
    rs: RewardStatus | undefined,
    cp: ChainParameters | undefined
): Date | undefined {
    return dateFromPendingChangeEffectiveTime(bakerPoolPendingChange.effectiveTime, cs, rs, cp);
}

export function dateFromStakePendingChange(
    spc: StakePendingChange,
    cs: ConsensusStatus,
    rs: RewardStatus,
    cp: ChainParameters
): Date;
export function dateFromStakePendingChange(
    spc: StakePendingChange,
    cs: ConsensusStatus | undefined,
    rs: RewardStatus | undefined,
    cp: ChainParameters | undefined
): Date | undefined;
export function dateFromStakePendingChange(
    spc: StakePendingChange,
    cs: ConsensusStatus | undefined,
    rs: RewardStatus | undefined,
    cp: ChainParameters | undefined
): Date | undefined {
    if (cs === undefined) {
        return undefined;
    }

    return dateFromPendingChangeEffectiveTime(spc.effectiveTime, cs, rs, cp);
}
