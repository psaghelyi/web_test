import winston from 'winston';

const logger = winston.createLogger({
  format: winston.format.json(),
  transports: []
});
if (process.env.NODE_E !== 'prod') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.splat(), winston.format.simple())
    })
  );
}

export const expressWinstonLogger = () => {
  return (req, res, next) => {
    logger.info(`HTTP ${req.method} ${req.url}`);
    next();
  };
};

export default logger;
