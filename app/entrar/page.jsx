import Formulario from './Formulario.jsx';
import { sesionActual } from '../../lib/supabase.js';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function Entrar() {
  if (await sesionActual()) redirect('/');
  return <Formulario />;
}
