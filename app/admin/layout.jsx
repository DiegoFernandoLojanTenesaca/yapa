import Link from 'next/link';
import { redirect } from 'next/navigation';
import { sesionActual } from '../../lib/supabase.js';

export const dynamic = 'force-dynamic';

/** Cortafuegos del panel. Las server actions igual revalidan el rol por su cuenta. */
export default async function AdminLayout({ children }) {
  const s = await sesionActual();
  if (!s) redirect('/entrar');
  if (!s.esAdmin) redirect('/');

  return (
    <>
      <nav className="nav" style={{ marginBottom: 20 }}>
        <Link href="/admin">Resumen</Link>
        <Link href="/admin/promos">Promos</Link>
        <Link href="/admin/promo">Nueva promo</Link>
        <Link href="/admin/usuarios">Usuarios</Link>
      </nav>
      {children}
    </>
  );
}
