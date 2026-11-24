import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Authorization guard for server actions that mutate admin-managed data.
 *
 * Server actions are public HTTP endpoints: middleware only protects page
 * *rendering*, so every action must verify authorization itself. This
 * throws (fails closed) — nothing is written and the client receives a
 * generic error.
 */
export async function requireAdmin(): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}
