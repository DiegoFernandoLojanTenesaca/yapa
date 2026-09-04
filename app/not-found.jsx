import Link from 'next/link';

export default function NoEncontrado() {
  return (
    <div className="wrap conAire">
      <div className="perdido">
        <span className="numeroto">404</span>
        <h1>Esta promo ya voló</h1>
        <p>
          O nunca existió, o se venció y la sacamos. Las promos duran poco: por eso conviene
          revisar seguido.
        </p>
        <div className="fichaAcciones" style={{ justifyContent: 'center' }}>
          <Link className="btn" href="/">
            Ver promos vigentes
          </Link>
          <Link className="btn sec" href="/comercios">
            Buscar un comercio
          </Link>
        </div>
      </div>
    </div>
  );
}
