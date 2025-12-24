import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { APP_DESCRIPTION, APP_TITLE, SOCIAL } from './config';
import { fetchProducts, type ApiProduct } from './services/api';

type Product = {
  id: number;
  name: string;
  desc: string;
  price: string;
  image: string;
  badge?: string;
};

const THEMES = {
  accessories: {
    name: 'EverGlow Accessories',
    icon: '✨',
    header: 'linear-gradient(135deg, #2c1f1f 0%, #3a2a2a 100%)',
    main: 'linear-gradient(135deg, #f5e6e6 0%, #faf8f3 100%)',
    accent: '#b76e79',
    accentDark: '#2c1f1f',
    accentLight: '#f5e6e6',
    accentSecondary: '#d4af37',
    emptyIcon: '💎',
  },
  gifts: {
    name: 'Gifts & Crafts Hub',
    icon: '🎁',
    header: 'linear-gradient(135deg, #2d3f2a 0%, #3d4a36 100%)',
    main: 'linear-gradient(135deg, #fdf7f4 0%, #fdf8f5 100%)',
    accent: '#d4698c',
    accentDark: '#2d3f2a',
    accentLight: '#fdf7f4',
    accentSecondary: '#e8b4a8',
    emptyIcon: '🌸',
  },
} as const;

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const fadeInDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

const hoverCard = {
  rest: { y: 0, boxShadow: '0 4px 15px rgba(0,0,0,0.08)' },
  hover: { y: -8, boxShadow: '0 12px 30px rgba(0,0,0,0.18)' },
};

const InstagramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="none">
    <path
      d="M12.04 2C6.52 2 2.04 6.48 2.04 12c0 1.77.46 3.49 1.33 5.01L2 22l5.15-1.35A9.93 9.93 0 0 0 12.04 22c5.52 0 10-4.48 10-10s-4.48-10-10-10zm5.63 13.62c-.24.68-1.41 1.3-1.93 1.38-.49.07-1.12.1-1.8-.11-.41-.13-.94-.3-1.62-.59-2.85-1.23-4.71-4.09-4.85-4.28-.13-.19-1.16-1.54-1.16-2.94 0-1.4.73-2.09.99-2.38.26-.29.57-.36.76-.36.19 0 .38 0 .54.01.18.01.42-.07.66.51.24.58.82 2 .89 2.14.07.14.11.31.02.5-.09.19-.13.31-.26.48-.13.17-.28.38-.4.51-.13.13-.26.27-.11.54.15.27.67 1.1 1.43 1.78.98.87 1.8 1.14 2.07 1.27.27.13.43.11.59-.07.16-.18.68-.79.86-1.06.18-.27.36-.23.6-.14.24.09 1.53.72 1.79.85.26.13.43.2.49.31.06.11.06.64-.18 1.32z"
      fill="currentColor"
    />
  </svg>
);

const TESTIMONIALS = [
  { quote: 'Beautifully crafted and exactly as I envisioned.', name: 'Riya', tag: 'Custom bouquet' },
  { quote: 'Elegant accessories that elevated my outfit.', name: 'Aanya', tag: 'EverGlow client' },
  { quote: 'Quick response, thoughtful curation, great packaging.', name: 'Meera', tag: 'Gift hamper' },
];

const FILTERS: Record<
  ThemeKey,
  { id: string; label: string; matches: (p: Product) => boolean }[]
> = {
  accessories: [
    { id: 'all', label: 'All', matches: () => true },
    { id: 'featured', label: 'Featured', matches: (p) => Boolean(p.badge) },
    { id: 'under1500', label: 'Under ₹1,500', matches: (p) => priceToNumber(p.price) <= 1500 },
    { id: 'premium', label: 'Premium', matches: (p) => priceToNumber(p.price) > 2000 },
  ],
  gifts: [
    { id: 'all', label: 'All', matches: () => true },
    {
      id: 'bouquet',
      label: 'Bouquets',
      matches: (p) => /bouquet|bloom|floral/i.test(p.name),
    },
    {
      id: 'hampers',
      label: 'Hampers',
      matches: (p) => /hamper|basket|box/i.test(p.name),
    },
    { id: 'premium', label: 'Premium', matches: (p) => priceToNumber(p.price) > 2500 },
  ],
};

type ThemeKey = keyof typeof THEMES;

function toProduct(api: ApiProduct, fallbackId: number): Product {
  return {
    id: fallbackId,
    name: api.title ?? 'Untitled',
    desc: api.description ?? '',
    price: api.price ? String(api.price) : '',
    image: api.imageUrl || '',
    badge: api.badge,
  };
}

