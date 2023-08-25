import { storedLog } from '@shared/storage/access';
import { addToListMaxSize } from '@shared/storage/update';
import { LOG_MAX_ENTRIES } from '@shared/constants/logging';
import { isDevelopmentBuild } from './environment-helpers';

const loggingLock = 'concordium_log_lock';

export enum LoggingLevel {
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
}

export interface Log {
    timestamp: number;
    level: LoggingLevel;
    message: string;
}

function isError(error: unknown): error is { message: string } {
    return typeof error === 'object' && error !== null && 'message' in error;
}

function logForDevelopmentBuild(logEntry: Log) {
    const logMessage = `[${new Date(logEntry.timestamp).toISOString()}] ${logEntry.level} ${logEntry.message}`;
    switch (logEntry.level) {
        case LoggingLevel.WARN:
            // eslint-disable-next-line no-console
            console.warn(logMessage);
            break;
        case LoggingLevel.ERROR:
            // eslint-disable-next-line no-console
            console.error(logMessage);
            break;
        case LoggingLevel.INFO:
        default:
            // eslint-disable-next-line no-console
            console.log(logMessage);
            break;
    }
}

async function log(message: string, level: LoggingLevel) {
    const timestamp = Date.now();
    const logEntry: Log = {
        level,
        message,
        timestamp,
    };

    if (isDevelopmentBuild()) {
        logForDevelopmentBuild(logEntry);
    }

    await addToListMaxSize(loggingLock, logEntry, storedLog, LOG_MAX_ENTRIES);
}

export async function logErrorMessage(message: string) {
    log(message, LoggingLevel.ERROR);
}

export async function logError(error: unknown) {
    if (isError(error)) {
        logErrorMessage(error.message);
    } else {
        logErrorMessage(String(error));
    }
}
