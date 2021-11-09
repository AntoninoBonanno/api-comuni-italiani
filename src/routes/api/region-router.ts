import express from "express";
import {wrap} from "async-middleware";
import GeneralValidation from "../../validations/shared/general-validation";
import RegionController from "../../controllers/region-controller";

const regionRouter = express.Router();

regionRouter.get(
    '/',
    GeneralValidation.paginatedList,
    wrap(RegionController.list)
);

regionRouter.get(
    '/:id',
    GeneralValidation.onlyIdParam,
    wrap(RegionController.findById)
);

export default regionRouter;
