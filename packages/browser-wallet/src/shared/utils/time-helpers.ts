import { MILLISECONDS_PER_DAY, MILLISECONDS_PER_HOUR, MILLISECONDS_PER_MINUTE } from '@popup/constants/time';

export function secondsToDaysRoundedDown(seconds: bigint | undefined): bigint {
    return seconds !== undefined ? seconds / (60n * 60n * 24n) : 0n;
}

type TimeAndUnit = { time: bigint; unit: string };

function msToTime(ms: bigint | undefined): TimeAndUnit {
    if (!ms) return { time: 0n, unit: 'minute' };

    if (ms < MILLISECONDS_PER_HOUR) return { time: ms / MILLISECONDS_PER_MINUTE, unit: 'minute' };
    if (ms < MILLISECONDS_PER_DAY) return { time: ms / MILLISECONDS_PER_HOUR, unit: 'hour' };
    return { time: ms / MILLISECONDS_PER_DAY, unit: 'day' };
}

export function msToTimeRemain(ms: bigint | undefined): TimeAndUnit {
    if (!ms) return { time: 0n, unit: 'minute' };
    return msToTime(ms - BigInt(Date.now()));
}

export const withDateAndTime = Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'medium',
    hourCycle: 'h23',
}).format;
