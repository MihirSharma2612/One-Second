import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';
import { catalogQuerySchema } from '../src/server/catalog/domain';
import { getProduct, listProducts } from '../src/server/catalog/service';

async function main() {
const url = new URL(process.env.DATABASE_URL ?? '');
assert.ok(['localhost', '127.0.0.1'].includes(url.hostname) && url.pathname === '/one_second_test',
  'Integration checks require an isolated local one_second_test database');
assert.equal(process.env.CATALOG_SOURCE, 'database');
const db = new PrismaClient();
try {
  assert.equal(await db.product.count(), 4, 'Repeated seed must not duplicate products');
  assert.equal(await db.category.count(), 6);
  const query = catalogQuerySchema.parse({ category: 'tees', size: 'M', inStock: 'true', pageSize: '1' });
  const result = await listProducts(query);
  assert.equal(result.source, 'database');
  assert.equal(result.total, 2);
  assert.equal(result.products.length, 1);
  const product = await getProduct('static-noise-tee');
  assert.equal(product?.pricePaise, 149900);
  assert.ok(product?.variants.some(variant => variant.size === 'XL' && variant.stock === 0));
  assert.equal(await getProduct('missing'), null);
  const original = await db.product.findUniqueOrThrow({ where: { slug: 'static-noise-tee' } });
  // Roll back test writes even if an assertion fails.
  const rollback = new Error('ROLLBACK_TEST');
  await assert.rejects(db.$transaction(async transaction => {
    await transaction.product.update({ where: { id: original.id }, data: { active: false } });
    assert.equal(await transaction.product.count({ where: { active: true, slug: original.slug } }), 0);
    throw rollback;
  }), error => error === rollback);
  assert.equal((await db.product.findUniqueOrThrow({ where: { id: original.id } })).active, true);
  console.log('PASS MySQL seed, catalogue filters, variant stock, pagination and transaction rollback');
} finally {
  await db.$disconnect();
  const { db: serviceDatabase } = await import('../src/server/db');
  await serviceDatabase.$disconnect();
}
}

main().catch(error => {
  console.error(error instanceof assert.AssertionError ? error.message : 'Database integration checks failed');
  process.exitCode = 1;
});
