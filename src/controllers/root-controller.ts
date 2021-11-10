import {Request, Response} from "express";
import environment from "../environment";
import IstatScraper from "../helpers/istat-scraper";
import IInfoMessage from "../interfaces/info-message";
import AreaService from "../services/area-service";
import RegionService from "../services/region-service";
import ProvinceService from "../services/province-service";
import CityService from "../services/city-service";

export default class RootController {

    /**
     * Get database info and check if the ISTAT archive has updates
     * @param req the request
     * @param res the response as a IInfoMessage
     */
    static async info(req: Request, res: Response): Promise<void> {
        const message: IInfoMessage = {
            message: `${environment.appName} is alive!`,
            ...(await IstatScraper.checkUpToDate()),
            _count: {
                areas: await AreaService.count(),
                regions: await RegionService.count(),
                provinces: await ProvinceService.count(),
                cities: await CityService.count()
            }
        }

        res.send(message);
    }
}
