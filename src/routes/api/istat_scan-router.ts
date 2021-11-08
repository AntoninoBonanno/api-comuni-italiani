import express from "express";
import {wrap} from "async-middleware";
import IstatScanController from "../../controllers/istat_scan-controller";
import GeneralValidation from "../../validations/shared/general-validation";

const istatScanRouter = express.Router();

istatScanRouter.get(
    '/',
    GeneralValidation.paginatedList,
    wrap(IstatScanController.list)
);

istatScanRouter.get(
    '/:id',
    GeneralValidation.onlyIdParam,
    wrap(IstatScanController.findById)
);

export default istatScanRouter;
