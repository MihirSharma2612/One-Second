import Link from 'next/link';
import { categories } from '@/lib/catalog';
import { ProductCard } from '@/components/ProductCard';
import { catalogQuerySchema } from '@/server/catalog/domain';
import { listProducts } from '@/server/catalog/service';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const listing = await listProducts(catalogQuerySchema.parse({ category: 'new-drop', pageSize: '4' }));
  return <main><section className="hero"><div><p className="eyebrow">DROP 01 · EVERYDAY FORMS / LIMITED QUANTITIES</p>
    <h1>TAKE THE<br />MOMENT.</h1><Link className="lime button" href="/shop">SHOP THE DROP　→</Link></div></section>
    <section className="section"><p className="eyebrow">01 / FIND YOUR UNIFORM</p><h2>SHOP BY CATEGORY</h2>
      <div className="categories">{categories.map((category, index) => <Link href={`/shop?category=${encodeURIComponent(category)}`} key={category}>
        <span>0{index + 1}</span><b>{category}</b><em>↗</em></Link>)}</div></section>
    <section className="section"><p className="eyebrow">02 / JUST LANDED</p><div className="section-title"><h2>NEW DROP</h2>
      <Link href="/shop">SHOP THE FULL DROP　↗</Link></div><div className="grid">
      {listing.products.map(product => <ProductCard key={product.id} product={product} />)}</div>
      {!listing.total && <p>New products are coming soon.</p>}</section>
    <section className="story"><div><p className="eyebrow">03 / OUR POINT OF VIEW</p><h2>MORE THAN<br />A MOMENT.</h2>
      <p>ONE SECOND is a study in what stays. We design elevated everyday uniforms in India—considered proportions, quality fabrics and details you notice over time.</p>
      <button className="button">READ OUR STORY　↗</button></div><div className="story-art">ONE<br />SECOND</div></section>
    <section className="trust"><span>◉　India-first streetwear</span><span>◉　Unisex fits</span><span>◉　Demo storefront / no live payments</span></section>
    <section className="newsletter"><div><p className="eyebrow">STAY ONE SECOND AHEAD</p><h2>New drops. Restocks.<br />No noise.</h2></div>
      <div><input placeholder="Email address" /><button className="lime button">JOIN THE LIST</button></div></section></main>;
}
