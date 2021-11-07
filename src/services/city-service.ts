import prisma from "../helpers/prisma";
import {City, Prisma} from "@prisma/client";
import {NotFoundException} from "../exceptions/http-exceptions";

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
            where,
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    /**
     * Return the number of elements stored
     * @param where query conditions
     */
    static async count(where?: Prisma.CityWhereInput): Promise<number> {
        return prisma.city.count({where});
    }

    /**
     * Return the specific element
     * @param id id of element
     * @param where query conditions
     */
    static async find(id: number, where?: Prisma.CityWhereInput): Promise<City> {
        const city = await prisma.city.findFirst({
            where: {id, ...where},
            include: this.includeRelations
        });

        if (!city) {
            throw new NotFoundException(id.toString());
        }

        return city;
    }

    /**
     * Check if specific City exist
     * @param id id of element
     */
    static async exist(id: number): Promise<boolean> {
        return this.find(id).then(_ => true).catch(_ => false);
    }

    /**
     * Create a new City
     * @param input the City data
     */
    static async create(input: any): Promise<City> {
        const data: Prisma.CityCreateInput = Prisma.validator<Prisma.CityCreateInput>()(input);
        return prisma.city.create({
            data,
            include: this.includeRelations
        });
    }

    /**
     * Update an City
     * @param id id of element
     * @param data the City data
     */
    static async update(id: number, data: Prisma.CityUpdateInput): Promise<City> {
        return prisma.city.update({
            where: {id},
            data,
            include: this.includeRelations
        });
    }

    /**
     * Soft delete an City
     * @param id id of element
     */
    static async delete(id: number): Promise<City> {
        return prisma.city.delete({where: {id}});
    }
}

