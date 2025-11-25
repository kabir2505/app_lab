import pino from "pino";

const isDev = process.env.NODE_ENV !== "production";

const logger = pino({
    level: process.env.LOG_LEVE || "info",
    ...(isDev && {
        transport: {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
            }
        }
    })
})

export default logger;