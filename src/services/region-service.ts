import prisma from "../helpers/prisma";
import {Prisma, Region} from "@prisma/client";
import {NotFoundException} from "../exceptions/http-exceptions";
import {IRegionUpsert} from "../interfaces/prisma-upserts";

export default class RegionService {

    /**
     * The fields to include in json response
     */
    private static includeRelationsCount = {
        _count: {select: {provinces: true}}
    }

    /**
     * Return the list of Regions
     * (currentPage = undefined && pageSize = undefined --> not paginated list)
     * @param currentPage the current page to show
     * @param pageSize the page size (The number of elements)
     * @param where query conditions
     */
    static async list(currentPage: number = 0, pageSize: number = 10, where?: Prisma.RegionWhereInput): Promise<Region[]> {
        return prisma.region.findMany({
            skip: pageSize * currentPage,
            take: pageSize,
            where: {
                deletedAt: null,
                ...where
            },
            include: RegionService.includeRelationsCount
        });
    }

    /**
     * Return the number of elements stored
     * @param where query conditions
     */
    static async count(where?: Prisma.RegionWhereInput): Promise<number> {
        return prisma.region.count({
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
    static async find(id: number, where?: Prisma.RegionWhereInput): Promise<Region> {
        const region = await prisma.region.findFirst({
            where: {id, deletedAt: null, ...where},
            include: RegionService.includeRelationsCount
        });

        if (!region) {
            throw new NotFoundException(id.toString());
        }

        return region;
    }

    /**
     * Create or update element
     */
    static async upsert(data: IRegionUpsert): Promise<Region> {
        const {areaId, ...region} = data;
        const upsert = {
            ...region,
            deletedAt: null,
            area: {
                connect: {
                    id: areaId
                }
            }
        };
        return prisma.region.upsert({
            where: {
                code_name: {code: data.code, name: data.name}
            },
            update: upsert,
            create: upsert
        });
    }

    /**
     * Delete the Regions which have no id in the array
     * @param ids the id of the regions NOT to be deleted
     */
    static async deleteNotIn(ids: Array<number>): Promise<number> {
        const {count} = await prisma.region.deleteMany({
            where: {
                deletedAt: null,
                id: {
                    notIn: ids
                }
            }
        });
        return count;
    }
}

