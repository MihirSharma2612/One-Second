'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Product } from '@/lib/catalog';
import { addToCart, cartCount, type CartLine } from '@/lib/cart';

type CartContext = { lines: CartLine[]; add: (product: Product, size: string) => void; count: number };
const Cart = createContext<CartContext | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const add = (product: Product, size: string) => setLines(current => addToCart(current, product, size));
  return <Cart.Provider value={{ lines, add, count: cartCount(lines) }}>{children}</Cart.Provider>;
}

export function useCart() {
  const cart = useContext(Cart);
  if (!cart) throw new Error('useCart requires CartProvider');
  return cart;
}
