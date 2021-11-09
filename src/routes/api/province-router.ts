import express from "express";
import {wrap} from "async-middleware";
import GeneralValidation from "../../validations/shared/general-validation";
import ProvinceController from "../../controllers/provinces-controller";

const provinceRouter = express.Router();

provinceRouter.get(
    '/',
    GeneralValidation.paginatedList,
    wrap(ProvinceController.list)
);

provinceRouter.get(
    '/:id',
    GeneralValidation.onlyIdParam,
    wrap(ProvinceController.findById)
);

export default provinceRouter;
