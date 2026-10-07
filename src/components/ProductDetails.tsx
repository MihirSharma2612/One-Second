'use client';

import { useState } from 'react';
import { money } from '@/lib/catalog';
import type { CatalogProduct } from '@/server/catalog/domain';
import { useCart } from './CartProvider';

export function ProductDetails({ product }: { product: CatalogProduct }) {
  const [color, setColor] = useState(product.variants[0]?.color ?? '');
  const [size, setSize] = useState('');
  const [message, setMessage] = useState('');
  const { add, lines } = useCart();
  const colors = [...new Set(product.variants.map(variant => variant.color))];
  const sizes = [...new Set(product.variants.map(variant => variant.size))];
  const variant = product.variants.find(item => item.color === color && item.size === size);
  const inBag = lines.find(line => line.variantId === variant?.id)?.quantity ?? 0;
  const canAdd = !!variant && variant.stock > inBag;
  const soldOut = !product.variants.some(item => item.stock > 0);
  return <div className="details"><p className="eyebrow">{product.isNew ? 'NEW DROP' : 'ONE SECOND'} / UNISEX</p>
    <h1>{product.name}</h1><p className="price">{money(product.pricePaise / 100)}
      {product.oldPricePaise !== null && <del>{money(product.oldPricePaise / 100)}</del>}</p>
    <label>COLOUR: {color || 'UNAVAILABLE'}</label><div className="swatches">
      {colors.map(value => <button type="button" key={value} aria-label={`Colour ${value}`}
        aria-pressed={color === value} style={{ background: value }} onClick={() => {
          setColor(value); setSize(''); setMessage('');
        }} />)}
    </div><label>SELECT SIZE</label><div className="sizes">
      {sizes.map(value => {
        const option = product.variants.find(item => item.color === color && item.size === value);
        return <button type="button" key={value} disabled={!option || option.stock <= 0}
          aria-pressed={size === value} className={size === value ? 'selected' : ''}
          onClick={() => { setSize(value); setMessage(''); }}>{value}</button>;
      })}
    </div><button type="button" className="button add" disabled={!canAdd} onClick={() => {
      if (variant && canAdd) { add(product, variant.id); setMessage('Added to your bag.'); }
    }}>{soldOut ? 'SOLD OUT' : !variant ? 'SELECT SIZE' : canAdd ? 'ADD TO BAG' : 'STOCK LIMIT REACHED'}</button>
    <p className="stock">{soldOut ? 'OUT OF STOCK' : variant ? variant.stock <= 5
      ? `LOW STOCK — ONLY ${variant.stock} LEFT` : 'IN STOCK' : 'Choose a colour and available size.'}</p>
    <p role="status" aria-live="polite">{message}</p>
    <details><summary>PRODUCT DETAILS <b>＋</b></summary><p>{product.description}</p></details>
    <p className="eyebrow">DEMO BAG — STOCK AND PRICES MUST BE RECHECKED AT REAL CHECKOUT.</p>
  </div>;
}
