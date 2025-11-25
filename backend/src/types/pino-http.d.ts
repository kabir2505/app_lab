// src/types/pino-http.d.ts
import 'http';
import pino from 'pino';

declare module 'http' {
  interface IncomingMessage {
    log: pino.Logger;
  }
}
