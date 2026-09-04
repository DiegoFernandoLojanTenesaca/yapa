import Link from 'next/link';
import { redirect } from 'next/navigation';
import TarjetaPromo from '../TarjetaPromo.jsx';
import Icono from '../Icono.jsx';
import PieDePagina from '../PieDePagina.jsx';
import { guardarMisBancos } from '../acciones.js';
import { sesion, comerciosSeguidos } from '../../lib/almacen.js';
import { slugComercio } from '../../lib/comercios.js';
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

  const seguidos = await comerciosSeguidos(s.user.id);
  const deSeguidos = seguidos.length
    ? todas
        .filter((p) => seguidos.includes(slugComercio(p.comercio)))
        .sort((a, b) => (b.actualizada ?? '').localeCompare(a.actualizada ?? ''))
    : [];

  // "Nueva" = entró en la última semana. Es lo que hace que valga seguir un comercio.
  const haceUnaSemana = new Date(Date.now() - 7 * 86400000).toISOString();
  const novedades = deSeguidos.filter((p) => (p.actualizada ?? '') >= haceUnaSemana);

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
          <div className="kpi">
            <div className="n">{seguidos.length}</div>
            <div className="e">Comercios que sigues</div>
          </div>
          <div className={`kpi${porVencer.length ? ' urgente' : ''}`}>
            <div className="n">{porVencer.length}</div>
            <div className="e">Se vencen esta semana</div>
          </div>
        </div>

        {porVencer.length > 0 && (
          <div className="aviso alerta" style={{ marginTop: 16 }}>
            Tienes {porVencer.length} {porVencer.length === 1 ? 'promo guardada' : 'promos guardadas'} que
            se {porVencer.length === 1 ? 'vence' : 'vencen'} en los próximos 7 días:{' '}
            {porVencer.map((p) => p.comercio).join(', ')}.
          </div>
        )}

        <h2 className="seccion">
          Comercios que sigues ({seguidos.length})
          <Link className="btn sec chico" href="/comercios">
            Buscar comercios
          </Link>
        </h2>

        {seguidos.length === 0 ? (
          <div className="vacio">
            <b>No sigues ningún comercio todavía</b>
            <span>
              Entra a cualquier comercio y toca <b style={{ display: 'inline' }}>+ Seguir</b>.
              Sus promos nuevas te aparecen aquí.
            </span>
            <Link className="btn" href="/comercios">
              Ver comercios
            </Link>
          </div>
        ) : (
          <>
            {novedades.length > 0 && (
              <div className="aviso ok">
                {novedades.length} {novedades.length === 1 ? 'promo nueva' : 'promos nuevas'} esta
                semana en los comercios que sigues.
              </div>
            )}
            <div className="grid">
              {(novedades.length ? novedades : deSeguidos).slice(0, 8).map((p) => (
                <TarjetaPromo
                  key={p.id}
                  promo={p}
                  esFavorita={favoritas.some((f) => f.id === p.id)}
                  haySesion
                />
              ))}
            </div>
          </>
        )}

        <h2 className="seccion">Mis tarjetas</h2>
        <div className="caja">
          <p className="sub" style={{ marginBottom: 15 }}>
            Marca dónde tienes tarjeta y te mostramos primero lo que sí puedes usar.
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
            <b>Todavía no has guardado ninguna</b>
            <span>Toca la estrella en cualquier promo y aparece aquí.</span>
            <Link className="btn" href="/">
              <Icono nombre="compras" /> Ver promos
            </Link>
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
