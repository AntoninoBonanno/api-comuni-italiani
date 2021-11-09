import {Request, Response} from "express";
import {matchedData} from "express-validator";
import {Province} from "@prisma/client";
import IPaginatedList from "../interfaces/paginated-list";
import ProvinceService from "../services/province-service";

export default class ProvinceController {

    /**
     * Return the list of Provinces
     * @param req the validated request
     * @param res the response as a PaginatedList<Province>
     */
    static async list(req: Request, res: Response): Promise<void> {
        const queryData = matchedData(req, {locations: ['query']}); // Get only validated params
        const pageSize = Number(queryData.pageSize),
            currentPage = Number(queryData.currentPage);

        const paginatedList: IPaginatedList<Province> = {
            pageSize, currentPage,
            totalPages: Math.ceil(await ProvinceService.count() / pageSize),
            contentList: await ProvinceService.list(currentPage, pageSize)
        };

        res.send(paginatedList);
    }

    /**
     * Find a Province resource by id
     * @param req the validated onlyIdParam request
     * @param res the response as a Province
     */
    static async findById(req: Request, res: Response): Promise<void> {
        const {id} = req.params;
        res.send(await ProvinceService.find(Number(id)));
    }
}
