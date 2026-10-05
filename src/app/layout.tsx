import './globals.css';
import { CartProvider } from '@/components/CartProvider';
import { Header } from '@/components/Header';

export const metadata = { title: 'ONE SECOND — Streetwear for the moment', description: 'A clean unisex streetwear storefront.' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" suppressHydrationWarning><body><CartProvider><Header />{children}<footer><b className="logo">ONE SECOND<i>•</i></b><p>Premium unisex streetwear designed in India for the moments that stay.</p><div><a>Shipping & Returns</a><a>FAQ</a><a>Instagram</a><a>WhatsApp</a></div><small>© 2026 ONE SECOND. ALL RIGHTS RESERVED.</small></footer></CartProvider></body></html>;
}
