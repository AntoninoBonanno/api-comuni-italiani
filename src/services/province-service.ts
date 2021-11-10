import prisma from "../helpers/prisma";
import {Prisma, Province} from "@prisma/client";
import {NotFoundException} from "../exceptions/http-exceptions";
import {IProvinceUpsert} from "../interfaces/prisma-upserts";

export default class ProvinceService {

    /**
     * The fields to include in json response
     */
    private static includeRelationsCount = {
        _count: {select: {cities: true}}
    }

    /**
     * Return the list of Provinces
     * (currentPage = undefined && pageSize = undefined --> not paginated list)
     * @param currentPage the current page to show
     * @param pageSize the page size (The number of elements)
     * @param where query conditions
     */
    static async list(currentPage: number = 0, pageSize: number = 10, where?: Prisma.ProvinceWhereInput): Promise<Province[]> {
        return prisma.province.findMany({
            skip: pageSize * currentPage,
            take: pageSize,
            where: {
                deletedAt: null,
                ...where
            },
            include: ProvinceService.includeRelationsCount
        });
    }

    /**
     * Return the number of elements stored
     * @param where query conditions
     */
    static async count(where?: Prisma.ProvinceWhereInput): Promise<number> {
        return prisma.province.count({
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
    static async find(id: number, where?: Prisma.ProvinceWhereInput): Promise<Province> {
        const province = await prisma.province.findFirst({
            where: {id, deletedAt: null, ...where},
            include: ProvinceService.includeRelationsCount
        });

        if (!province) {
            throw new NotFoundException(id.toString());
        }

        return province;
    }

    /**
     * Create or update element
     */
    static async upsert(data: IProvinceUpsert): Promise<Province> {
        const {regionId, ...province} = data;
        const upsert = {
            ...province,
            deletedAt: null,
            region: {
                connect: {
                    id: regionId
                }
            }
        };
        return prisma.province.upsert({
            where: {
                code_name: {code: data.code, name: data.name}
            },
            update: upsert,
            create: upsert
        });
    }

    /**
     * Delete the Provinces which have no id in the array
     * @param ids the id of the provinces NOT to be deleted
     */
    static async deleteNotIn(ids: Array<number>): Promise<number> {
        const {count} = await prisma.province.deleteMany({
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

