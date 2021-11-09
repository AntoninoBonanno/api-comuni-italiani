import prisma from "../helpers/prisma";
import {IstatScan, Prisma} from "@prisma/client";
import {NotFoundException} from "../exceptions/http-exceptions";

export default class IstatScanService {

    /**
     * Return the list of IstatScans
     * (currentPage = undefined && pageSize = undefined --> not paginated list)
     * @param currentPage the current page to show
     * @param pageSize the page size (The number of elements)
     * @param where query conditions
     */
    static async list(currentPage: number = 0, pageSize: number = 10, where?: Prisma.IstatScanWhereInput): Promise<IstatScan[]> {
        return prisma.istatScan.findMany({
            skip: pageSize * currentPage,
            take: pageSize,
            where: {
                deletedAt: null,
                ...where
            },
            orderBy: {
                startAt: 'desc'
            }
        });
    }

    /**
     * Return the number of elements stored
     * @param where query conditions
     */
    static async count(where?: Prisma.IstatScanWhereInput): Promise<number> {
        return prisma.istatScan.count({
            where: {
                deletedAt: null,
                ...where
            }
        });
    }

    /**
     * Return the specific element
     * @param id id of element
     * @param where query conditions
     */
    static async find(id: number, where?: Prisma.IstatScanWhereInput): Promise<IstatScan> {
        const istatScan = await prisma.istatScan.findFirst({
            where: {id, deletedAt: null, ...where},
        });

        if (!istatScan) {
            throw new NotFoundException(id.toString());
        }

        return istatScan;
    }

    /**
     * Create a new IstatScan
     * @param data the IstatScan data
     */
    static async create(data: Prisma.IstatScanCreateInput): Promise<IstatScan> {
        return prisma.istatScan.create({data});
    }

    /**
     * Update an IstatScan
     * @param id id of element
     * @param data the IstatScan data
     */
    static async update(id: number, data: Prisma.IstatScanUpdateInput): Promise<IstatScan> {
        return prisma.istatScan.update({
            where: {id},
            data
        });
    }

    /**
     * Delete an IstatScan
     * @param id id of element
     */
    static async delete(id: number): Promise<IstatScan> {
        return prisma.istatScan.delete({where: {id}});
    }
}

