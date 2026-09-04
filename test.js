import assert from 'node:assert/strict';
import { scrape as scrapeProdubanco } from './scrapers/produbanco.js';
import { scrape as scrapePacifico } from './scrapers/pacifico.js';
import { scrape as scrapeCupones } from './scrapers/cuponesecuador.js';
import { scrape as scrapeEncuentra } from './scrapers/encuentrapromo.js';
import { rebaja } from './lib/rebaja.js';
import { logoDe } from './lib/logo.js';

/* ══════════════════════ Produbanco ══════════════════════ */
// Fragmento real. Si el parser se rompe esto avisa sin depender de la red.

const HTML_PRODUBANCO = `
<div class="promo_cols">
  <section class="filter_item">
    <article class="col-md-4">
      <article class="restaurantes">
        <img src="/media/dcapydsl/amira-cocina-libanesa-produbanco-110826-p.jpg"
             alt="amira cocina libanesa produbanco 110826 p">
        <h4>Recibe una limonada Amira o un postre &#xE1;rabe</h4>
        <p>totalmente gratis</p>
        <span>15/09/2026</span>
        <a href="/banca-personas/promociones/detalle-promocion/?=11631&amp;promocion=Recibeunalimonada">Más información</a>
      </article>
    </article>
  </section>
  <section class="filter_item">
    <article class="col-md-4">
      <article class="compras">
        <img src="/media/x/mercado-libre-portada-produbanco-070726-p.jpg" alt="mercado libre portada produbanco 070726 p">
        <h4>30% de descuento en tus compras</h4>
        <p>en Mercado Libre los Jueves</p>
        <span>30/09/2026</span>
        <a href="/banca-personas/promociones/detalle-promocion/?=11705&amp;promocion=30dedescuento">Más información</a>
      </article>
    </article>
  </section>
</div>`;

const pb = scrapeProdubanco(HTML_PRODUBANCO);
assert.equal(pb.length, 2, 'produbanco: debe encontrar 2 promos');

assert.equal(pb[0].id, 'produbanco:11631');
assert.equal(pb[0].comercio, 'Amira Cocina Libanesa', 'el comercio sale del alt, sin el sufijo del banco');
assert.equal(pb[0].titulo, 'Recibe una limonada Amira o un postre árabe', 'decodifica entidades HTML');
assert.equal(pb[0].categoria, 'restaurantes');
assert.equal(pb[0].vence, '2026-09-15', 'DD/MM/YYYY -> ISO');
assert.equal(pb[0].ciudad, 'todo_el_pais');
assert.equal(pb[0].codigo, null);
assert.equal(
  pb[0].url,
  'https://www.produbanco.com.ec/banca-personas/promociones/detalle-promocion/?=11631&promocion=Recibeunalimonada',
  'la url relativa se vuelve absoluta'
);
assert.equal(pb[1].comercio, 'Mercado Libre', 'descarta "portada", que es palabra de maquetación');

assert.deepEqual(scrapeProdubanco('<html><body>rediseño</body></html>'), [], 'html desconocido -> vacío, no basura');

/* ══════════════════════ Banco del Pacífico ══════════════════════ */

const HTML_PACIFICO = `
<div class="wrapperPromosMoreResult">
  <div class="itemPromos" data-type="PromoPC">
    <a href="/promociones/beneficios-pacificard/2026/agosto/REGRESA-A-CLASES-CON-CORAL">
      <img alt="Coral" src="/BancoPacifico/media/VivePacifico/Establecimientos/Coral-Hipermercados.jpg?ext=.jpg" />
    </a>
    <div class="itemPromoResume">
      <div class="contentPromo"><a href="/promociones/beneficios-pacificard/2026/agosto/REGRESA-A-CLASES-CON-CORAL">REGRESA A CLASES CON CORAL</a></div>
      <div class="footerResume">
        <a class="markCategory" href="/x"><i></i>Supermercados</a>
      </div>
    </div>
  </div>
  <div class="itemPromos" data-type="PromoPC">
    <a href="/promociones/beneficios-pacificard/2026/julio/CLINICA-SANTA-LUCIA">
      <img alt="c" src="/BancoPacifico/media/VivePacifico/Establecimientos/CLINICA-SANTA-LUCIA.jpg" />
    </a>
    <div class="itemPromoResume">
      <div class="contentPromo"><a href="/promociones/beneficios-pacificard/2026/julio/CLINICA-SANTA-LUCIA">Clinica Santa Lucia</a></div>
      <div class="footerResume">
        <a class="markCategory" href="/x"><i></i>Centros M&#233;dicos</a>
      </div>
    </div>
  </div>
  <div class="itemPromos" data-type="PromoPC">
    <a href="/promociones/beneficios-pacificard/2026/agosto/REGRESA-A-CLASES-CON-CORAL">
      <img alt="Coral" src="/BancoPacifico/media/VivePacifico/Establecimientos/Coral-Hipermercados.jpg" />
    </a>
    <div class="itemPromoResume">
      <div class="contentPromo"><a href="/promociones/beneficios-pacificard/2026/agosto/REGRESA-A-CLASES-CON-CORAL">REGRESA A CLASES CON CORAL</a></div>
      <div class="footerResume"><a class="markCategory" href="/x"><i></i>Supermercados</a></div>
    </div>
  </div>
</div>`;

