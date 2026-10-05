import { z } from 'zod';
import { products } from '../../lib/catalog';

const integer = (min: number, max: number) => z.string().regex(/^\d+$/)
  .transform(Number).pipe(z.number().int().min(min).max(max));

export const catalogQuerySchema = z.object({
  q: z.string().trim().max(100).default(''),
  category: z.string().trim().max(100).optional(),
  size: z.string().trim().max(32).optional(),
  color: z.string().trim().max(32).optional(),
  minPricePaise: integer(0, 100000000).optional(),
  maxPricePaise: integer(0, 100000000).optional(),
  inStock: z.enum(['true', 'false']).transform(value => value === 'true').optional(),
  sort: z.enum(['newest', 'price-asc', 'price-desc', 'name']).default('newest'),
  page: integer(1, 10000).default('1'),
  pageSize: integer(1, 48).default('12'),
}).strict().refine(query => query.minPricePaise === undefined || query.maxPricePaise === undefined
  || query.minPricePaise <= query.maxPricePaise, { message: 'Minimum price exceeds maximum price' });

export type CatalogQuery = z.infer<typeof catalogQuerySchema>;
export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  pricePaise: number;
  oldPricePaise: number | null;
  currency: 'INR';
  isNew: boolean;
  categories: string[];
  images: { url: string; alt: string; position: number }[];
  variants: { id: string; sku: string; size: string; color: string; stock: number }[];
};

export function categorySlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

export const demoCatalog: CatalogProduct[] = products.map((product, productIndex) => ({
  id: `demo-${product.slug}`,
  slug: product.slug,
  name: product.name,
  description: product.description,
  pricePaise: product.price * 100,
  oldPricePaise: product.oldPrice === undefined ? null : product.oldPrice * 100,
  currency: 'INR',
  isNew: true,
  categories: [categorySlug(product.category), 'new-drop'],
  images: [{ url: product.image, alt: `${product.name} — demo front placeholder`, position: 0 }],
  variants: product.colors.flatMap((color, colorIndex) => product.sizes.map((size, sizeIndex) => ({
    id: `demo-${product.slug}-${colorIndex}-${size}`,
    sku: `OS-DEMO-${String(productIndex + 1).padStart(3, '0')}-${colorIndex}-${size}`,
    size,
    color,
    // Each variant has independent demo inventory; these are not launch quantities.
    stock: sizeIndex === product.sizes.length - 1 ? 0 : product.stock,
  }))),
}));

export function filterCatalog(catalog: CatalogProduct[], query: CatalogQuery) {
  const filtered = catalog.filter(product => {
    const matchingVariants = product.variants.filter(variant =>
      (!query.size || variant.size === query.size)
      && (!query.color || variant.color === query.color));
    const available = matchingVariants.some(variant => variant.stock > 0);
    const matchesVariant = matchingVariants.length > 0
      && (query.inStock === undefined || available === query.inStock);
    return (!query.q || `${product.name} ${product.description}`.toLowerCase().includes(query.q.toLowerCase()))
      && (!query.category || product.categories.includes(query.category))
      && (query.minPricePaise === undefined || product.pricePaise >= query.minPricePaise)
      && (query.maxPricePaise === undefined || product.pricePaise <= query.maxPricePaise)
      && matchesVariant;
  });
  // Source order is newest-first. Stable sorting preserves it for equal prices.
  if (query.sort === 'price-asc') filtered.sort((a, b) => a.pricePaise - b.pricePaise);
  if (query.sort === 'price-desc') filtered.sort((a, b) => b.pricePaise - a.pricePaise);
  if (query.sort === 'name') filtered.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
  const offset = (query.page - 1) * query.pageSize;
  return { products: filtered.slice(offset, offset + query.pageSize), total: filtered.length,
    page: query.page, pageSize: query.pageSize };
}
