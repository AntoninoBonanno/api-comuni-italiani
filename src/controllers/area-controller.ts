import {Request, Response} from "express";
import {matchedData} from "express-validator";
import {Area} from "@prisma/client";
import IPaginatedList from "../interfaces/paginated-list";
import AreaService from "../services/area-service";
import {getWhereByCodeNameChain} from "../helpers/prisma";

export default class AreaController {

    /**
     * Return the list of Areas
     * @param req the validated request
     * @param res the response as a PaginatedList<Area>
     */
    static async list(req: Request, res: Response): Promise<void> {
        const queryData = matchedData(req, {locations: ['query']}); // Get only validated params
        const pageSize = Number(queryData.pageSize),
            currentPage = Number(queryData.currentPage);

        const where = getWhereByCodeNameChain(queryData),
            totalItems = await AreaService.count(where);

        const paginatedList: IPaginatedList<Area> = {
            pageSize, currentPage,
            totalPages: Math.ceil(totalItems / pageSize),
            totalItems,
            contentList: await AreaService.list(currentPage, pageSize, where)
        };

        res.send(paginatedList);
    }

    /**
     * Find a Area resource by id
     * @param req the validated onlyIdParam request
     * @param res the response as a Area
     */
    static async findById(req: Request, res: Response): Promise<void> {
        const {id} = req.params;
        res.send(await AreaService.find(Number(id)));
    }
}
