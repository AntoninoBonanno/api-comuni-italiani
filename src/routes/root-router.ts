import express, {Request} from 'express';
import {NotFoundException} from "../exceptions/http-exceptions";
import cityRouter from "./api/city-router";
import istatScanRouter from "./api/istat_scan-router";
import {wrap} from "async-middleware";
import RootController from "../controllers/root-controller";
import areaRouter from "./api/area-router";
import regionRouter from "./api/region-router";
import provinceRouter from "./api/province-router";

/** API Routes **/
const apiRouter = express.Router();
apiRouter.use('/areas', areaRouter);
apiRouter.use('/regions', regionRouter);
apiRouter.use('/provinces', provinceRouter);
apiRouter.use('/cities', cityRouter);
apiRouter.use('/istat-scans', istatScanRouter);

/** BASE Routes **/
const rootRouter = express.Router();
rootRouter.get('/', wrap(RootController.info));
rootRouter.use('/api', apiRouter);

rootRouter.all('*', (req: Request) => {
    throw new NotFoundException(`Cannot ${req.method} ${req.path}`, false);
});

export default rootRouter;
