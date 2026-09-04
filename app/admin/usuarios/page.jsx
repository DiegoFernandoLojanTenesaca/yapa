import { usuariosRegistrados } from '../../../lib/consultas.js';

export const dynamic = 'force-dynamic';

export default async function Usuarios() {
  const usuarios = await usuariosRegistrados();

  return (
    <>
      <h1>Usuarios</h1>
      <p className="sub">{usuarios.length} registrados</p>

      <div className="caja scroll" style={{ marginTop: 18 }}>
        <table className="tabla">
          <thead>
            <tr><th>Correo</th><th>Nombre</th><th>Rol</th><th>Sus bancos</th><th>Se registró</th></tr>
          </thead>
          <tbody>
            {usuarios.length === 0 && (
              <tr><td colSpan={5} className="sub">Todavía no hay nadie registrado.</td></tr>
            )}

            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td>{u.nombre ?? '—'}</td>
                <td>
                  <span className={`pill${u.rol === 'admin' ? ' ac' : ''}`}>{u.rol}</span>
                </td>
                <td className="mono">{u.bancos?.length ? u.bancos.join(', ') : '—'}</td>
                <td className="mono">
                  {new Date(u.creado).toLocaleDateString('es-EC', { dateStyle: 'medium' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="sub" style={{ marginTop: 14 }}>
        Los roles se cambian desde Supabase → SQL Editor:
        <br />
        <code className="mono">
          update public.perfiles set rol = 'admin' where email = 'alguien@correo.com';
        </code>
      </p>
    </>
  );
}
