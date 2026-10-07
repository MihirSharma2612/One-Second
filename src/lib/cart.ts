import type { CatalogProduct } from '../server/catalog/domain';

export type CartLine = { product: CatalogProduct; variantId: string; size: string; color: string; quantity: number };

export function addToCart(lines: CartLine[], product: CatalogProduct, variantId: string): CartLine[] {
  const variant = product.variants.find(item => item.id === variantId);
  if (!variant || variant.stock <= 0) return lines;
  const quantity = lines.filter(line => line.variantId === variantId)
    .reduce((sum, line) => sum + line.quantity, 0);
  if (quantity >= variant.stock) return lines;
  const exists = lines.some(line => line.variantId === variantId);
  return exists
    ? lines.map(line => line.variantId === variantId
      ? { ...line, product, quantity: line.quantity + 1 } : line)
    : [...lines, { product, variantId, size: variant.size, color: variant.color, quantity: 1 }];
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}

export function cartTotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.product.pricePaise * line.quantity, 0);
}
