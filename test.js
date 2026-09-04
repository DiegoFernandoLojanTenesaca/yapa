import assert from 'node:assert/strict';
import { scrape as scrapeProdubanco } from './scrapers/produbanco.js';
import { scrape as scrapePacifico } from './scrapers/pacifico.js';
import { rebaja } from './lib/rebaja.js';

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

/* ══════════════════════ el número de la promo ══════════════════════ */

assert.equal(rebaja({ titulo: '30% de descuento en tus compras' }), '30%');
assert.equal(rebaja({ titulo: 'Llevá 2x1 en helados' }), '2x1');
assert.equal(rebaja({ titulo: 'Promo', detalle: '2 x 1 de lunes a jueves' }), '2x1', 'tolera espacios');
assert.equal(rebaja({ titulo: '$10 de descuento en tu primera compra' }), '$10');
assert.equal(rebaja({ titulo: '15 % off en proteínas' }), '15%', 'el porcentaje gana sobre otros números');
assert.equal(rebaja({ titulo: 'Doble plan de recompensas', detalle: null }), null, 'sin número -> sin insignia');

console.log('✓ todo bien');
