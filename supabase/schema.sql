-- Yapa — esquema completo.
-- Pegar tal cual en Supabase → SQL Editor → Run.

-- ─────────────────────────── perfiles ───────────────────────────
-- Supabase guarda las credenciales en auth.users (no se toca).
-- Acá va lo nuestro: el rol y los bancos que le interesan al usuario.

create table if not exists public.perfiles (
  id      uuid primary key references auth.users on delete cascade,
  email   text,
  nombre  text,
  rol     text not null default 'usuario' check (rol in ('usuario', 'admin')),
  bancos  text[] not null default '{}',
  creado  timestamptz not null default now()
);

-- Perfil automático al registrarse.
create or replace function public.manejar_usuario_nuevo()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.perfiles (id, email, nombre)
  values (new.id, new.email, new.raw_user_meta_data ->> 'nombre')
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists al_crear_usuario on auth.users;
create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.manejar_usuario_nuevo();

-- security definer: sin esto, la policy de perfiles se consultaría a sí misma.
create or replace function public.es_admin()
returns boolean language sql security definer stable set search_path = '' as $$
  select exists (
    select 1 from public.perfiles
    where id = (select auth.uid()) and rol = 'admin'
  );
$$;

-- ──────────────────────────── promos ────────────────────────────

create table if not exists public.promos (
  id          text primary key,
  fuente      text not null,
  banco       text,
  comercio    text not null,
  titulo      text not null,
  detalle     text,
  categoria   text not null default 'otros',
  ciudad      text not null default 'todo_el_pais',
  vence       date,
  codigo      text,
  url         text,
  imagen      text,
  publicada   boolean not null default true,
  destacada   boolean not null default false,
  -- Si el admin la editó a mano, el scraper diario no la vuelve a pisar.
  editada     boolean not null default false,
  -- Deja de aparecer en el origen -> activa = false, en vez de borrarla.
  activa      boolean not null default true,
  creada      timestamptz not null default now(),
  actualizada timestamptz not null default now()
);

create index if not exists idx_promos_visibles on public.promos (publicada, activa, vence);
create index if not exists idx_promos_fuente   on public.promos (fuente);
create index if not exists idx_promos_busqueda on public.promos (categoria, banco, ciudad);

-- ─────────────────────────── favoritos ──────────────────────────

create table if not exists public.favoritos (
  usuario_id uuid not null references auth.users on delete cascade,
  promo_id   text not null references public.promos on delete cascade,
  creado     timestamptz not null default now(),
  primary key (usuario_id, promo_id)
);

-- ──────────────────── corridas del scraper ──────────────────────
-- Alimenta el panel: de dónde se trajeron los datos y cómo salió.

create table if not exists public.corridas (
  id          bigint generated always as identity primary key,
  fecha       timestamptz not null default now(),
  fuente      text not null,
  encontradas integer not null default 0,
  nuevas      integer not null default 0,
  archivadas  integer not null default 0,
  error       text
);

create index if not exists idx_corridas_fecha on public.corridas (fecha desc);

-- ───────────────────── seguridad por fila ───────────────────────

alter table public.perfiles  enable row level security;
alter table public.promos    enable row level security;
alter table public.favoritos enable row level security;
alter table public.corridas  enable row level security;

-- perfiles: cada quien el suyo; el admin ve todos.
drop policy if exists "perfil propio visible" on public.perfiles;
create policy "perfil propio visible" on public.perfiles for select
  using ((select auth.uid()) = id or public.es_admin());

drop policy if exists "perfil propio editable" on public.perfiles;
create policy "perfil propio editable" on public.perfiles for update
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- promos: cualquiera (incluso sin cuenta) ve las publicadas y vigentes.
drop policy if exists "promos publicas" on public.promos;
create policy "promos publicas" on public.promos for select
  using ((publicada and activa and (vence is null or vence >= current_date)) or public.es_admin());

drop policy if exists "solo admin escribe promos" on public.promos;
create policy "solo admin escribe promos" on public.promos for all
  using (public.es_admin()) with check (public.es_admin());

-- favoritos: estrictamente privados.
drop policy if exists "favoritos propios" on public.favoritos;
create policy "favoritos propios" on public.favoritos for all
  using ((select auth.uid()) = usuario_id) with check ((select auth.uid()) = usuario_id);

-- corridas: solo el panel.
drop policy if exists "corridas solo admin" on public.corridas;
create policy "corridas solo admin" on public.corridas for select
  using (public.es_admin());

-- ────────────────────────────────────────────────────────────────
-- HACETE ADMIN: registrate primero en la app, y después corré esto
-- con tu correo:
--
--   update public.perfiles set rol = 'admin'
--   where email = 'fernando.lojan10@gmail.com';
-- ────────────────────────────────────────────────────────────────
