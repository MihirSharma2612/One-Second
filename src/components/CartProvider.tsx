'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { CatalogProduct } from '@/server/catalog/domain';
import { addToCart, cartCount, type CartLine } from '@/lib/cart';

type CartContext = { lines: CartLine[]; add: (product: CatalogProduct, variantId: string) => void; count: number };
const Cart = createContext<CartContext | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const add = (product: CatalogProduct, variantId: string) => setLines(current => addToCart(current, product, variantId));
  return <Cart.Provider value={{ lines, add, count: cartCount(lines) }}>{children}</Cart.Provider>;
}

export function useCart() {
  const cart = useContext(Cart);
  if (!cart) throw new Error('useCart requires CartProvider');
  return cart;
}
