import Formulario from './Formulario.jsx';
import { sesion } from '../../lib/almacen.js';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function Entrar() {
  if (await sesion()) redirect('/');
  return <div className="wrap conAire"><Formulario /></div>;
}
