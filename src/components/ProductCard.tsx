import Link from 'next/link';import {Product,money} from '@/lib/catalog';
export function ProductCard({product}:{product:Product}){return <article className="card"><Link href={`/product/${product.slug}`}><div className="card-image"><img src={product.image} alt=""/><span>NEW</span></div><div className="card-copy"><h3>{product.name}</h3><p>{money(product.price)}</p></div></Link></article>}
