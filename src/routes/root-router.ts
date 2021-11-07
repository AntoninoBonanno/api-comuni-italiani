import express, {Request, Response} from 'express';
import {NotFoundException} from "../exceptions/http-exceptions";
import IStatusMessage from "../interfaces/status-message";
import environment from "../environment";
import cityRouter from "./api/city-router";

/** API Routes **/
const apiRouter = express.Router();
apiRouter.use('/cities', cityRouter);

/** BASE Routes **/
const rootRouter = express.Router();
rootRouter.get('/', (req: Request, res: Response): void => {
    res.send({status: 200, message: `${environment.appName} is alive!`} as IStatusMessage);
});

rootRouter.use('/api', apiRouter);

rootRouter.get('*', (req: Request) => {
    throw new NotFoundException(`Cannot ${req.method} ${req.path}`, false);
});

export default rootRouter;
