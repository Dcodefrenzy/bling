import app from './index';
import { logger } from './logger/logger';


const port = process.env.PORT || 8080;
const env = process.env.NODE_ENV || 'development';


app.listen(port, () => {
  logger.info(`=================================`);
  logger.info(`======= ENV: ${port}=======`);
  logger.info(`🚀 App listening on the port ${env}`);
  logger.info(`=================================`);
});