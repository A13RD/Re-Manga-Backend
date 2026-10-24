import { defineConfig } from "@prisma/config";
import dotenv from "dotenv";
dotenv.config();

// En Prisma 7, la URL de conexión ya no va en schema.prisma sino aquí.
// DATABASE_URL debe estar definida en .env antes de ejecutar comandos de Prisma.
export default defineConfig({
  schema: "src/infrastructure/prisma/schema.prisma",
  datasource: {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    path: "src/infrastructure/prisma/migrations",
  },
});
