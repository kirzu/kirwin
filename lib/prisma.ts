import { PrismaClient } from "@prisma/client";

// Reuse a single PrismaClient instance across hot reloads in development
// to avoid exhausting the connection pool. In production, the global is
// not set so each cold start gets a fresh client.
declare global {
  // eslint-disable-next-line no-var
  var prismaClient: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  global.prismaClient ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prismaClient = prisma;
}

export default prisma;
