import { PrismaClient } from "@prisma/client";
import {logger} from "../logger/logger"; 

const logLevels = ['query', 'info', 'warn', 'error'];

const db = new PrismaClient({
  log: logLevels.map(level => ({
    emit: 'event',
    level,
  })) as any,
});

logLevels.map(level => {
  db.$on(level, ev => {
    if ((ev as any).query) {
      logger.log({ level: 'info', message: (ev as any).query });
    } else {
      logger.log({ level, message: ev.message });
    }
  });
});



export default db;

