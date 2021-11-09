import {Request, Response} from "express";
import environment from "../environment";
import IstatScraper from "../helpers/istat-scraper";
import IInfoMessage from "../interfaces/info-message";

export default class RootController {

    /**
     * Get database info and check if the ISTAT archive has updates
     * @param req the request
     * @param res the response as a IInfoMessage
     */
    static async info(req: Request, res: Response): Promise<void> {
        const message: IInfoMessage = {
            message: `${environment.appName} is alive!`,
            ...(await IstatScraper.checkUpToDate())
        }

        res.send(message);
    }
}
