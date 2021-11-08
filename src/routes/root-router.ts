import express, {Request} from 'express';
import {NotFoundException} from "../exceptions/http-exceptions";
import cityRouter from "./api/city-router";
import istatScanRouter from "./api/istat_scan-router";
import {wrap} from "async-middleware";
import IstatScanController from "../controllers/istat_scan-controller";

/** API Routes **/
const apiRouter = express.Router();
apiRouter.use('/cities', cityRouter);
apiRouter.use('/istat-scans', istatScanRouter);

/** BASE Routes **/
const rootRouter = express.Router();
rootRouter.get('/', wrap(IstatScanController.checkUpdate));
rootRouter.use('/api', apiRouter);

rootRouter.get('*', (req: Request) => {
    throw new NotFoundException(`Cannot ${req.method} ${req.path}`, false);
});

export default rootRouter;
