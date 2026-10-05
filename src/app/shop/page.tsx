import Link from 'next/link';
import { categories, products } from '@/lib/catalog';
import { ProductCard } from '@/components/ProductCard';

export default async function Shop({ searchParams }: {
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  const params = await searchParams;
  const selected = typeof params.category === 'string' ? params.category : 'All';
  const shown = selected === 'All' ? products : products.filter(product =>
    product.category === selected || selected === 'New Drop');
  return <main className="shop">
    <div className="shop-head"><p className="eyebrow">ONE SECOND / COLLECTION</p>
      <h1>{selected === 'All' ? 'THE NEW DROP' : selected.toUpperCase()}</h1></div>
    <div className="shop-body"><aside><b>FILTERS</b><label>CATEGORY</label>
      {['All', ...categories].map(category => <Link
        href={`/shop?category=${encodeURIComponent(category)}`} key={category}>{category}</Link>)}
      <label>SIZE</label>{['S', 'M', 'L', 'XL'].map(size => <button key={size}>{size}</button>)}
    </aside><section><div className="sort">{shown.length} PRODUCTS
      <button>SORT BY: NEWEST　⌄</button></div>
      <div className="grid">{shown.map(product => <ProductCard product={product} key={product.slug} />)}</div>
      {!shown.length && <div className="empty"><h2>NO RESULTS FOUND</h2>
        <p>Try adjusting filters or search terms.</p></div>}
    </section></div>
  </main>;
}
