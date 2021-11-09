import {Request, Response} from "express";
import {matchedData} from "express-validator";
import {Region} from "@prisma/client";
import IPaginatedList from "../interfaces/paginated-list";
import RegionService from "../services/region-service";

export default class RegionController {

    /**
     * Return the list of Regions
     * @param req the validated request
     * @param res the response as a PaginatedList<Region>
     */
    static async list(req: Request, res: Response): Promise<void> {
        const queryData = matchedData(req, {locations: ['query']}); // Get only validated params
        const pageSize = Number(queryData.pageSize),
            currentPage = Number(queryData.currentPage);

        const paginatedList: IPaginatedList<Region> = {
            pageSize, currentPage,
            totalPages: Math.ceil(await RegionService.count() / pageSize),
            contentList: await RegionService.list(currentPage, pageSize)
        };

        res.send(paginatedList);
    }

    /**
     * Find a Region resource by id
     * @param req the validated onlyIdParam request
     * @param res the response as a Region
     */
    static async findById(req: Request, res: Response): Promise<void> {
        const {id} = req.params;
        res.send(await RegionService.find(Number(id)));
    }
}
