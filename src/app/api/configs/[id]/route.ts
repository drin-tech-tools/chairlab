import { handleGetConfig } from "@/services/configs/api";
import { getConfigRepository } from "@/services/configs/store";

export async function GET(_request: Request, ctx: RouteContext<"/api/configs/[id]">) {
  const { id } = await ctx.params;
  return handleGetConfig(id, getConfigRepository);
}
