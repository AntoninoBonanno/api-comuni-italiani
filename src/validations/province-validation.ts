import {query} from "express-validator";
import validationMiddleware from "../middlewares/validation-middleware";
import {IListValidation} from "../interfaces/crud-validation";
import {codeNamePaginatedListChain} from "./shared/general-validation";

/** VALIDATIONS **/

const ProvinceValidation: IListValidation = {
    list: validationMiddleware([
        ...codeNamePaginatedListChain,
        query('abbreviation').optional().isString().trim(),
        query('region').optional().isString().trim()
    ])
};
export default ProvinceValidation;
