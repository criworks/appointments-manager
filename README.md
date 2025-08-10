# Appointments Manager (Clon estilo Cal.com)

[![CI](https://github.com/criworks/appointments-manager/actions/workflows/ci.yml/badge.svg)](https://github.com/criworks/appointments-manager/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/criworks/appointments-manager/branch/design/graph/badge.svg)](https://codecov.io/gh/criworks/appointments-manager)

Aplicación de agendamiento sin fricción (product-led): permite crear eventos sin autenticación, publicarlos y que terceros agenden horarios.

## Stack y versiones
- Next.js 15
- React 19
- TypeScript 5
- Supabase (DB + API)
- Shadcn UI / Radix
- date-fns 4
- Resend (Emails)
- React Email (@react-email/components, @react-email/render)
- Vitest + Testing Library (tests)

## Estructura relevante
- `app/(public-alpha)/product-page/page.tsx`: Landing. Lista eventos desde Supabase y CTA para crear evento.
- `app/(schedule)/create-event/page.tsx`: Formulario de creación de eventos.
- `app/(schedule)/create-event/created/[eventId]/page.tsx`: Confirmación de evento creado.
- `app/(schedule)/calendar-available/[eventId]/page.tsx`: Selección de fecha/hora (simplificada, desde Supabase).
- `app/(schedule)/contact/[eventId]/page.tsx`: Contacto/confirmación de reserva y envío de correos.
- `app/api/event-created/route.ts`: API para email de confirmación de evento al anfitrión.
- `emails/EventCreatedEmail.tsx`: Plantilla React Email.
- `lib/email.ts`: Utilidades centralizadas para emails (from, render, send, site URL).
- `lib/supabaseClient.ts`: Cliente Supabase.

## Configuración
Crear `.env.local` en raíz:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
RESEND_API_KEY=...
RESEND_FROM_EMAIL=Appointments App <no-reply@appointments.cri.works>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- `RESEND_FROM_EMAIL` debe usar un dominio verificado en Resend.
- `NEXT_PUBLIC_SITE_URL` se usa para CTAs en emails. En producción: `https://appointments.cri.works`.

## Base de datos (Supabase)
Ejecutar en SQL Editor:

```sql
create extension if not exists pgcrypto;

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  host_name text not null,
  host_email text not null,
  host_id uuid null,
  event_name text not null,
  url_slug text not null,
  description text null,
  event_type text not null check (event_type in ('Online','Presencial (negocio)','Presencial (cliente)')),
  online_url text null,
  address text null,
  duration_value integer not null,
  duration_unit text not null check (duration_unit in ('minutes','hours','days')),
  available_until date null,
  availability_days jsonb null default '{}'::jsonb,
  event_price numeric not null default 0
);

create unique index if not exists events_url_slug_key on public.events (url_slug);

alter table public.events enable row level security;

drop policy if exists "Public select events" on public.events;
create policy "Public select events" on public.events for select using (true);

drop policy if exists "Public insert events" on public.events;
create policy "Public insert events" on public.events for insert with check (true);
```

### Bookings
```sql
create extension if not exists btree_gist;

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  event_id uuid null,
  event_name text not null,

  host_name text not null,
  host_email text not null,

  attendee_name text not null,
  attendee_email text not null,

  start_time timestamptz not null,
  end_time timestamptz not null,

  location jsonb not null,
  status text not null check (status in ('confirmed','pending','cancelled','completed','rescheduled')),
  notes text null,

  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists bookings_event_idx on public.bookings(event_id);
create index if not exists bookings_host_email_idx on public.bookings(host_email);
create index if not exists bookings_attendee_email_idx on public.bookings(attendee_email);
create index if not exists bookings_start_time_idx on public.bookings(start_time);

create unique index if not exists bookings_event_start_unique
  on public.bookings(event_id, start_time);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'bookings_no_overlap_by_host'
  ) then
    alter table public.bookings
    add constraint bookings_no_overlap_by_host exclude using gist (
      host_email with =,
      tstzrange(start_time, end_time, '[)') with &&
    );
  end if;
end$$;

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_bookings_updated_at on public.bookings;
create trigger trg_bookings_updated_at
before update on public.bookings
for each row execute procedure public.set_updated_at();

alter table public.bookings enable row level security;

drop policy if exists "Public insert bookings" on public.bookings;
create policy "Public insert bookings" on public.bookings for insert using (true) with check (true);

drop policy if exists "Public select bookings" on public.bookings;
create policy "Public select bookings" on public.bookings for select using (true);

drop policy if exists "No public update bookings" on public.bookings;
create policy "No public update bookings" on public.bookings for update using (false) with check (false);

drop policy if exists "No public delete bookings" on public.bookings;
create policy "No public delete bookings" on public.bookings for delete using (false);
```

### Permisos y RLS (sin auth / futuro con auth)
- En este MVP, las políticas están abiertas para no bloquear el flujo: `select` e `insert` públicos en `events` y `bookings`; `update`/`delete` deshabilitados.
- Si vas a autenticar usuarios, te dejo estas abiertas ahora para no bloquear el flujo; luego las restringimos por `auth.uid()`/ownership.
  - Ejemplo futuro (orientativo):
    - Agregar `created_by uuid` en `events`/`bookings` con default `auth.uid()` y FK a `auth.users`.
    - `select` limitado a: dueño (`created_by = auth.uid()`), y/o reglas por rol (host vs. participante), y/o acceso por token temporal (magic link) fuera de RLS.
    - `insert` limitado a usuarios autenticados; `update`/`delete` sólo para el dueño.
  - Para participantes sin cuenta, preferir enlaces firmados (magic links) y no ampliar RLS pública.

## Desarrollo
- Instalar deps: `npm install`
- Correr dev: `npm run dev`
- Correr tests: `npm test`

## Flujo principal
1) Landing (`/product-page`): CTA “Crear evento” y listado de eventos.
2) Crear evento (`/create-event`): formulario; guarda en `events` con `url_slug` único.
3) Email al anfitrión: `POST /api/event-created` usa React Email + Resend.
4) Confirmación (`/create-event/created/[id]`): detalles con botón a la landing.