function priceToNumber(price: string) {
  const n = Number(price.replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function ProductGrid({
  items,
  themeKey,
  loading,
}: {
  items: Product[];
  themeKey: ThemeKey;
  loading: boolean;
}) {
  const theme = THEMES[themeKey];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl border-2 border-transparent overflow-hidden animate-pulse"
            style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}
          >
            <div
              className="w-full h-64"
              style={{
                background: `linear-gradient(135deg, ${theme.accentLight}, ${theme.accentSecondary}33)`,
              }}
            />
            <div className="p-5 space-y-3">
              <div className="h-5 bg-gray-200 rounded w-2/3" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
              <div className="h-5 bg-gray-200 rounded w-1/3" />
              <div className="h-9 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <motion.div
        className="col-span-full text-center rounded-xl bg-white p-12"
        style={{ border: `2px dashed ${theme.accent}` }}
        {...fadeInUp}
      >
        <div className="text-6xl mb-4">{theme.emptyIcon}</div>
        <div className="text-2xl font-bold text-neutral-900 mb-2">Coming Soon</div>
        <p className="text-gray-500">
          Explore our exclusive {themeKey === 'accessories' ? 'accessories' : 'gift'} collection
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((product) => (
        <motion.article
          key={product.id}
          variants={hoverCard}
          initial="rest"
          whileHover="hover"
          animate="rest"
          className="bg-white rounded-xl overflow-hidden border-2 border-transparent transition"
          style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}
        >
          <div
            className="w-full h-64 flex items-center justify-center overflow-hidden relative"
            style={{
              background: `linear-gradient(135deg, ${theme.accentLight}, ${theme.accentSecondary}33)`,
            }}
          >
            {product.badge ? (
              <span className="absolute top-3 left-3 z-10 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-neutral-800 shadow-sm border border-white/70">
                {product.badge}
              </span>
            ) : null}
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition duration-300 hover:scale-105"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                const fallback = document.createTextNode(theme.emptyIcon);
                e.currentTarget.replaceWith(fallback);
              }}
            />
          </div>
          <div className="p-5 space-y-3">
            <div className="text-lg font-bold text-neutral-900">{product.name}</div>
            <p className="text-sm text-gray-600 leading-relaxed">{product.desc}</p>
            <div className="text-base font-semibold" style={{ color: theme.accent }}>
              ₹{product.price}
            </div>
            <a
              href={`https://wa.me/919876543210?text=Hi! I'm interested in: ${product.name}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-white transition"
              style={{ background: theme.accent }}
            >
              💬 Inquire Now
            </a>
          </div>
        </motion.article>
      ))}
    </div>
  );
}

export default function CuratedPage() {
  const [business, setBusiness] = useState<ThemeKey>('accessories');
  const theme = THEMES[business];
  const reducedMotion = useReducedMotion();
  const instagramHandle =
    business === 'accessories' ? SOCIAL.instagramAccessories : SOCIAL.instagramGifts;

  const [products, setProducts] = useState<Record<ThemeKey, Product[]>>({
    accessories: [],
    gifts: [],
  });
  const [loading, setLoading] = useState<Record<ThemeKey, boolean>>({
    accessories: true,
    gifts: true,
  });
  const [selectedFilter, setSelectedFilter] = useState<Record<ThemeKey, string>>({
    accessories: 'all',
    gifts: 'all',
  });

  const mappedProducts = useMemo(() => products[business], [products, business]);
  const filteredProducts = useMemo(() => {
    const current = mappedProducts;
    const filter = FILTERS[business].find((f) => f.id === selectedFilter[business]) ?? FILTERS[business][0];
    return current.filter((p) => filter.matches(p));
  }, [mappedProducts, business, selectedFilter]);

  useEffect(() => {
    const categories: ThemeKey[] = ['accessories', 'gifts'];
    categories.forEach(async (category) => {
      setLoading((prev) => ({ ...prev, [category]: true }));
      const data = await fetchProducts(category);
      // Always update state, even if empty, to clear any fallback data
      setProducts((prev) => ({
        ...prev,
        [category]: data.map((item, idx) => toProduct(item, idx + 1)),
      }));
      setLoading((prev) => ({ ...prev, [category]: false }));
    });
  }, []);

  useEffect(() => {
    const title = `${APP_TITLE} | ${
      business === 'accessories' ? SOCIAL.accessoriesLabel : SOCIAL.giftsLabel
    }`;
    document.title = title;

    const description = APP_DESCRIPTION;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description);
    } else {
      const el = document.createElement('meta');
      el.name = 'description';
      el.content = description;
      document.head.appendChild(el);
    }
  }, [business]);

  return (
    <div className="min-h-screen text-neutral-900" style={{ background: theme.main }}>
      <motion.header
        className="sticky top-0 z-30"
        style={{ background: theme.header, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
        initial="initial"
        animate="animate"
        variants={fadeInDown}
        transition={{ duration: reducedMotion ? 0 : 0.5 }}
      >
        <div className="max-w-6xl mx-auto px-5 py-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.5 }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold shadow-md"
              style={{ background: theme.accentSecondary, color: theme.accentDark }}
            >
              {theme.icon}
            </div>
            <div className="text-white">
              <div className="text-xl font-semibold leading-tight">{APP_TITLE}</div>
              <div
                className="text-xs font-semibold tracking-[0.2em]"
                style={{ color: theme.accentSecondary }}
              >
                Luxury Collections
              </div>
            </div>
          </motion.div>

          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.5 }}
          >
            <span className="text-sm font-semibold text-white/90">{theme.name}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={business === 'gifts'}
                onChange={(e) => setBusiness(e.target.checked ? 'gifts' : 'accessories')}
                className="sr-only peer"
              />
              <div
                className="w-[74px] h-[38px] rounded-full border-2 flex items-center px-2 transition-colors duration-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-white/40"
                style={{
                  borderColor: theme.accentSecondary,
                  background: `${theme.accentSecondary}26`,
                }}
              >
                <motion.span
                  layout
                  className="w-7 h-7 rounded-full"
                  style={{ background: theme.accentSecondary }}
                  transition={{ type: 'spring', stiffness: reducedMotion ? 1 : 500, damping: 30 }}
                  animate={{
                    x: business === 'gifts' ? 30 : 0,
                  }}
                />
              </div>
            </label>
          </motion.div>
        </div>
      </motion.header>

      <main className="max-w-6xl mx-auto px-5 py-10 md:py-12">
        <AnimatePresence mode="wait">
          <motion.section
            key={business}
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: reducedMotion ? 0 : 0.4 }}
            className="space-y-8"
          >
            <div className="text-center space-y-2">
              <h1
                className="text-3xl md:text-4xl font-bold"
                style={{
                  background: `linear-gradient(135deg, ${theme.accentDark}, ${theme.accent})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {business === 'accessories'
                  ? '✨ EverGlow Accessories'
                  : '🎁 Gifts & Crafts Hub'}
              </h1>
              <p className="text-sm md:text-base text-gray-500 font-medium tracking-wide">
                {business === 'accessories'
                  ? 'Elegantly Crafted Collections'
                  : 'Handcrafted with Love'}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div
                className="rounded-xl bg-white/70 backdrop-blur border border-white/60 shadow-sm p-5 md:p-6"
                style={{ boxShadow: '0 12px 30px rgba(0,0,0,0.08)' }}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="text-left">
                    <div className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                      {business === 'accessories' ? 'EverGlow Accessories' : 'Gifts & Crafts Hub'}
                    </div>
                    <div className="text-xl md:text-2xl font-bold text-neutral-900">
                      Custom-made, thoughtfully curated.
                    </div>
                    <div className="text-sm text-gray-600">
                      Tell us your occasion, budget, and style—we’ll craft it for you.
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href={`https://wa.me/${SOCIAL.whatsappNumber}?text=Hi! I'd like a custom ${
                        business === 'accessories' ? 'accessory' : 'gift'
                      }.`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold text-white gap-2"
                      style={{ background: theme.accent }}
                    >
                      <WhatsAppIcon />
                      <span>Custom Order</span>
                    </a>
                    <a
                      href={`https://instagram.com/${instagramHandle}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold text-neutral-800 bg-white border border-gray-200 gap-2"
                    >
                      <InstagramIcon />
                      <span>View Instagram</span>
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {FILTERS[business].map((filter) => {
                  const active = selectedFilter[business] === filter.id;
                  return (
                    <button
                      key={filter.id}
                      onClick={() =>
                        setSelectedFilter((prev) => ({ ...prev, [business]: filter.id }))
                      }
                      className={`px-3 py-2 rounded-full text-sm font-semibold border transition ${
                        active
                          ? 'bg-white shadow-sm'
                          : 'bg-white/60 hover:bg-white border-gray-200 text-gray-700'
                      }`}
                      style={{
                        color: active ? theme.accentDark : undefined,
                        borderColor: active ? theme.accent : undefined,
                      }}
                    >
                      {filter.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${business}-grid`}
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: reducedMotion ? 0 : 0.3 }}
              >
                <ProductGrid
                  items={filteredProducts}
                  themeKey={business}
                  loading={loading[business]}
                />
              </motion.div>
            </AnimatePresence>
          </motion.section>
        </AnimatePresence>

        <section className="max-w-6xl mx-auto px-5 mt-12 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="text-lg text-neutral-900 font-semibold mb-2">“{t.quote}”</div>
              <div className="text-sm text-gray-600">{t.name}</div>
              <div className="text-xs font-semibold text-gray-500 mt-1">{t.tag}</div>
            </div>
          ))}
        </section>

      </main>

      <a
        href={`https://wa.me/${SOCIAL.whatsappNumber}?text=Hi! I'd like to place an order.`}
        target="_blank"
        rel="noreferrer"
        className="fixed right-4 bottom-4 md:right-6 md:bottom-6 rounded-full px-4 py-3 text-sm font-semibold text-white shadow-lg inline-flex items-center gap-2"
        style={{ background: theme.accent }}
      >
        <WhatsAppIcon />
        <span>Message on WhatsApp</span>
      </a>
    </div>
  );
}

