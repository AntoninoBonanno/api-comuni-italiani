import express from "express";
import {wrap} from "async-middleware";
import GeneralValidation from "../../validations/shared/general-validation";
import RegionController from "../../controllers/region-controller";
import RegionValidation from "../../validations/region-validation";

const regionRouter = express.Router();

regionRouter.get(
    '/',
    RegionValidation.list,
    wrap(RegionController.list)
);

regionRouter.get(
    '/:id',
    GeneralValidation.onlyIdParam,
    wrap(RegionController.findById)
);

export default regionRouter;
