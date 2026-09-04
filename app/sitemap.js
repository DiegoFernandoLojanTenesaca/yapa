import { promosPublicas, comercios, catalogos } from '../lib/consultas.js';

export const dynamic = 'force-dynamic';

const BASE = process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000';

/**
 * Mapa del sitio: cada promo y cada comercio como página propia. Es la forma
 * de que alguien buscando "cupón KFC Ecuador" caiga acá.
 */
export default async function sitemap() {
  const [promos, tiendas, cat] = await Promise.all([
    promosPublicas({}),
    comercios(),
    catalogos(),
  ]);

  const fijas = [
    { url: BASE, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/comercios`, changeFrequency: 'daily', priority: 0.8 },
  ];

  const categorias = cat.categorias.map((c) => ({
    url: `${BASE}/?categoria=${c}`,
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  return [
    ...fijas,
    ...categorias,
    ...tiendas.map((c) => ({
      url: `${BASE}/comercio/${c.slug}`,
      changeFrequency: 'daily',
      priority: 0.6,
    })),
    ...promos.map((p) => ({
      url: `${BASE}/promo/${encodeURIComponent(p.id)}`,
      lastModified: p.actualizada ? new Date(p.actualizada) : undefined,
      changeFrequency: 'weekly',
      priority: 0.5,
    })),
  ];
}
