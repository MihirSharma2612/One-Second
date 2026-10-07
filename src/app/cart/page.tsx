'use client';
import Link from 'next/link';
import { useCart } from '@/components/CartProvider';
import { money } from '@/lib/catalog';
import { cartTotal } from '@/lib/cart';

export default function Cart() {
  const { lines } = useCart();
  const total = cartTotal(lines);
  return <main className="cart"><p className="eyebrow">YOUR SELECTION / DEMO BAG</p><h1>YOUR BAG</h1>
    {!lines.length ? <p>Your bag is empty. <Link href="/shop">Shop the drop.</Link></p>
      : <div className="cart-layout"><div>{lines.map(line => <article key={line.variantId}>
        {line.product.images[0] ? <img src={line.product.images[0].url} alt={line.product.images[0].alt} />
          : <div className="image-placeholder">PHOTO PENDING</div>}
        <div><h3>{line.product.name}</h3><p>{line.size} / {line.color} / {line.quantity} item</p>
          <b>{money(line.product.pricePaise / 100)}</b></div>
      </article>)}</div><aside><h2>ORDER SUMMARY</h2><p>Subtotal <b>{money(total / 100)}</b></p>
        <p>Shipping calculated at real checkout.</p><p className="total">Items total <b>{money(total / 100)}</b></p>
        <Link className="button add" href="/checkout">DEMO CHECKOUT　→</Link>
      </aside></div>}
  </main>;
}
