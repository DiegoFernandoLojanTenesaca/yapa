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

### Modo local (sin configurar nada)

Sin Supabase, Yapa guarda todo en `data/local.json` y entrás como admin sin clave.
Sirve para trabajar la interfaz con datos reales antes de conectar nada.

```bash
npm install
npm run scrape    # trae las promos a data/local.json
npm run dev       # http://localhost:3000
```

Una tira amarilla arriba avisa que estás en modo local, para no confundirlo con producción.

### Con Supabase

1. Crear un proyecto en [supabase.com](https://supabase.com), abrir **SQL Editor**
   y correr `supabase/schema.sql` entero.
2. Copiar `.env.example` a `.env.local` con los datos de Project Settings → API.
3. Registrarte en `/entrar` y promoverte a admin:

```sql
update public.perfiles set rol = 'admin' where email = 'tu@correo.com';
```

En cuanto `NEXT_PUBLIC_SUPABASE_URL` tiene un valor real, la app cambia de almacén sola.
La decisión vive en un solo lugar: `lib/almacen.js`.

## Publicar

Vercel, conectando el repo. Cargar las 4 variables de `.env.example` en
Project Settings → Environment Variables. `vercel.json` ya deja programada la
actualización diaria a las 06:00 de Ecuador contra `/api/cron`.

Cualquier host de Node sirve igual; solo hay que apuntarle un cron a
`GET /api/cron` con la cabecera `Authorization: Bearer $CRON_SECRET`.

## Fuentes

El detalle de qué se recolecta y desde dónde vive en `scrapers/` y en el panel
(`/admin` → *De dónde salen los datos*), que es donde hace falta. Acá no se
publica el mapa.

Lo que no se puede recolectar se carga a mano desde el panel — para eso está el
formulario de *Nueva promo*.

### Agregar una fuente

1. Crear `scrapers/<nombre>.js` exportando `fuente`, `origen`, `banco`, `url` y `scrape(html)`.
2. Sumarlo al array `FUENTES` en `lib/scraping.js`.
3. Agregar un fragmento real de su HTML a `test.js`.

`scrape(html)` devuelve objetos con esta forma:

```js
{
  id: 'produbanco:11631',      // estable entre corridas
  fuente: 'produbanco',
  banco: 'Produbanco',
  comercio: 'Amira Cocina Libanesa',
  titulo: 'Recibe una limonada Amira o un postre árabe',
  detalle: 'totalmente gratis',
  categoria: 'restaurantes',   // vocabulario común, ver abajo
  ciudad: 'todo_el_pais',      // o 'quito' / 'guayaquil'
  vence: '2026-09-15',         // ISO, o null
  codigo: null,                // string si la fuente da un código canjeable
  url: 'https://…',
  imagen: 'https://…'
}
```

**Categorías**: `restaurantes`, `supermercados`, `compras`, `viajes`,
`entretenimiento`, `salud`, `educacion`, `hogar`, `vehiculos`, `delivery`, `otros`.
Cada banco usa su propia taxonomía; el scraper la traduce a esta. Sin eso los
filtros del sitio se parten en vocabularios incompatibles.

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

Solo se leen páginas **públicas**, sin login, sin evadir CAPTCHAs ni sistemas
anti-bot, una vez al día. Cuando un sitio nos bloquea, se respeta el bloqueo y la
fuente queda marcada como no disponible. No se recolectan datos personales de
terceros. Las imágenes no se republican: se enlazan desde el origen.
