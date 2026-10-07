import Link from 'next/link';
import { money } from '@/lib/catalog';
import type { CatalogProduct } from '@/server/catalog/domain';

export function ProductCard({ product }: { product: CatalogProduct }) {
  const image = product.images[0];
  const soldOut = !product.variants.some(variant => variant.stock > 0);
  return <article className="card"><Link href={`/product/${product.slug}`}>
    <div className="card-image">
      {image ? <img src={image.url} alt={image.alt} /> : <div className="image-placeholder">FRONT PRODUCT IMAGE / PHOTO PENDING</div>}
      {(soldOut || product.isNew) && <span>{soldOut ? 'SOLD OUT' : 'NEW'}</span>}
    </div><div className="card-copy"><h3>{product.name}</h3><p>{money(product.pricePaise / 100)}</p></div>
  </Link></article>;
}
