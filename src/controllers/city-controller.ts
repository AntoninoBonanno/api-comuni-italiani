import {Request, Response} from "express";
import IPaginatedList from "../interfaces/paginated-list";
import {City, Prisma} from "@prisma/client";
import CityService from "../services/city-service";
import {matchedData} from "express-validator";
import {getWhereByCodeNameChain} from "../helpers/prisma";

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

        const where: Prisma.CityWhereInput = {
            ...getWhereByCodeNameChain(queryData),
            cadastralCode: queryData.cadastralCode ? {
                contains: queryData.cadastralCode
            } : undefined,
            capital: queryData.capital !== undefined ? ['true', '1'].includes(queryData.capital) : undefined,
            province: queryData.province ? {
                OR: [
                    {id: isNaN(Number(queryData.province)) ? undefined : Number(queryData.province)},
                    {name: {contains: queryData.province}},
                    {abbreviation: {contains: queryData.province}}
                ]
            } : undefined
        };

        const totalItems = await CityService.count(where);
        const paginatedList: IPaginatedList<City> = {
            pageSize, currentPage,
            totalPages: Math.ceil(totalItems / pageSize),
            totalItems,
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
