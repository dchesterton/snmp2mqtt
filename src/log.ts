import { DateTime } from "luxon";

enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARNING = 2,
    ERROR = 3,
}

export type LogLevelStrings = keyof typeof LogLevel;
export type Logger = ReturnType<typeof createLogger>;

export const createLogger = (minLevel: LogLevelStrings) => {
    const n = LogLevel[minLevel.toUpperCase() as LogLevelStrings];

    const createLevelFn = (level: LogLevel, min: LogLevel) => (msg: string) => {
        if (level < min) {
            return;
        }

        const timestampStr = DateTime.utc().toFormat("yyyy-LL-dd HH:mm:ss");
        console.log(`${timestampStr} - ${LogLevel[level]}: ${msg}`);
    };

    const debug = createLevelFn(LogLevel.DEBUG, n);
    const info = createLevelFn(LogLevel.INFO, n);
    const warning = createLevelFn(LogLevel.WARNING, n);
    const error = createLevelFn(LogLevel.ERROR, n);

    return { debug, info, warning, error };
};
