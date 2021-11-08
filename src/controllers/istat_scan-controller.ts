import {Request, Response} from "express";
import environment from "../environment";
import IstatScanService from "../services/istat_scan-service";
import {matchedData} from "express-validator";
import {IstatScan} from "@prisma/client";
import IPaginatedList from "../interfaces/paginated-list";
import IstatScraper from "../helpers/istat-scraper";
import IAliveMessage from "../interfaces/alive-message";

export default class IstatScanController {

    /**
     * Check if the ISTAT archive has updates
     * @param req the request
     * @param res the response as a ICheckUpdateMessage
     */
    static async checkUpdate(req: Request, res: Response): Promise<void> {
        const message: IAliveMessage = {
            message: `${environment.appName} is alive!`,
            availableScanDate: await IstatScraper.getAvailableScanDate(),
            currentScanDate: 'none',
            updateAvailable: true
        }

        const lastScan = await IstatScanService.getLast().catch(_ => undefined);
        if (lastScan) {
            message.currentScanDate = lastScan.publishDate;
            message.updateAvailable = message.availableScanDate !== lastScan.publishDate;
        }

        IstatScraper.startScan().then();
        res.send(message);
    }

    /**
     * Return the list of IstatScans
     * @param req the validated request
     * @param res the response as a PaginatedList<IstatScan>
     */
    static async list(req: Request, res: Response): Promise<void> {
        const queryData = matchedData(req, {locations: ['query']}); // Get only validated params
        const pageSize = Number(queryData.pageSize),
            currentPage = Number(queryData.currentPage);

        const paginatedList: IPaginatedList<IstatScan> = {
            pageSize, currentPage,
            totalPages: await IstatScanService.count(),
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