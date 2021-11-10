import {query} from "express-validator";
import validationMiddleware from "../middlewares/validation-middleware";
import {IListValidation} from "../interfaces/crud-validation";
import {codeNamePaginatedListChain} from "./shared/general-validation";

/** VALIDATIONS **/

const RegionValidation: IListValidation = {
    list: validationMiddleware([
        ...codeNamePaginatedListChain,
        query('area').optional().isString().trim()
    ])
};
export default RegionValidation;
