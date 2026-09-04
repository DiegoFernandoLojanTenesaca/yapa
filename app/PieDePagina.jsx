import Link from 'next/link';

export default function PieDePagina({ total, conCodigo }) {
  return (
    <footer className="pie-sitio">
      <div className="wrap">
        <div className="pie-cols">
          <div className="pie-marca">
            <svg viewBox="0 0 64 64" aria-hidden="true">
              <rect width="64" height="64" rx="15" fill="#da291c" />
              <path d="M24.5 26v-4.5a7.5 7.5 0 0 1 15 0V26" fill="none" stroke="#ffc72c" strokeWidth="4" strokeLinecap="round" />
              <path d="M14.5 25.5h35l-3.1 24.6A6.5 6.5 0 0 1 39.9 56H24.1a6.5 6.5 0 0 1-6.5-5.9z" fill="#ffc72c" />
              <circle cx="26.4" cy="37" r="2.9" fill="#b81f14" />
              <circle cx="37.6" cy="37" r="2.9" fill="#b81f14" />
              <path d="M26.2 44.6c1.9 2.7 4 4 5.8 4s3.9-1.3 5.8-4" fill="none" stroke="#b81f14" strokeWidth="3.1" strokeLinecap="round" />
            </svg>
            <div>
              <strong>Yapa</strong>
              <p>
                En Ecuador <em>la yapa</em> es lo que te dan de más, gratis.
                Acá están todas las promos del país en un solo lugar.
              </p>
            </div>
          </div>

          <div className="pie-datos">
            <span>
              <b>{total}</b> promos vigentes
            </span>
            <span>
              <b>{conCodigo}</b> con código
            </span>
            <span>Se actualiza todos los días</span>
          </div>
        </div>

        <div className="pie-legal">
          <p>
            Yapa no vende ni canjea nada: te muestra la promo y te lleva al comercio.
            Las condiciones y la vigencia las pone cada comercio, así que confirmá siempre
            antes de pagar.
          </p>
          <p className="pie-abajo">
            <span>© {new Date().getFullYear()} Yapa · Hecho en Ecuador</span>
            <Link href="/">Promos</Link>
            <Link href="/mi-cuenta">Mi cuenta</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
