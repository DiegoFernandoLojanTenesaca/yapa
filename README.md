<img src="app/icon.svg" width="72" alt="">

# Yapa

**Promociones y descuentos de Ecuador, en un solo lugar.**

En Ecuador *la yapa* es lo que el vendedor te da de más, gratis. Eso hace la app.

Un scraper recorre cada día las páginas públicas de beneficios de los bancos,
normaliza lo que encuentra y lo guarda. El sitio lo muestra; el panel lo administra.

---

## Cómo está armado

| Pieza | Qué usa | Por qué |
|---|---|---|
| App | Next.js 16 (App Router, JS) | Sitio público, panel y API en un solo proyecto |
| Datos + cuentas | Supabase (Postgres + Auth) | Auth de usuarios lista y plan gratis siempre encendido |
| Scraping | `cheerio` | Parseo directo del HTML, **sin LLM** |
| Estilos | CSS plano, un archivo | Sin build extra, sin framework de UI |

Tres tipos de visitante:

- **Anónimo** — ve y busca todas las promos publicadas.
- **Registrado** — guarda favoritas y marca sus bancos para filtrar lo que sí puede usar.
- **Admin** — panel: estado de las fuentes, correr el scraper, publicar/ocultar/destacar,
  cargar promos a mano y ver los usuarios.

## Puesta en marcha

**1. Supabase.** Crear un proyecto en [supabase.com](https://supabase.com), abrir
**SQL Editor** y correr `supabase/schema.sql` entero.

**2. Variables.** Copiar `.env.example` a `.env.local` y llenar con los datos de
Project Settings → API.

```bash
npm install
npm run dev        # http://localhost:3000
```

**3. Hacete admin.** Registrate en `/entrar`, y después en el SQL Editor:

```sql
update public.perfiles set rol = 'admin' where email = 'tu@correo.com';
```

**4. Traé las promos.** Botón *Actualizar promos ahora* en `/admin`, o `npm run scrape`.

## Publicar

Vercel, conectando el repo. Cargar las 4 variables de `.env.example` en
Project Settings → Environment Variables. `vercel.json` ya deja programada la
actualización diaria a las 06:00 de Ecuador contra `/api/cron`.

Cualquier host de Node sirve igual; solo hay que apuntarle un cron a
`GET /api/cron` con la cabecera `Authorization: Bearer $CRON_SECRET`.

## Fuentes

| Fuente | Estado | Notas |
|---|---|---|
| Produbanco | ✅ 57 promos | HTML plano, trae fecha de vencimiento |
| Banco Guayaquil | pendiente | Trae **ciudad** (Quito / Guayaquil / Todo el país) |
| Banco Pichincha | pendiente | SPA — hay que encontrar el JSON que consume |
| Diners Club (blu benefits) | pendiente | El catálogo más grande del país; su SSL está mal configurado |

### Agregar una fuente

1. Crear `scrapers/<nombre>.js` exportando `fuente`, `banco`, `url` y `scrape(html)`.
2. Sumarlo al array `FUENTES` en `lib/scraping.js`.

`scrape(html)` devuelve objetos con esta forma:

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

### Reglas que respeta la sincronización

- Una promo **editada a mano** no se vuelve a pisar nunca.
- `publicada` y `destacada` se conservan al actualizar.
- Lo que desaparece del origen queda **archivado** (`activa = false`), no se borra.
- Si una fuente devuelve **0 promos**, se aborta y se registra el error: es la señal
  de que el banco rediseñó su web. Sin esta guarda, un cambio de HTML archivaría
  el catálogo entero en silencio.

## Sobre “aplicar el descuento directo”

No se puede meter un descuento dentro de la cuenta de un comercio sin ser su socio
comercial: eso exige su API y las credenciales del usuario. Lo que sí hace Yapa,
cuando hay código, es copiarlo al portapapeles y abrir la promo.

Las promos de banco no llevan código: se aplican solas al pagar con esa tarjeta.
Por eso su botón dice *Ver promo*.

## Alcance legal

Solo se leen páginas **públicas**, sin login, sin evadir CAPTCHAs ni límites de tasa,
una vez al día. No se recolectan datos personales de terceros. Las imágenes no se
republican: se enlazan desde el origen.
