import { PrismaClient } from '@prisma/client';
import { demoCatalog, categorySlug } from '../src/server/catalog/domain';
import { categories } from '../src/lib/catalog';

async function main() {
const url = new URL(process.env.DATABASE_URL ?? '');
if (!['localhost', '127.0.0.1'].includes(url.hostname)
  || !['/one_second_local', '/one_second_test'].includes(url.pathname)) {
  throw new Error('Demo seed is restricted to local one_second_local or one_second_test databases');
}

const db = new PrismaClient();
try {
  for (const name of categories) {
    await db.category.upsert({ where: { slug: categorySlug(name) }, update: {},
      create: { slug: categorySlug(name), name } });
  }
  for (const [index, product] of demoCatalog.entries()) {
    // Repeated seeding does not overwrite merchant changes or replenish inventory.
    const record = await db.product.upsert({ where: { slug: product.slug }, update: {}, create: {
      slug: product.slug, name: product.name, description: product.description,
      pricePaise: product.pricePaise, oldPricePaise: product.oldPricePaise,
      active: true, isNew: true, createdAt: new Date(Date.UTC(2026, 0, 1, 0, 0, demoCatalog.length - index)),
    } });
    for (const variant of product.variants) {
      await db.variant.upsert({ where: { sku: variant.sku }, update: {}, create: {
        productId: record.id, sku: variant.sku, size: variant.size, color: variant.color, stock: variant.stock,
      } });
    }
    for (const image of product.images) {
      await db.productImage.upsert({
        where: { productId_position: { productId: record.id, position: image.position } }, update: {},
        create: { productId: record.id, ...image },
      });
    }
    for (const slug of product.categories) {
      const category = await db.category.findUniqueOrThrow({ where: { slug } });
      await db.productCategory.upsert({
        where: { productId_categoryId: { productId: record.id, categoryId: category.id } }, update: {},
        create: { productId: record.id, categoryId: category.id },
      });
    }
  }
  console.log('Demo catalogue seeded. Existing prices and inventory preserved.');
} finally {
  await db.$disconnect();
}
}

main().catch(() => {
  console.error('Demo seeding failed. Check local database access and migrations.');
  process.exitCode = 1;
});
