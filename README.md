# Promos EC

Promociones y descuentos de Ecuador, en un solo lugar.

Un scraper baja cada día las páginas públicas de beneficios, las convierte a JSON,
y lo commitea. El sitio lee ese JSON. Sin base de datos, sin backend, sin servidor.

```
scrapers/*.js  →  scrape.js  →  data/*.json  →  git commit  →  sitio/
```

## Uso

```bash
npm install
npm test          # verifica el parser contra un fixture (no toca la red)
npm run scrape    # baja las promos y escribe data/
npm run sitio     # sirve el repo, abrir http://localhost:3000/sitio/
```

El cron de GitHub Actions (`.github/workflows/scrape.yml`) corre a las 06:00 de Ecuador.

## Fuentes

| Fuente | Estado | Notas |
|---|---|---|
| Produbanco | ✅ 57 promos | HTML server-rendered, con fecha de vencimiento |
| Banco Guayaquil | pendiente | Trae **ciudad** (Quito / Guayaquil / Todo el país) |
| Banco Pichincha | pendiente | SPA, hay que encontrar el JSON que consume |
| Diners Club (blu benefits) | pendiente | El catálogo más grande del país; su SSL está mal configurado |

## Agregar una fuente

1. Crear `scrapers/<nombre>.js` exportando `fuente`, `banco`, `url` y `scrape(html)`.
2. Agregarlo al array `FUENTES` en `scrape.js`.

`scrape(html)` devuelve un array de objetos con esta forma:

```js
{
  id: 'produbanco:11631',      // estable entre corridas
  fuente: 'produbanco',
  banco: 'Produbanco',
  comercio: 'Amira Cocina Libanesa',
  titulo: 'Recibe una limonada Amira o un postre árabe',
  detalle: 'totalmente gratis',
  categoria: 'restaurantes',
  ciudad: 'todo_el_pais',      // o 'quito' / 'guayaquil'
  vence: '2026-09-15',         // ISO, o null
  codigo: null,                // string si la fuente da un código canjeable
  url: 'https://…',
  imagen: 'https://…'
}
```

Si una fuente devuelve 0 promos, el runner **no** sobreescribe el archivo: conserva
lo último bueno y sale con código 1. Es la señal de que el banco rediseñó su web.

## Sobre "aplicar el descuento directo"

No se puede aplicar un descuento dentro de la cuenta de un comercio sin ser su socio
comercial: eso requiere su API y las credenciales del usuario. Lo que sí hace el sitio,
cuando la fuente entrega un código, es copiarlo al portapapeles y abrir la promo.

Las promos de Produbanco son beneficios de tarjeta: no llevan código, se aplican al
pagar con la tarjeta del banco. Por eso su botón dice "Ver promo".

## Alcance legal

Solo se leen páginas **públicas**, sin login, sin evadir CAPTCHAs ni límites de tasa,
una vez al día. No se recolectan datos personales. No se republican imágenes: se
enlazan desde el origen.
