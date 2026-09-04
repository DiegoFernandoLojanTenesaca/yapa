const BASE = process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000';

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // El panel y la cuenta no tienen nada que hacer en un buscador.
      disallow: ['/admin', '/mi-cuenta', '/entrar', '/api/'],
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
