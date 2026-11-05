import { handleSaveConfig } from "@/services/configs/api";
import { getConfigRepository } from "@/services/configs/store";

export async function POST(request: Request) {
  return handleSaveConfig(request, getConfigRepository);
}
