import prisma from "../helpers/prisma";
import {Area, Prisma} from "@prisma/client";
import {NotFoundException} from "../exceptions/http-exceptions";
import {IAreaUpsert} from "../interfaces/prisma-upserts";

export default class AreaService {

    /**
     * Return the list of Areas
     * (currentPage = undefined && pageSize = undefined --> not paginated list)
     * @param currentPage the current page to show
     * @param pageSize the page size (The number of elements)
     * @param where query conditions
     */
    static async list(currentPage: number = 0, pageSize: number = 10, where?: Prisma.AreaWhereInput): Promise<Area[]> {
        return prisma.area.findMany({
            skip: pageSize * currentPage,
            take: pageSize,
            where: {
                deletedAt: null,
                ...where
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    /**
     * Return the number of elements stored
     * @param where query conditions
     */
    static async count(where?: Prisma.AreaWhereInput): Promise<number> {
        return prisma.area.count({
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
    static async find(id: number, where?: Prisma.AreaWhereInput): Promise<Area> {
        const area = await prisma.area.findFirst({
            where: {id, deletedAt: null, ...where}
        });

        if (!area) {
            throw new NotFoundException(id.toString());
        }

        return area;
    }

    /**
     * Create or update element
     */
    static async upsert(data: IAreaUpsert): Promise<Area> {
        return prisma.area.upsert({
            where: {
                code_name: data
            },
            update: {...data, deletedAt: null},
            create: data
        });
    }

    /**
     * Delete the Areas which have no id in the array
     * @param ids the id of the areas NOT to be deleted
     */
    static async deleteNotIn(ids: Array<number>): Promise<number> {
        const {count} = await prisma.area.deleteMany({
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

