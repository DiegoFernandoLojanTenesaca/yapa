export const fuente = 'juegos';
export const origen = 'Ofertas de juegos';
export const banco = null;
export const url = 'https://www.cheapshark.com/api/1.0/deals';

// CheapShark pide que los clientes se identifiquen en vez de disfrazarse de
// navegador. Es su condición de uso y se respeta.
const UA = 'Yapa/0.2 (agregador de promociones; +https://github.com/DiegoFernandoLojanTenesaca/yapa)';

const LISTADO = `${url}?upperPrice=25&pageSize=30&sortBy=Savings&onSale=1`;
const TIENDAS = 'https://www.cheapshark.com/api/1.0/stores';

const precio = (n) => `$${Number(n).toFixed(2)}`;

export function armar(deals, tiendas) {
  const nombreTienda = new Map(tiendas.map((t) => [t.storeID, t.storeName]));

  return deals
    .filter((d) => Number(d.savings) >= 20 && d.title)
    .map((d) => {
      const off = Math.round(Number(d.savings));
      const gratis = Number(d.salePrice) === 0;

      return {
        id: `${fuente}:${d.gameID}`,
        fuente,
        banco,
        comercio: nombreTienda.get(d.storeID) ?? 'Tienda de juegos',
        titulo: d.title,
        // El porcentaje va primero para que la insignia grande lo tome a él
        // y no al precio, que también lleva signo de dólar.
        detalle: gratis
          ? `Gratis · antes ${precio(d.normalPrice)}`
          : `${off}% OFF · de ${precio(d.normalPrice)} a ${precio(d.salePrice)}`,
        categoria: 'juegos',
        ciudad: 'todo_el_pais',
        vence: null, // Las ofertas caen sin aviso; no publican fecha.
        codigo: null,
        url: `https://www.cheapshark.com/redirect?dealID=${d.dealID}`,
        imagen: d.thumb ?? null,
      };
    });
}

export async function recolectar(pedir) {
  const [deals, tiendas] = await Promise.all([
    pedir(LISTADO, { 'user-agent': UA }).then(JSON.parse),
    pedir(TIENDAS, { 'user-agent': UA }).then(JSON.parse),
  ]);

  return armar(deals, tiendas);
}