## Emails
- Plantilla: `emails/EventCreatedEmail.tsx`.
- Envío centralizado: `lib/email.ts`.
- Requisitos: dominio verificado en Resend.

## Tests
- `__tests__/create_event_flow.test.tsx`: flujo de creación (mock supabase+router+fetch).
- Vitest configurado con jsdom y plugin React.

## Deployment
- Variables de entorno en producción:
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (dominio verificado)
  - `NEXT_PUBLIC_SITE_URL=https://appointments.cri.works`
- Asegurar las políticas RLS si se requieren restricciones mayores (actualmente públicas para inserts/reads).

## Features actuales
- Crear eventos sin autenticación.
- Guardar eventos en Supabase.
- Listar eventos en landing desde DB.
- Slug único automático (`mi-slug`, `mi-slug-2`, ...).
- Email de confirmación al anfitrión (React Email + Resend).
- Confirmación tras crear evento.
- Selección de fecha/hora y contacto (flujo base).

## Roadmap cercano
- Mejoras en calendario y generación de horarios reales por disponibilidad (`availability_days`).
- Página de detalle de evento pública con URL por `url_slug`.
- Filtrado/búsqueda/paginación en landing.
- Validaciones UI (URLs, longitudes, feedback en tiempo real).
- Email de confirmación al participante + host al agendar (integración completa de `/api/send`).
- Limpieza de mocks antiguos y migración completa a datos de Supabase.

## Mejoras sugeridas (no implementadas aún)
- Reply-To configurable y etiquetas (tags) en Resend.
- Versión de texto plano en emails.
- Centralizar logs/telemetría (Sentry/console).
- Cache/ISR para landing.
- Políticas RLS más finas (p.ej., anti-spam, rate limits vía Edge/Middleware).
- Tema visual de emails y branding unificado.

## Consideraciones
- Modelo product-led: inserts públicos habilitados; revisar políticas antes de abrir a producción.
- Email depende de dominio verificado en Resend y formato válido del remitente.
- Ajustar `NEXT_PUBLIC_SITE_URL` según entorno para CTAs correctos.
