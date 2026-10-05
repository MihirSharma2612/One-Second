import assert from 'node:assert/strict';
import test from 'node:test';
import { catalogQuerySchema, demoCatalog, filterCatalog } from '../src/server/catalog/domain';

test('catalogue defaults are bounded and money is integer paise', () => {
  const result = filterCatalog(demoCatalog, catalogQuerySchema.parse({}));
  assert.equal(result.page, 1);
  assert.equal(result.pageSize, 12);
  assert.equal(result.total, 4);
  assert.equal(result.products[0].pricePaise, 149900);
  assert.ok(result.products.every(product => Number.isInteger(product.pricePaise)));
});
test('filters combine category, search, price and same-variant inventory', () => {
  const query = catalogQuerySchema.parse({ category: 'tees', q: 'afterglow', size: 'M',
    inStock: 'true', minPricePaise: '100000', maxPricePaise: '160000' });
  assert.deepEqual(filterCatalog(demoCatalog, query).products.map(product => product.slug), ['afterglow-tee']);
  assert.equal(filterCatalog(demoCatalog, catalogQuerySchema.parse({ size: 'XL', inStock: 'true' })).total, 0);
  assert.equal(filterCatalog(demoCatalog, catalogQuerySchema.parse({ inStock: 'false' })).total, 0);
  assert.equal(filterCatalog(demoCatalog, catalogQuerySchema.parse({ size: 'XL', inStock: 'false' })).total, 3);
});
test('price sort and pagination return stable totals', () => {
  const result = filterCatalog(demoCatalog, catalogQuerySchema.parse({ sort: 'price-desc', pageSize: '1', page: '2' }));
  assert.equal(result.total, 4);
  assert.equal(result.products.length, 1);
  assert.equal(result.products[0].slug, 'signal-boxy-tee');
  assert.equal(filterCatalog(demoCatalog, catalogQuerySchema.parse({ q: 'missing' })).total, 0);
});
test('invalid filters and unbounded pagination are rejected', () => {
  for (const query of [{ page: '0' }, { page: '1.5' }, { pageSize: '49' }, { sort: 'random' },
    { inStock: 'yes' }, { minPricePaise: '200', maxPricePaise: '100' }, { unknown: 'x' }, { q: 'x'.repeat(101) }]) {
    assert.equal(catalogQuerySchema.safeParse(query).success, false);
  }
});
