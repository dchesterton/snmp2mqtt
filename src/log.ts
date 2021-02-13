import { DateTime } from "luxon";

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARNING = 2,
  ERROR = 3,
}

export type LogLevelStrings = keyof typeof LogLevel;
export type Logger = (level: LogLevel, msg: string) => void;

export const createLogger = (minLevel: LogLevelStrings): Logger => (
  level: LogLevel,
  msg: string
) => {
  const n = LogLevel[minLevel.toUpperCase() as LogLevelStrings];

  if (level < n) {
    return;
  }

  const timestampStr = DateTime.utc().toFormat("yyyy-LL-dd HH:mm:ss");
  console.log(`${timestampStr} - ${LogLevel[level]}: ${msg}`);
};
