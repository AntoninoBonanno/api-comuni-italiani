import {Request, Response} from "express";
import IstatScanService from "../services/istat_scan-service";
import {matchedData} from "express-validator";
import {IstatScan} from "@prisma/client";
import IPaginatedList from "../interfaces/paginated-list";

export default class IstatScanController {

    /**
     * Return the list of IstatScans
     * @param req the validated request
     * @param res the response as a PaginatedList<IstatScan>
     */
    static async list(req: Request, res: Response): Promise<void> {
        const queryData = matchedData(req, {locations: ['query']}); // Get only validated params
        const pageSize = Number(queryData.pageSize),
            currentPage = Number(queryData.currentPage);

        const totalItems = await IstatScanService.count();
        const paginatedList: IPaginatedList<IstatScan> = {
            pageSize, currentPage,
            totalPages: Math.ceil(totalItems / pageSize),
            totalItems,
            contentList: await IstatScanService.list(currentPage, pageSize)
        };

        res.send(paginatedList);
    }

    /**
     * Find a IstatScan resource by id
     * @param req the validated onlyIdParam request
     * @param res the response as a IstatScan
     */
    static async findById(req: Request, res: Response): Promise<void> {
        const {id} = req.params;
        res.send(await IstatScanService.find(Number(id)));
    }
}
