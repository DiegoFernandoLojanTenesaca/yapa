import './globals.css';
import Link from 'next/link';
import { Nunito } from 'next/font/google';
import { sesion, esLocal } from '../lib/almacen.js';
import { salir } from './acciones.js';

// Redondeada, igual que la bolsita del icono: la marca se lee como una pieza.
const nunito = Nunito({ subsets: ['latin'], variable: '--fuente', display: 'swap' });

const DESCRIPCION =
  'Todas las promociones y descuentos de Ecuador en un solo lugar. Filtrá por tus tarjetas y no pagues de más.';

export const metadata = {
  // Sin esto, las imágenes de vista previa se mandan con ruta relativa y
  // WhatsApp no las resuelve.
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000'),
  title: 'Yapa',
  description: DESCRIPCION,
  openGraph: {
    title: 'Yapa — promos y descuentos de Ecuador',
    description: DESCRIPCION,
    siteName: 'Yapa',
    locale: 'es_EC',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
};

function Logo() {
  return (
    // El icono va tal cual se diseñó. Sobre la cabecera roja se separa con un
    // aro blanco (ver .marca svg), en vez de repintarlo y perder la marca.
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="15" fill="#da291c" />
      <path d="M24.5 26v-4.5a7.5 7.5 0 0 1 15 0V26" fill="none" stroke="#ffc72c" strokeWidth="4" strokeLinecap="round" />
      <path d="M14.5 25.5h35l-3.1 24.6A6.5 6.5 0 0 1 39.9 56H24.1a6.5 6.5 0 0 1-6.5-5.9z" fill="#ffc72c" />
      <circle cx="26.4" cy="37" r="2.9" fill="#b81f14" />
      <circle cx="37.6" cy="37" r="2.9" fill="#b81f14" />
      <path d="M26.2 44.6c1.9 2.7 4 4 5.8 4s3.9-1.3 5.8-4" fill="none" stroke="#b81f14" strokeWidth="3.1" strokeLinecap="round" />
    </svg>
  );
}

export default async function RootLayout({ children }) {
  const s = await sesion();
  const local = esLocal();

  return (
    <html lang="es" className={nunito.variable}>
      <body>
        {local && (
          <div className="tira">
            Modo local · los datos viven en data/local.json y entrás como admin sin clave
          </div>
        )}

        <a className="saltar" href="#contenido">
          Saltar al contenido
        </a>

        <header className="top">
          <div className="wrap">
            <Link href="/" className="marca">
              <Logo />
              Yapa
            </Link>

            <nav className="nav">
              <Link href="/">Promos</Link>
              <Link href="/comercios">Comercios</Link>
              {s && <Link href="/mi-cuenta">Mi cuenta</Link>}
              {s?.esAdmin && <Link href="/admin">Panel</Link>}
              {s && !local ? (
                <form action={salir}>
                  <button type="submit">Salir</button>
                </form>
              ) : !s ? (
                <Link href="/entrar" className="destacado">Entrar</Link>
              ) : null}
            </nav>
          </div>
        </header>

        <main className="py" id="contenido">
          {children}
        </main>
      </body>
    </html>
  );
}
