export function secondsToDaysRoundedDown(seconds: bigint | undefined): bigint {
    return seconds ? seconds / (60n * 60n * 24n) : 0n;
}

export const withDateAndTime = Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'medium',
    hourCycle: 'h23',
}).format;
