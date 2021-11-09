import prisma from "../helpers/prisma";
import {City, Prisma} from "@prisma/client";
import {NotFoundException} from "../exceptions/http-exceptions";
import {ICityUpsert} from "../interfaces/prisma-upserts";

export default class CityService {

    /**
     * The fields to include in json response
     */
    private static includeRelations = {
        province: {
            include: {
                region: {
                    include: {
                        area: true
                    }
                }
            }
        }
    }

    /**
     * Return the list of Cities
     * (currentPage = undefined && pageSize = undefined --> not paginated list)
     * @param currentPage the current page to show
     * @param pageSize the page size (The number of elements)
     * @param where query conditions
     */
    static async list(currentPage: number = 0, pageSize: number = 10, where?: Prisma.CityWhereInput): Promise<City[]> {
        return prisma.city.findMany({
            skip: pageSize * currentPage,
            take: pageSize,
            where: {
                deletedAt: null,
                ...where
            },
            orderBy: {
                name: 'asc'
            }
        });
    }

    /**
     * Return the number of elements stored
     * @param where query conditions
     */
    static async count(where?: Prisma.CityWhereInput): Promise<number> {
        return prisma.city.count({
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
    static async find(id: number, where?: Prisma.CityWhereInput): Promise<City> {
        const city = await prisma.city.findFirst({
            where: {id, deletedAt: null, ...where},
            include: this.includeRelations
        });

        if (!city) {
            throw new NotFoundException(id.toString());
        }

        return city;
    }

    /**
     * Create or update element
     */
    static async upsert(data: ICityUpsert): Promise<City> {
        const {provinceId, ...city} = data;
        const upsert = {
            ...city,
            deletedAt: null,
            province: {
                connect: {
                    id: provinceId
                }
            }
        };
        return prisma.city.upsert({
            where: {
                code_name: {code: data.code, name: data.name}
            },
            update: upsert,
            create: upsert
        });
    }

    /**
     * Delete the Cities which have no id in the array
     * @param ids the id of the cities NOT to be deleted
     */
    static async deleteNotIn(ids: Array<number>): Promise<number> {
        const {count} = await prisma.city.deleteMany({
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

