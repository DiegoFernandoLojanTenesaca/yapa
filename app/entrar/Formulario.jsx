'use client';

import { useActionState, useState } from 'react';
import { entrar, registrarse } from '../acciones.js';

export default function Formulario() {
  const [nuevo, setNuevo] = useState(false);
  const [estado, enviar, pendiente] = useActionState(nuevo ? registrarse : entrar, null);

  return (
    <div className="centro">
      <h1>{nuevo ? 'Crear cuenta' : 'Entrar'}</h1>
      <p className="sub" style={{ marginBottom: 22 }}>
        {nuevo
          ? 'Con tu cuenta guardás promos y elegís qué bancos te interesan.'
          : 'Entrá para ver tus favoritas y tus bancos.'}
      </p>

      {estado?.error && <div className="aviso mal">{estado.error}</div>}
      {estado?.ok && <div className="aviso ok">{estado.ok}</div>}

      <form action={enviar}>
        {nuevo && (
          <div className="campo">
            <label htmlFor="nombre">Nombre</label>
            <input id="nombre" name="nombre" autoComplete="name" />
          </div>
        )}

        <div className="campo">
          <label htmlFor="email">Correo</label>
          <input id="email" name="email" type="email" required autoComplete="email" />
        </div>

        <div className="campo">
          <label htmlFor="clave">Contraseña</label>
          <input
            id="clave"
            name="clave"
            type="password"
            required
            minLength={8}
            autoComplete={nuevo ? 'new-password' : 'current-password'}
          />
        </div>

        <button className="btn" style={{ width: '100%' }} disabled={pendiente}>
          {pendiente ? 'Un momento…' : nuevo ? 'Crear cuenta' : 'Entrar'}
        </button>
      </form>

      <p className="sub" style={{ marginTop: 18, textAlign: 'center' }}>
        {nuevo ? '¿Ya tenés cuenta?' : '¿No tenés cuenta?'}{' '}
        <button
          className="btn sec chico"
          style={{ marginLeft: 4 }}
          onClick={() => setNuevo(!nuevo)}
        >
          {nuevo ? 'Entrar' : 'Registrate'}
        </button>
      </p>
    </div>
  );
}
