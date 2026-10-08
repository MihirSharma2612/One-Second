import { catalogQuerySchema } from '@/server/catalog/domain';
import { listProducts } from '@/server/catalog/service';
import { apiError, unavailable } from '@/server/http';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  if ([...params.keys()].some(key => params.getAll(key).length > 1)) {
    return apiError(400, 'INVALID_QUERY', 'Repeated query parameters are not supported.');
  }
  const query = catalogQuerySchema.safeParse(Object.fromEntries(params));
  if (!query.success) return apiError(400, 'INVALID_QUERY', 'Invalid catalogue filters or pagination.');
  try {
    return Response.json(await listProducts(query.data), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return unavailable(error);
  }
}
