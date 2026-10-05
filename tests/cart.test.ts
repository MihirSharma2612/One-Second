import assert from 'node:assert/strict';
import test from 'node:test';
import { addToCart, cartCount, cartTotal } from '../src/lib/cart';
import { products } from '../src/lib/catalog';

const product = products[0];
test('empty bag has zero count and total', () => {
  assert.equal(cartCount([]), 0);
  assert.equal(cartTotal([]), 0);
});
test('add merges same size and keeps different sizes separate', () => {
  const first = addToCart([], product, 'M');
  const second = addToCart(first, product, 'M');
  const third = addToCart(second, product, 'S');
  assert.equal(first[0].quantity, 1);
  assert.equal(third.length, 2);
  assert.equal(third[0].quantity, 2);
  assert.equal(cartCount(third), 3);
  assert.equal(cartTotal(third), product.price * 3);
});
test('stock limit applies across sizes', () => {
  let lines = addToCart([], product, 'M');
  for (let count = 0; count < 10; count++) lines = addToCart(lines, product, 'S');
  assert.equal(cartCount(lines), product.stock);
});
test('invalid size and sold-out items cannot enter bag', () => {
  assert.deepEqual(addToCart([], product, 'INVALID'), []);
  assert.deepEqual(addToCart([], { ...product, stock: 0 }, 'M'), []);
});
