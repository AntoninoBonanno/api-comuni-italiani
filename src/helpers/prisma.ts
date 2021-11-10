import {Prisma, PrismaClient} from "@prisma/client";
import environment from "../environment";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices

declare global {
    var prisma: PrismaClient | undefined
}

const prisma: PrismaClient = global.prisma || new PrismaClient();
prisma.$use(async (params, next) => {
    //Soft delete, on delete action change to update and put current date on deletedAt
    if (params.action == 'delete') {
        params.action = 'update'
        params.args['data'] = {deletedAt: new Date()}
    } else if (params.action == 'deleteMany') {
        params.action = 'updateMany'
        if (params.args.data != undefined) {
            params.args.data['deletedAt'] = new Date()
        } else {
            params.args['data'] = {deletedAt: new Date()}
        }
    }

    return next(params);
});

if (!environment.isProduction()) global.prisma = prisma;
export default prisma;

/**
 * Create the shared Where object from the query data
 * @param queryData the validated query data
 */
export function getWhereByCodeNameChain(queryData: any): Prisma.AreaWhereInput {
    return {
        name: queryData.name ? {
            contains: queryData.name
        } : undefined,
        code: queryData.code ? {
            contains: queryData.code
        } : undefined
    }
}