import {query} from "express-validator";
import validationMiddleware from "../middlewares/validation-middleware";
import {IListValidation} from "../interfaces/crud-validation";
import {codeNamePaginatedListChain} from "./shared/general-validation";

/** VALIDATIONS **/

const CityValidation: IListValidation = {
    list: validationMiddleware([
        ...codeNamePaginatedListChain,
        query('cadastralCode').optional().isString().trim(),
        query('capital').optional().isBoolean(),
        query('province').optional().isString().trim()
    ])
};
export default CityValidation;
