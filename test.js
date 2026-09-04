import assert from 'node:assert/strict';
import { scrape } from './scrapers/produbanco.js';

// Fragmento real de la web de Produbanco. Si el parser se rompe, esto avisa
// sin depender de que el sitio esté en línea.
const HTML = `
<div class="promo_cols">
  <section class="filter_item">
    <article class="col-md-4 col-sm-6 col-xs-12">
      <article class="restaurantes">
        <img src="/media/dcapydsl/amira-cocina-libanesa-produbanco-110826-p.jpg"
             alt="amira cocina libanesa produbanco 110826 p" loading="lazy">
        <h4>Recibe una limonada Amira o un postre &#xE1;rabe</h4>
        <p>totalmente gratis</p>
        <span>15/09/2026</span>
        <a class="btn btn-default" href="/banca-personas/promociones/detalle-promocion/?=11631&amp;promocion=Recibeunalimonada">Más información</a>
      </article>
    </article>
  </section>
  <section class="filter_item">
    <article class="col-md-4 col-sm-6 col-xs-12">
      <article class="salud">
        <img src="/media/x/animalopolis-produbanco-090326-p.jpg" alt="animalopolis produbanco 090326 p">
        <h4>20% de descuento en servicios veterinarios</h4>
        <p>en Animalopolis</p>
        <span>09/03/2026</span>
        <a href="/banca-personas/promociones/detalle-promocion/?=11140&amp;promocion=20dedescuento">Más información</a>
      </article>
    </article>
  </section>
</div>`;

const promos = scrape(HTML);

assert.equal(promos.length, 2, 'debe encontrar 2 promos');

const [a, b] = promos;
assert.equal(a.id, 'produbanco:11631');
assert.equal(a.comercio, 'Amira Cocina Libanesa', 'comercio sale del alt, sin el sufijo del banco');
assert.equal(a.titulo, 'Recibe una limonada Amira o un postre árabe', 'decodifica entidades HTML');
assert.equal(a.detalle, 'totalmente gratis');
assert.equal(a.categoria, 'restaurantes');
assert.equal(a.vence, '2026-09-15', 'DD/MM/YYYY -> ISO');
assert.equal(a.ciudad, 'todo_el_pais');
assert.equal(a.codigo, null);
assert.equal(
  a.url,
  'https://www.produbanco.com.ec/banca-personas/promociones/detalle-promocion/?=11631&promocion=Recibeunalimonada',
  'url relativa se vuelve absoluta'
);
assert.equal(a.imagen, 'https://www.produbanco.com.ec/media/dcapydsl/amira-cocina-libanesa-produbanco-110826-p.jpg');

assert.equal(b.comercio, 'Animalopolis');
assert.equal(b.categoria, 'salud');
assert.equal(b.vence, '2026-03-09');

assert.deepEqual(scrape('<html><body>rediseño</body></html>'), [], 'html desconocido -> vacío, no basura');

console.log('✓ todo bien');
