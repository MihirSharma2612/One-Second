import type { Prisma } from '@prisma/client';
import { demoCatalog, filterCatalog, type CatalogProduct, type CatalogQuery } from './domain';

export function catalogSource(): 'demo' | 'database' {
  const source = process.env.CATALOG_SOURCE ?? 'demo';
  if (source !== 'demo' && source !== 'database') throw new Error('Invalid CATALOG_SOURCE');
  if (source === 'database' && !process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
  return source;
}

const include = {
  categories: { include: { category: true } },
  images: { orderBy: { position: 'asc' as const } },
  variants: { where: { active: true }, orderBy: { sku: 'asc' as const } },
};
type DatabaseProduct = Prisma.ProductGetPayload<{ include: typeof include }>;

function publicProduct(product: DatabaseProduct): CatalogProduct {
  return {
    id: product.id, slug: product.slug, name: product.name, description: product.description,
    pricePaise: product.pricePaise, oldPricePaise: product.oldPricePaise, currency: 'INR',
    isNew: product.isNew, categories: product.categories.map(link => link.category.slug),
    images: product.images.map(({ url, alt, position }) => ({ url, alt, position })),
    variants: product.variants.map(({ id, sku, size, color, stock }) => ({ id, sku, size, color, stock })),
  };
}

export async function listProducts(query: CatalogQuery) {
  if (catalogSource() === 'demo') return { ...filterCatalog(demoCatalog, query), source: 'demo' as const };
  const { db } = await import('../db');
  const variant: Prisma.VariantWhereInput = { active: true,
    ...(query.size ? { size: query.size } : {}), ...(query.color ? { color: query.color } : {}),
  };
  const where: Prisma.ProductWhereInput = {
    active: true, deletedAt: null,
    variants: query.inStock === false ? { some: variant, none: { ...variant, stock: { gt: 0 } } }
      : { some: { ...variant, ...(query.inStock === true ? { stock: { gt: 0 } } : {}) } },
    ...(query.q ? { OR: [{ name: { contains: query.q } }, { description: { contains: query.q } }] } : {}),
    ...(query.category ? { categories: { some: { category: { slug: query.category } } } } : {}),
    pricePaise: { gte: query.minPricePaise, lte: query.maxPricePaise },
  };
  const orderBy: Prisma.ProductOrderByWithRelationInput[] = query.sort === 'price-asc'
    ? [{ pricePaise: 'asc' }, { slug: 'asc' }] : query.sort === 'price-desc'
      ? [{ pricePaise: 'desc' }, { slug: 'asc' }] : query.sort === 'name'
        ? [{ name: 'asc' }, { slug: 'asc' }] : [{ createdAt: 'desc' }, { slug: 'asc' }];
  const [total, products] = await db.$transaction([
    db.product.count({ where }),
    db.product.findMany({ where, include, orderBy, skip: (query.page - 1) * query.pageSize, take: query.pageSize }),
  ]);
  return { products: products.map(publicProduct), total, page: query.page, pageSize: query.pageSize, source: 'database' as const };
}

export async function getProduct(slug: string) {
  if (catalogSource() === 'demo') return demoCatalog.find(product => product.slug === slug) ?? null;
  const { db } = await import('../db');
  const product = await db.product.findFirst({ where: { slug, active: true, deletedAt: null }, include });
  return product ? publicProduct(product) : null;
}
