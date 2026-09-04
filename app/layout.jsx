import './globals.css';
import Link from 'next/link';
import { sesionActual } from '../lib/supabase.js';
import { salir } from './acciones.js';

export const metadata = {
  title: 'Yapa — promos y descuentos de Ecuador',
  description:
    'Todas las promociones y descuentos de Ecuador en un solo lugar. Filtrá por tus tarjetas y no pagues de más.',
};

function Logo() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#41d999" />
          <stop offset="1" stopColor="#0f9e7a" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="15" fill="url(#lg)" />
      <path d="M23 24v-4a9 9 0 0 1 18 0v4" fill="none" stroke="#fff" strokeWidth="4.2" strokeLinecap="round" />
      <path d="M15.5 23h33l-2.9 25.4A6 6 0 0 1 39.6 54H24.4a6 6 0 0 1-6-5.6z" fill="#fff" />
      <path d="M32 31.5v13M25.5 38h13" stroke="#0f9e7a" strokeWidth="4.6" strokeLinecap="round" />
    </svg>
  );
}

export default async function RootLayout({ children }) {
  const s = await sesionActual();

  return (
    <html lang="es">
      <body>
        <header className="top">
          <div className="wrap">
            <Link href="/" className="marca">
              <Logo />
              Yapa
            </Link>

            <nav className="nav">
              <Link href="/">Promos</Link>
              {s && <Link href="/mi-cuenta">Mi cuenta</Link>}
              {s?.esAdmin && <Link href="/admin">Panel</Link>}
              {s ? (
                <form action={salir}>
                  <button type="submit">Salir</button>
                </form>
              ) : (
                <Link href="/entrar" className="btn chico">Entrar</Link>
              )}
            </nav>
          </div>
        </header>

        <main className="wrap py">{children}</main>
      </body>
    </html>
  );
}
