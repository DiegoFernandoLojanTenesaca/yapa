import Link from 'next/link';
import { redirect } from 'next/navigation';
import TarjetaPromo from '../TarjetaPromo.jsx';
import { guardarMisBancos } from '../acciones.js';
import { sesion } from '../../lib/almacen.js';
import { promosPublicas, catalogos } from '../../lib/consultas.js';

export const dynamic = 'force-dynamic';

export default async function MiCuenta() {
  const s = await sesion();
  if (!s) redirect('/entrar');

  const [favoritas, { bancos }] = await Promise.all([
    promosPublicas({ favoritas: true, usuarioId: s.user.id }),
    catalogos(),
  ]);

  const mios = s.perfil?.bancos ?? [];

  return (
    <div className="wrap">
      <h1>Mi cuenta</h1>
      <p className="sub">{s.perfil?.nombre ? `${s.perfil.nombre} · ` : ''}{s.user.email}</p>

      <h2 className="seccion">Mis tarjetas</h2>
      <div className="caja">
        <p className="sub" style={{ marginBottom: 14 }}>
          Marcá los bancos donde tenés tarjeta. Sirve para filtrar rápido las promos que
          realmente podés usar.
        </p>

        <form action={guardarMisBancos}>
          <div className="fila" style={{ marginBottom: 14 }}>
            {bancos.length === 0 && <p className="sub">Todavía no hay bancos cargados.</p>}
            {bancos.map((b) => (
              <label className="check" key={b} style={{ flex: '0 0 auto', marginRight: 16 }}>
                <input type="checkbox" name="bancos" value={b} defaultChecked={mios.includes(b)} />
                {b}
              </label>
            ))}
          </div>
          <button className="btn">Guardar</button>
        </form>

        {mios.length > 0 && (
          <p className="sub" style={{ marginTop: 12 }}>
            {mios.map((b) => (
              <Link key={b} href={`/?banco=${encodeURIComponent(b)}`} style={{ marginRight: 10 }}>
                Ver promos de {b} →
              </Link>
            ))}
          </p>
        )}
      </div>

      <h2 className="seccion">Mis favoritas ({favoritas.length})</h2>
      {favoritas.length === 0 ? (
        <div className="vacio">
          <b>Todavía no guardaste ninguna</b>
          Tocá la estrella en cualquier promo para tenerla acá.
        </div>
      ) : (
        <div className="grid">
          {favoritas.map((p) => (
            <TarjetaPromo key={p.id} promo={p} esFavorita haySesion />
          ))}
        </div>
      )}
    </div>
  );
}
