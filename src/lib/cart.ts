import type { Product } from './catalog';

export type CartLine = { product: Product; size: string; quantity: number };

export function addToCart(lines: CartLine[], product: Product, size: string): CartLine[] {
  if (!product.sizes.includes(size) || product.stock <= 0) return lines;
  const quantity = lines.filter(line => line.product.slug === product.slug)
    .reduce((sum, line) => sum + line.quantity, 0);
  if (quantity >= product.stock) return lines;
  const exists = lines.some(line => line.product.slug === product.slug && line.size === size);
  return exists
    ? lines.map(line => line.product.slug === product.slug && line.size === size
      ? { ...line, quantity: line.quantity + 1 } : line)
    : [...lines, { product, size, quantity: 1 }];
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}

export function cartTotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
}
