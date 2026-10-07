import { notFound } from 'next/navigation';
import { getProduct, listProducts } from '@/server/catalog/service';
import { catalogQuerySchema } from '@/server/catalog/domain';
import { ProductDetails } from '@/components/ProductDetails';
import { ProductCard } from '@/components/ProductCard';

export const dynamic = 'force-dynamic';

export default async function Product({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!/^[a-z0-9-]{1,191}$/.test(slug)) notFound();
  const product = await getProduct(slug);
  if (!product) notFound();
  const related = await listProducts(catalogQuerySchema.parse({ pageSize: '4' }));
  return <main className="product"><div className="gallery">
    {product.images.length ? product.images.map(image =>
      <img key={image.position} src={image.url} alt={image.alt} />)
      : <div className="image-placeholder">PRODUCT PHOTO PENDING</div>}
  </div><ProductDetails key={product.id} product={product} />
    <section className="related"><h2>YOU MAY ALSO LIKE</h2><div className="grid">
      {related.products.filter(item => item.slug !== slug).slice(0, 3).map(item =>
        <ProductCard key={item.slug} product={item} />)}
    </div></section></main>;
}
