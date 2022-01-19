import express from "express";
import {wrap} from "async-middleware";
import GeneralValidation from "../../validations/shared/general-validation";
import CityController from "../../controllers/city-controller";
import CityValidation from "../../validations/city-validation";

const cityRouter = express.Router();

cityRouter.get(
    '/',
    CityValidation.list,
    wrap(CityController.list)
);

cityRouter.get(
    '/:id',
    GeneralValidation.onlyIdParam,
    wrap(CityController.findById)
);

export default cityRouter;
