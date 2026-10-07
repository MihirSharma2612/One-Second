import assert from 'node:assert/strict';
import test from 'node:test';
import { addToCart, cartCount, cartTotal } from '../src/lib/cart';
import { demoCatalog } from '../src/server/catalog/domain';

const product = demoCatalog[0];
const medium = product.variants.find(variant => variant.size === 'M')!;
const small = product.variants.find(variant => variant.size === 'S')!;
test('empty bag has zero count and total paise', () => {
  assert.equal(cartCount([]), 0);
  assert.equal(cartTotal([]), 0);
});
test('same variant merges while different sizes and colours stay separate', () => {
  let lines = addToCart([], product, medium.id);
  lines = addToCart(lines, product, medium.id);
  lines = addToCart(lines, product, small.id);
  const otherColor = product.variants.find(variant => variant.size === 'M' && variant.color !== medium.color)!;
  lines = addToCart(lines, product, otherColor.id);
  assert.equal(lines.length, 3);
  assert.equal(lines[0].quantity, 2);
  assert.equal(cartCount(lines), 4);
  assert.equal(cartTotal(lines), product.pricePaise * 4);
});
test('stock limits apply independently to each variant', () => {
  let lines = addToCart([], product, medium.id);
  for (let count = 0; count < 10; count++) lines = addToCart(lines, product, medium.id);
  lines = addToCart(lines, product, small.id);
  assert.equal(lines[0].quantity, medium.stock);
  assert.equal(lines[1].quantity, 1);
});
test('unknown and sold-out variants cannot enter bag', () => {
  assert.deepEqual(addToCart([], product, 'INVALID'), []);
  const soldOut = product.variants.find(variant => variant.stock === 0)!;
  assert.deepEqual(addToCart([], product, soldOut.id), []);
});
