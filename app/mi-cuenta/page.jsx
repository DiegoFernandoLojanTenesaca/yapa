import Link from 'next/link';
import { redirect } from 'next/navigation';
import TarjetaPromo from '../TarjetaPromo.jsx';
import { guardarMisBancos } from '../acciones.js';
import { sesionActual } from '../../lib/supabase.js';
import { promosPublicas, catalogos } from '../../lib/consultas.js';

export const dynamic = 'force-dynamic';

export default async function MiCuenta() {
  const s = await sesionActual();
  if (!s) redirect('/entrar');

  const [favoritas, { bancos }] = await Promise.all([
    promosPublicas({ soloFavoritas: true, usuarioId: s.user.id }),
    catalogos(),
  ]);

  const mios = s.perfil?.bancos ?? [];

  return (
    <>
      <h1>Mi cuenta</h1>
      <p className="sub">{s.perfil?.nombre ? `${s.perfil.nombre} · ` : ''}{s.user.email}</p>

      <div className="seccion">Mis tarjetas</div>
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

      <div className="seccion">Mis favoritas ({favoritas.length})</div>
      {favoritas.length === 0 ? (
        <p className="vacio">
          Todavía no guardaste ninguna. Tocá la estrella en cualquier promo.
        </p>
      ) : (
        <div className="grid">
          {favoritas.map((p) => (
            <TarjetaPromo key={p.id} promo={p} esFavorita haySesion />
          ))}
        </div>
      )}
    </>
  );
}
