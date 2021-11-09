import {Request, Response} from "express";
import IPaginatedList from "../interfaces/paginated-list";
import {City, Prisma} from "@prisma/client";
import CityService from "../services/city-service";
import {matchedData} from "express-validator";

export default class CityController {

    /**
     * Return the list of Cities
     * @param req the validated request
     * @param res the response as a PaginatedList<City>
     */
    static async list(req: Request, res: Response): Promise<void> {
        const queryData = matchedData(req, {locations: ['query']}); // Get only validated params
        const pageSize = Number(queryData.pageSize),
            currentPage = Number(queryData.currentPage);

        const where: (Prisma.CityWhereInput | undefined) = {
            name: queryData.name ? {
                contains: queryData.name
            } : undefined,
            code: queryData.code ? {
                contains: queryData.code
            } : undefined,
            cadastralCode: queryData.cadastralCode ? {
                contains: queryData.cadastralCode
            } : undefined,
            capital: queryData.capital !== undefined ? queryData.capital === 'true' : undefined,
            province: queryData.province ? {
                OR: [
                    {id: isNaN(Number(queryData.province)) ? undefined : Number(queryData.province)},
                    {name: {contains: queryData.province}},
                    {abbreviation: {contains: queryData.province}}
                ]
            } : undefined
        };

        const paginatedList: IPaginatedList<City> = {
            pageSize, currentPage,
            totalPages: Math.ceil(await CityService.count(where) / pageSize),
            contentList: await CityService.list(currentPage, pageSize, where)
        };

        res.send(paginatedList);
    }

    /**
     * Find a City resource by id
     * @param req the validated onlyIdParam request
     * @param res the response as a City
     */
    static async findById(req: Request, res: Response): Promise<void> {
        const {id} = req.params;
        res.send(await CityService.find(Number(id)));
    }
}
