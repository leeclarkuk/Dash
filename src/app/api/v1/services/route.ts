import { getDb } from "@/db/client";
import { jsonError, resolveAuth } from "@/lib/api/auth";
import { getCatalog, serializeCatalogItem } from "@/lib/catalog/queries";

export async function GET(request: Request) {
  try {
    const db = await getDb();
    const session = await resolveAuth(db, request);
    const catalog = await getCatalog(db, session.organizationId);
    return Response.json({
      services: catalog.map(serializeCatalogItem),
    });
  } catch (error) {
    return jsonError(error);
  }
}
