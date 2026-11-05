import { z } from "zod";
import { chair } from "@/data/catalog";
import { priceBreakdown } from "@/lib/configurator/price";
import { SHARE_ID_PATTERN, shareId } from "@/lib/configurator/share-id";
import { coerceConfig, configSchema } from "@/lib/configurator/validation";
import type { ConfigRepository } from "@/services/configs/repository";

const MAX_BODY_BYTES = 2_048;
// Strict at the trust boundary: exactly the catalog's options, nothing else (no client-supplied price).
const saveBody = z.strictObject({ config: configSchema(chair) });

type RepositoryFactory = () => ConfigRepository;

const json = (body: unknown, status: number, headers: Record<string, string> = {}) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });

function repositoryOrNull(getRepository: RepositoryFactory): ConfigRepository | null {
  try {
    return getRepository();
  } catch (error) {
    console.error("[configs] store unavailable:", error instanceof Error ? error.message : error);
    return null;
  }
}

/** POST /api/configs: validate, price on the server, store under a content-hash id. */
export async function handleSaveConfig(request: Request, getRepository: RepositoryFactory): Promise<Response> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return json({ error: "unsupported_media_type" }, 415);
  }
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
    return json({ error: "payload_too_large" }, 413);
  }
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) {
    return json({ error: "payload_too_large" }, 413);
  }

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return json({ error: "invalid_json" }, 400);
  }
  const parsed = saveBody.safeParse(body);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message }));
    return json({ error: "invalid_config", issues }, 400);
  }

  const { config } = parsed.data;
  const id = await shareId(chair, config);
  const totalCentavos = priceBreakdown(chair, config).total;

  const repository = repositoryOrNull(getRepository);
  if (!repository) return json({ error: "store_unavailable" }, 503);
  try {
    await repository.save({ id, productId: chair.id, config, totalCentavos });
  } catch (error) {
    console.error("[configs] save failed:", error instanceof Error ? error.message : error);
    return json({ error: "store_unavailable" }, 503);
  }

  return json({ id, path: `/b/${id}`, totalCentavos }, 201, { Location: `/api/configs/${id}` });
}

/** Load a saved chair build, coerced against the current catalog. Null when missing or malformed id. */
export async function loadSavedChair(id: string, repository: ConfigRepository) {
  if (!SHARE_ID_PATTERN.test(id)) return null;
  const saved = await repository.get(id);
  if (!saved || saved.productId !== chair.id) return null;
  return { ...saved, config: coerceConfig(chair, saved.config) };
}

/** GET /api/configs/[id]. Content-addressed rows never change, so hits are cacheable forever. */
export async function handleGetConfig(id: string, getRepository: RepositoryFactory): Promise<Response> {
  if (!SHARE_ID_PATTERN.test(id)) return json({ error: "not_found" }, 404);
  const repository = repositoryOrNull(getRepository);
  if (!repository) return json({ error: "store_unavailable" }, 503);

  try {
    const saved = await loadSavedChair(id, repository);
    if (!saved) return json({ error: "not_found" }, 404);
    return json(saved, 200, { "Cache-Control": "public, max-age=31536000, immutable" });
  } catch (error) {
    console.error("[configs] get failed:", error instanceof Error ? error.message : error);
    return json({ error: "store_unavailable" }, 503);
  }
}
