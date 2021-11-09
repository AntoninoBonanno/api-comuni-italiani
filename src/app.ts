import cors from "cors";
import Helmet from "helmet";
import Logger from "./helpers/logger";
import environment from "./environment";
import express, {Application} from 'express';
import rootRouter from "./routes/root-router";
import errorMiddleware from "./middlewares/error-middleware";
import morganMiddleware from "./middlewares/morgan-middleware";
import IstatScraper from "./helpers/istat-scraper";

const app: Application = express();

/** Security and config **/
app.use(Helmet()); // Add security configuring HTTP headers appropriately
app.use(cors()); // Enable cors
app.use(express.json()); // Json parser

/** Middlewares **/
app.use(morganMiddleware); // Print http logs in development mode

/** Routes **/
app.use('/', rootRouter);

/** Handlers **/
app.use(errorMiddleware); // Error handler
process.on('unhandledRejection', (error: Error) => { // Unhandled error handler
    Logger.error(`[unhandledRejection] ${error.stack}`);
});

/** Listen on provided port, on all network interfaces. **/
app.listen(environment.port, async (): Promise<void> => {
    Logger.info(`⚡ ${environment.appName} Server Running here -> http://localhost:${environment.port}`);
    IstatScraper.initCronJob();
});
