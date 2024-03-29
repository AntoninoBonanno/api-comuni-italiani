import {Request, Response} from "express";
import {matchedData} from "express-validator";
import {Prisma, Province} from "@prisma/client";
import IPaginatedList from "../interfaces/paginated-list";
import ProvinceService from "../services/province-service";
import {getWhereByCodeNameChain} from "../helpers/prisma";

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

        const where: (Prisma.ProvinceWhereInput | undefined) = {
            ...getWhereByCodeNameChain(queryData),
            abbreviation: queryData.abbreviation ? {
                contains: queryData.abbreviation
            } : undefined,
            region: queryData.region ? {
                OR: [
                    {id: isNaN(Number(queryData.region)) ? undefined : Number(queryData.region)},
                    {name: {contains: queryData.region}}
                ]
            } : undefined
        };

        const totalItems = await ProvinceService.count(where);
        const paginatedList: IPaginatedList<Province> = {
            pageSize, currentPage,
            totalPages: Math.ceil(totalItems / pageSize),
            totalItems,
            contentList: await ProvinceService.list(currentPage, pageSize, where)
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