const pa = scrapePacifico(HTML_PACIFICO);
assert.equal(pa.length, 2, 'pacifico: la misma promo repetida en la página cuenta una sola vez');

assert.equal(pa[0].id, 'pacifico:REGRESA-A-CLASES-CON-CORAL');
assert.equal(pa[0].comercio, 'Coral Hipermercados', 'el comercio sale del nombre del archivo de imagen');
assert.equal(pa[0].categoria, 'supermercados');
assert.equal(pa[0].banco, 'Banco del Pacífico');
assert.equal(pa[0].vence, null, 'pacífico no publica vigencia en el listado');
assert.equal(
  pa[0].url,
  'https://www.bancodelpacifico.com/promociones/beneficios-pacificard/2026/agosto/REGRESA-A-CLASES-CON-CORAL'
);
assert.equal(pa[1].categoria, 'salud', '"Centros Médicos" con tilde y entidad -> salud');

assert.deepEqual(scrapePacifico('<div>otra cosa</div>'), [], 'html desconocido -> vacío');

/* ══════════════════════ CuponesEcuador ══════════════════════ */

const HTML_CUPONES = `
<section class="coupons">
  <div class="coupon"><div class="coupon-inner">
    <div class="coupon-main">
      <div class="coupon-title"><a class="rc-title"
        href="https://www.cuponesecuador.com.ec/tienda/pizza-hut/#coupon_12193"
        data-id="12193" data-code="HUT2GO"
        data-title="Cupón Combo por US$ 16,99 en Pizza Hut"
        data-terms="Aplica el código en pizza mediana.">Cupón Combo en Pizza Hut</a></div>
    </div>
    <div class="coupon-cta"><a class="coupon-btn btn btn-coupon" data-id="12193" data-code="HUT2GO"
      data-deeplink="https://r.linksprf.com/v1/redirect?url=https%3A%2F%2Fwww.pizzahut.com.ec%2Fhome&#038;api_key=SECRETO&#038;site_id=XYZ">Mostrar Cupón</a></div>
    <div class="coupon-signals"><span class="coupon-expiry">Válido hasta 07/09/2026</span></div>
    <div class="coupon-store-link"><a href="https://www.cuponesecuador.com.ec/tienda/pizza-hut/">Pizza Hut</a></div>
  </div></div>

  <div class="coupon"><div class="coupon-inner">
    <div class="coupon-main">
      <div class="coupon-title"><a class="rc-title"
        href="https://www.cuponesecuador.com.ec/tienda/kfc-ecuador/#coupon_9"
        data-id="9" data-code="MEGAPROMO" data-title="Combos con precio especial en KFC"
        data-terms="Solo en la app oficial."></a></div>
    </div>
    <div class="coupon-cta"><a class="coupon-btn" data-id="9" data-code="MEGAPROMO"
      data-deeplink="https://www.awin1.com/cread.php?awinmid=18697&#038;awinaffid=354041">Mostrar</a></div>
    <div class="coupon-store-link"><a href="https://www.cuponesecuador.com.ec/tienda/kfc-ecuador/">KFC</a></div>
  </div></div>
</section>`;

const cu = scrapeCupones(HTML_CUPONES);
assert.equal(cu.length, 2, 'cuponesecuador: 2 cupones');

assert.equal(cu[0].id, 'cuponesecuador:12193');
assert.equal(cu[0].comercio, 'Pizza Hut');
assert.equal(cu[0].codigo, 'HUT2GO', 'el código sale del data-code');
assert.equal(cu[0].categoria, 'restaurantes', 'clasificado por palabras clave');
assert.equal(cu[0].vence, '2026-09-07');
assert.equal(cu[0].banco, null, 'un agregador no es un banco');
assert.equal(
  cu[0].url,
  'https://www.pizzahut.com.ec/home',
  'saca el destino real del redirector: no pasa por el enlace de afiliado ajeno'
);

