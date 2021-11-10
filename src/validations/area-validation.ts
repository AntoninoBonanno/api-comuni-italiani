import validationMiddleware from "../middlewares/validation-middleware";
import {IListValidation} from "../interfaces/crud-validation";
import {codeNamePaginatedListChain} from "./shared/general-validation";

/** VALIDATIONS **/

const AreaValidation: IListValidation = {
    list: validationMiddleware(codeNamePaginatedListChain)
};
export default AreaValidation;
