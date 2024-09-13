export function secondsToDaysRoundedDown(seconds: bigint | undefined): bigint {
    return seconds ? seconds / (60n * 60n * 24n) : 0n;
}

type TimeAndUnit = { time: bigint; unit: string };

function msToTime(ms: bigint | undefined): TimeAndUnit {
    if (!ms) return { time: 0n, unit: 'minute' };
    const minutes = ms / (1000n * 60n);
    const hours = ms / (1000n * 60n * 60n);
    const days = ms / (1000n * 60n * 60n * 24n);
    if (minutes < 60n) return { time: minutes, unit: 'minute' };
    if (hours < 24n) return { time: hours, unit: 'hour' };
    return { time: days, unit: 'day' };
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
