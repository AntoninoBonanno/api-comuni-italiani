import express from "express";
import {wrap} from "async-middleware";
import GeneralValidation from "../../validations/shared/general-validation";
import AreaController from "../../controllers/area-controller";
import AreaValidation from "../../validations/area-validation";

const areaRouter = express.Router();

areaRouter.get(
    '/',
    AreaValidation.list,
    wrap(AreaController.list)
);

areaRouter.get(
    '/:id',
    GeneralValidation.onlyIdParam,
    wrap(AreaController.findById)
);

export default areaRouter;
