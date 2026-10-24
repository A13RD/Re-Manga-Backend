"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const connectionString = process.env.DATABASE_URL;
const prismaClientSingleton = () => {
    const pool = new pg_1.Pool({ connectionString });
    const adapter = new adapter_pg_1.PrismaPg(pool);
    return new client_1.PrismaClient({ adapter });
};
exports.prisma = global.prisma || prismaClientSingleton();
if (process.env.NODE_ENV !== 'production') {
    global.prisma = exports.prisma;
}
//# sourceMappingURL=prismaClient.js.map