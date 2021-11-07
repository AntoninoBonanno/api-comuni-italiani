import {query} from "express-validator";
import validationMiddleware from "../middlewares/validation-middleware";
import {IListValidation} from "../interfaces/crud-validation";

/** VALIDATIONS **/

const CityValidation: IListValidation = {
    list: validationMiddleware([
        query('pageSize').default(10).isNumeric(),
        query('currentPage').default(0).isNumeric(),

        query('name').optional().isString().trim()
    ])
};
export default CityValidation;
