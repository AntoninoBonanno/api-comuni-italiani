import express from "express";
import {wrap} from "async-middleware";
import GeneralValidation from "../../validations/shared/general-validation";
import ProvinceController from "../../controllers/province-controller";
import ProvinceValidation from "../../validations/province-validation";

const provinceRouter = express.Router();

provinceRouter.get(
    '/',
    ProvinceValidation.list,
    wrap(ProvinceController.list)
);

provinceRouter.get(
    '/:id',
    GeneralValidation.onlyIdParam,
    wrap(ProvinceController.findById)
);

export default provinceRouter;
