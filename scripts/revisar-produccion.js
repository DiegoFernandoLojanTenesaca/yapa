/**
 * Revisa que un despliegue quedó bien. Uso:
 *   node scripts/revisar-produccion.js https://yapa.vercel.app
 */
const base = (process.argv[2] ?? '').replace(/\/$/, '');
if (!base) {
  console.error('Falta la URL. Ej: node scripts/revisar-produccion.js https://yapa.vercel.app');
  process.exit(1);
}

const RUTAS = [
  ['/', 'portada', (h) => /promociones vigentes/.test(h)],
  ['/comercios', 'comercios', (h) => /tarjetaComercio/.test(h)],
  ['/entrar', 'entrar', (h) => /Regístrate|Entrar/.test(h)],
  ['/sitemap.xml', 'sitemap', (h) => (h.match(/<url>/g) ?? []).length > 50],
  ['/robots.txt', 'robots', (h) => /Disallow: \/admin/.test(h)],
  ['/manifest.webmanifest', 'manifest', (h) => /"short_name"\s*:\s*"Yapa"/.test(h)],
  ['/promo/no-existe', '404 propio', (h, s) => s === 404],
  ['/admin', 'panel protegido', (h, s) => s === 200 || s === 307],
];

let fallos = 0;

for (const [ruta, nombre, ok] of RUTAS) {
  try {
    const res = await fetch(base + ruta, { redirect: 'manual' });
    const cuerpo = await res.text();
    const bien = ok(cuerpo, res.status);
    console.log(`  ${bien ? '✓' : '✗'} ${nombre.padEnd(18)} HTTP ${res.status}  ${ruta}`);
    if (!bien) fallos++;
  } catch (e) {
    console.log(`  ✗ ${nombre.padEnd(18)} ${e.message}`);
    fallos++;
  }
}

// El cron tiene que rechazar a quien no traiga el secreto.
const sinLlave = await fetch(`${base}/api/cron`);
const protegido = sinLlave.status === 401;
console.log(`  ${protegido ? '✓' : '✗'} cron protegido    HTTP ${sinLlave.status} sin autorización (debe ser 401)`);
if (!protegido) fallos++;

console.log(fallos ? `\n${fallos} problemas.` : '\nTodo bien.');
process.exit(fallos ? 1 : 0);
