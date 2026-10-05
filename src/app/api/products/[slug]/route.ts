import { getProduct } from '@/server/catalog/service';
import { apiError, unavailable } from '@/server/http';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!/^[a-z0-9-]{1,191}$/.test(slug)) return apiError(400, 'INVALID_SLUG', 'Invalid product slug.');
  try {
    const product = await getProduct(slug);
    if (!product) return apiError(404, 'PRODUCT_NOT_FOUND', 'Product not found.');
    return Response.json({ product }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return unavailable();
  }
}
