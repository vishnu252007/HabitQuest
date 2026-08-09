import winston from 'winston';
import { env } from './env';

const { combine, timestamp, errors, splat, json, colorize, printf } = winston.format;

const devFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  printf(({ level, message, timestamp: ts, ...meta }) => {
    const extras = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${ts} [${level}]: ${message}${extras}`;
  })
);

const prodFormat = combine(timestamp(), errors({ stack: true }), splat(), json());

const transports: winston.transport[] = [
  new winston.transports.Console(),
];

if (process.env.VERCEL !== '1') {
  transports.push(
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  );
}

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: env.NODE_ENV === 'production' ? prodFormat : devFormat,
  defaultMeta: { service: 'habit-tracker-api' },
  transports,
});
