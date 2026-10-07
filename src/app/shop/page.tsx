import Link from 'next/link';
import { categories } from '@/lib/catalog';
import { ProductCard } from '@/components/ProductCard';
import { catalogQuerySchema, categorySlug } from '@/server/catalog/domain';
import { listProducts } from '@/server/catalog/service';

export const dynamic = 'force-dynamic';
type Search = Record<string, string | string[] | undefined>;

export default async function Shop({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const normalized = { ...params };
  if (typeof normalized.category === 'string') {
    normalized.category = normalized.category === 'All' ? undefined : categorySlug(normalized.category);
  }
  const parsed = catalogQuerySchema.safeParse(normalized);
  if (!parsed.success) return <main className="section"><h1>INVALID FILTERS</h1>
    <p>Choose valid filters and try again.</p><Link href="/shop">Reset filters</Link></main>;
  const query = parsed.data;
  const listing = await listProducts(query);
  const selected = categories.find(name => categorySlug(name) === query.category) ?? query.category ?? 'All';
  const href = (changes: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    for (const [key, value] of Object.entries(normalized)) if (typeof value === 'string') next.set(key, value);
    next.delete('page');
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value); else next.delete(key);
    }
    return `/shop?${next}`;
  };
  const pages = Math.ceil(listing.total / query.pageSize);
  return <main className="shop">
    <div className="shop-head"><p className="eyebrow">ONE SECOND / COLLECTION</p>
      <h1>{selected === 'All' ? 'THE NEW DROP' : selected.toUpperCase()}</h1></div>
    <div className="shop-body"><aside><b>FILTERS</b><label>CATEGORY</label>
      {['All', ...categories].map(category => <Link key={category}
        aria-current={selected === category ? 'page' : undefined}
        href={href({ category: category === 'All' ? undefined : categorySlug(category) })}>{category}</Link>)}
      <label>SIZE</label>{['S', 'M', 'L', 'XL'].map(size => <Link key={size}
        aria-current={query.size === size ? 'page' : undefined}
        href={href({ size: query.size === size ? undefined : size })}>{size}</Link>)}
      <Link href={href({ inStock: query.inStock === true ? undefined : 'true' })}
        aria-current={query.inStock === true ? 'page' : undefined}>In stock only</Link>
      <Link href="/shop">Reset filters</Link>
    </aside><section>
      <form className="catalog-search" action="/shop">
        {query.category && <input type="hidden" name="category" value={query.category} />}
        {query.size && <input type="hidden" name="size" value={query.size} />}
        {query.inStock !== undefined && <input type="hidden" name="inStock" value={String(query.inStock)} />}
        <label htmlFor="catalog-search">SEARCH PRODUCTS</label>
        <input id="catalog-search" name="q" defaultValue={query.q} maxLength={100} placeholder="Search tees, hoodies…" />
        <label htmlFor="catalog-sort">SORT BY</label>
        <select id="catalog-sort" name="sort" defaultValue={query.sort}>
          <option value="newest">Newest</option><option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option><option value="name">Name</option>
        </select><button className="button" type="submit">APPLY</button>
      </form><div className="sort">{listing.total} PRODUCTS</div>
      <div className="grid">{listing.products.map(product => <ProductCard product={product} key={product.id} />)}</div>
      {!listing.products.length && <div className="empty"><h2>NO RESULTS FOUND</h2>
        <p>Try adjusting filters or search terms.</p><Link href="/shop">Clear all filters</Link></div>}
      {pages > 1 && <div className="pagination" aria-label="Collection pages">
        {query.page > 1 && <Link href={href({ page: String(query.page - 1) })}>Previous</Link>}
        <span>Page {query.page} of {pages}</span>
        {query.page < pages && <Link href={href({ page: String(query.page + 1) })}>Next</Link>}
      </div>}
    </section></div>
  </main>;
}
