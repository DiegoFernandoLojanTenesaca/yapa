import Link from 'next/link';
import { redirect } from 'next/navigation';
import TarjetaPromo from '../TarjetaPromo.jsx';
import Icono from '../Icono.jsx';
import PieDePagina from '../PieDePagina.jsx';
import { guardarMisBancos } from '../acciones.js';
import { sesion } from '../../lib/almacen.js';
import { promosPublicas, catalogos } from '../../lib/consultas.js';

export const dynamic = 'force-dynamic';

export default async function MiCuenta() {
  const s = await sesion();
  if (!s) redirect('/entrar');

  const [favoritas, cat, todas] = await Promise.all([
    promosPublicas({ favoritas: true, usuarioId: s.user.id }),
    catalogos(),
    promosPublicas({}),
  ]);

  const mios = s.perfil?.bancos ?? [];
  const paraMi = mios.length ? todas.filter((p) => p.banco && mios.includes(p.banco)) : [];

  // Lo que se vence en la semana, de lo que el usuario guardó.
  const hoy = new Date().toISOString().slice(0, 10);
  const enSieteDias = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  const porVencer = favoritas.filter((p) => p.vence && p.vence >= hoy && p.vence <= enSieteDias);

  const inicial = (s.perfil?.nombre ?? s.user.email ?? '?').trim().charAt(0).toUpperCase();

  return (
    <>
      <div className="wrap">
        <header className="perfil">
          <div className="avatar">{inicial}</div>
          <div>
            <h1>{s.perfil?.nombre || 'Tu cuenta'}</h1>
            <p className="sub">{s.user.email}</p>
          </div>
        </header>

        <div className="tarjetas" style={{ marginTop: 20 }}>
          <div className="kpi">
            <div className="n">{favoritas.length}</div>
            <div className="e">Promos guardadas</div>
          </div>
          <div className="kpi">
            <div className="n">{mios.length}</div>
            <div className="e">Tarjetas marcadas</div>
          </div>
          <div className="kpi">
            <div className="n">{paraMi.length}</div>
            <div className="e">Promos para tus tarjetas</div>
          </div>
          <div className={`kpi${porVencer.length ? ' urgente' : ''}`}>
            <div className="n">{porVencer.length}</div>
            <div className="e">Se vencen esta semana</div>
          </div>
        </div>

        {porVencer.length > 0 && (
          <div className="aviso alerta" style={{ marginTop: 16 }}>
            Tenés {porVencer.length} {porVencer.length === 1 ? 'promo guardada' : 'promos guardadas'} que
            se {porVencer.length === 1 ? 'vence' : 'vencen'} en los próximos 7 días:{' '}
            {porVencer.map((p) => p.comercio).join(', ')}.
          </div>
        )}

        <h2 className="seccion">Mis tarjetas</h2>
        <div className="caja">
          <p className="sub" style={{ marginBottom: 15 }}>
            Marcá dónde tenés tarjeta y te mostramos primero lo que sí podés usar.
          </p>

          <form action={guardarMisBancos}>
            <div className="fichas">
              {cat.bancos.length === 0 && <p className="sub">Todavía no hay bancos cargados.</p>}
              {cat.bancos.map((b) => (
                <label className="ficha" key={b}>
                  <input type="checkbox" name="bancos" value={b} defaultChecked={mios.includes(b)} />
                  <span>{b}</span>
                </label>
              ))}
            </div>
            <button className="btn" style={{ marginTop: 15 }}>
              Guardar mis tarjetas
            </button>
          </form>
        </div>

        {paraMi.length > 0 && (
          <>
            <h2 className="seccion">
              Para tus tarjetas ({paraMi.length})
              <Link className="btn sec chico" href={`/?banco=${encodeURIComponent(mios[0])}`}>
                Ver todas
              </Link>
            </h2>
            <div className="grid">
              {paraMi.slice(0, 6).map((p) => (
                <TarjetaPromo key={p.id} promo={p} esFavorita={favoritas.some((f) => f.id === p.id)} haySesion />
              ))}
            </div>
          </>
        )}

        <h2 className="seccion">Mis favoritas ({favoritas.length})</h2>
        {favoritas.length === 0 ? (
          <div className="vacio">
            <b>Todavía no guardaste ninguna</b>
            Tocá la estrella en cualquier promo y aparece acá.
            <p style={{ marginTop: 14 }}>
              <Link className="btn" href="/">
                <Icono nombre="compras" /> Ver promos
              </Link>
            </p>
          </div>
        ) : (
          <div className="grid">
            {favoritas.map((p) => (
              <TarjetaPromo key={p.id} promo={p} esFavorita haySesion />
            ))}
          </div>
        )}
      </div>

      <PieDePagina total={todas.length} conCodigo={cat.conCodigo} />
    </>
  );
}