assert.equal(cu[1].comercio, 'KFC', 'acrónimo en mayúscula y sin el sufijo -ecuador');
assert.equal(cu[1].categoria, 'restaurantes');
assert.equal(
  cu[1].url,
  'https://www.cuponesecuador.com.ec/tienda/kfc-ecuador/#coupon_9',
  'si el enlace es de afiliado sin destino visible, apunta a la fuente en vez de monetizarles el clic'
);
assert.equal(cu[1].vence, null, 'sin fecha publicada -> null');

assert.deepEqual(scrapeCupones('<div>nada</div>'), [], 'html desconocido -> vacío');

/* ══════════════════════ EncuentraPromo ══════════════════════ */

const HTML_ENCUENTRA = `
<div class="grid-wrapper">
  <div class="col-12 grid-item">
    <div class="product-teaser"><div class="product-teaser-container">
      <a href="/ofertas/ver/cupon-60-pizza-biglovers">
        <div class="post-image product-image">
          <div class="product-badge"><span class="badge badge-pill badge-success">Descuento 60%</span></div>
          <div class="field field-image"><div class="field-item">
            <img loading="lazy" src="/sites/default/files/styles/max_325x325/public/epromo/deal.png.webp?itok=0_qK7WsR" />
          </div></div>
          <div class="flag js-flag-epromo-wishlist-12143 action-flag"><a href="/flag/x">Favorito</a></div>
        </div>
      </a>
      <div class="product-meta-wrap"><div class="product-meta">
        <div class="product-title mt-2">
          <a class="product-title-link" href="/ofertas/ver/cupon-60-pizza-biglovers">
            <div class="field field-name field-item">Cupón de 60% en Pizza Biglovers</div>
          </a>
        </div>
        <div class="product-attribute"><a class="small" href="/tiendas/ver/pizza-hut">Pizza Hut</a></div>
      </div></div>
    </div></div>
  </div>
</div>`;

const en = scrapeEncuentra(HTML_ENCUENTRA);
assert.equal(en.length, 1, 'encuentrapromo: 1 promo');

assert.equal(en[0].id, 'encuentrapromo:12143', 'el id sale del nodo de Drupal, no del slug');
assert.equal(en[0].comercio, 'Pizza Hut');
assert.equal(en[0].titulo, 'Cupón de 60% en Pizza Biglovers');
assert.equal(en[0].detalle, 'Descuento 60%', 'la insignia alimenta la rebaja grande');
assert.equal(rebaja(en[0]), '60%', 'y de ahí sale el número de la tarjeta');
assert.equal(en[0].categoria, 'restaurantes');
assert.equal(en[0].banco, null);
assert.equal(
  en[0].imagen,
  'https://encuentrapromo.com.ec/sites/default/files/styles/max_325x325/public/epromo/deal.png.webp?itok=0_qK7WsR'
);

assert.deepEqual(scrapeEncuentra('<div>nada</div>'), [], 'html desconocido -> vacío');

/* ══════════════════════ logo de respaldo ══════════════════════ */

assert.equal(logoDe('https://www.kfc.com.ec/'), 'https://icons.duckduckgo.com/ip3/kfc.com.ec.ico', 'quita el www');
assert.equal(logoDe('https://pizzahut.com.ec/home?x=1'), 'https://icons.duckduckgo.com/ip3/pizzahut.com.ec.ico');
assert.equal(logoDe(null), null, 'sin url no hay logo, la tarjeta cae al nombre');
assert.equal(logoDe('no-es-una-url'), null, 'url inválida no rompe la tarjeta');

/* ══════════════════════ el número de la promo ══════════════════════ */

assert.equal(rebaja({ titulo: '30% de descuento en tus compras' }), '30%');
assert.equal(rebaja({ titulo: 'Llevá 2x1 en helados' }), '2x1');
assert.equal(rebaja({ titulo: 'Promo', detalle: '2 x 1 de lunes a jueves' }), '2x1', 'tolera espacios');
assert.equal(rebaja({ titulo: '$10 de descuento en tu primera compra' }), '$10');
assert.equal(rebaja({ titulo: '15 % off en proteínas' }), '15%', 'el porcentaje gana sobre otros números');
assert.equal(rebaja({ titulo: 'Doble plan de recompensas', detalle: null }), null, 'sin número -> sin insignia');

console.log('✓ todo bien');
