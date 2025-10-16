import { PrismaClient } from "@prisma/client";

type GlobalPrisma = typeof globalThis & {
  __courseBoxdPrisma?: PrismaClient;
};

const globalForPrisma = globalThis as GlobalPrisma;

export const prisma =
  globalForPrisma.__courseBoxdPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__courseBoxdPrisma = prisma;
}
