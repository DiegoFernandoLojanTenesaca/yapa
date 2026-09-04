/**
 * Iconos de categoría dibujados a mano. Son once trazos simples: no vale la
 * pena arrastrar una librería de mil iconos para esto.
 */
const TRAZOS = {
  restaurantes: 'M4 10h16a8 8 0 0 1-8 8 8 8 0 0 1-8-8ZM6 10a6 6 0 0 1 12 0M3 21h18',
  supermercados: 'M3 5h2l2.4 10.5a2 2 0 0 0 2 1.5h7.7a2 2 0 0 0 2-1.6L20.5 8H6M9 21h.01M17 21h.01',
  compras: 'M6 8h12l1 12H5L6 8Zm3 0V6a3 3 0 0 1 6 0v2',
  delivery: 'M5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm14 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM7.5 15.5h9M14 6h3l2 5M9 11l2-5h3',
  viajes: 'M3 15.5 21 9l-2.5 6.5M10.5 11.3 7 8 4.5 9l3 3M13 20l-1.5-4',
  entretenimiento: 'M3 6h18v12H3zM7 6v12M17 6v12M3 10h4M3 14h4M17 10h4M17 14h4',
  juegos: 'M8 11h4M10 9v4M15.5 11h.01M18 13h.01M4 15.5 5.5 9a3 3 0 0 1 3-2.4h7a3 3 0 0 1 3 2.4L20 15.5a2.5 2.5 0 0 1-4.4 1.8l-.8-1H9.2l-.8 1A2.5 2.5 0 0 1 4 15.5Z',
  salud: 'M12 4v16M4 12h16',
  educacion: 'M12 4 2 9l10 5 10-5-10-5ZM6 11.5V17c0 1.5 3 3 6 3s6-1.5 6-3v-5.5',
  hogar: 'M4 11 12 4l8 7M6 10v10h12V10',
  vehiculos: 'M5 16h14M6.5 16v2M17.5 16v2M4 16v-3l1.8-4.5A2 2 0 0 1 7.7 7h8.6a2 2 0 0 1 1.9 1.5L20 13v3M7 13h.01M17 13h.01',
  otros: 'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18',
};

export default function Icono({ nombre, tamano = 17 }) {
  const d = TRAZOS[nombre] ?? TRAZOS.otros;

  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="ico"
    >
      <path d={d} />
    </svg>
  );
}
