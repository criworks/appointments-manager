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
- `app/(marketing-page-pub-a)/product-page/page.tsx`: Landing pública con listado de eventos.
- `app/(create-event-magnet)/create-event/page.tsx`: Formulario de creación de eventos.
- `app/(create-event-magnet)/create-event/created/[eventId]/page.tsx`: Confirmación de evento creado.
- `app/(booking-flow)/calendar-available/[eventId]/page.tsx`: Selección de fecha/hora.
- `app/(booking-flow)/contact/[eventId]/page.tsx`: Contacto y confirmación de booking.
- `app/(booking-flow)/confirmation/[bookingId]/page.tsx`: Confirmación de booking leyendo desde Supabase.
- `app/(host-platform)/catalogue/page.tsx`: Catálogo del host.
- `app/api/event-created/route.ts`: API de email para evento creado.
- `app/api/booking-created/route.ts`: API que guarda booking y envía emails (host + participante).
- `emails/EventCreatedEmail.tsx` y `emails/BookingCreatedEmail.tsx`: Plantillas React Email.
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

### Booking (agendamiento)
1) Selección de evento en landing y navegación a `calendar-available/[eventId]`.
2) Selección de día/hora y paso a `contact/[eventId]`.
3) Enviar formulario: el cliente llama a `POST /api/booking-created` con los datos del evento y participante.
4) La API inserta en `public.bookings`, envía emails al participante y al host, y retorna `{ bookingId }`.
5) El cliente redirige a `confirmation/[bookingId]` usando una ruta relativa para respetar el dominio actual (evita redirigir a localhost en producción).

## Emails
- Plantillas: `emails/EventCreatedEmail.tsx` y `emails/BookingCreatedEmail.tsx`.
- Envío centralizado: `lib/email.ts`.
- Requisitos: dominio verificado en Resend.

Notas:
- `NEXT_PUBLIC_SITE_URL` se usa para CTAs dentro del contenido de los emails (no para redirecciones de la app). En producción debe apuntar al dominio productivo para que los links de emails sean correctos.

## Tests
- `__tests__/create_event_flow.test.tsx`: flujo de creación (mock supabase+router+fetch).
- Vitest configurado con jsdom y plugin React.
- `__tests__/contact_booking_flow.test.tsx`: flujo booking desde Contact (submit + redirect).
- `__tests__/confirmation_page.test.tsx`: confirmación `[bookingId]` lee Supabase.
- `__tests__/api_booking_created.test.ts`: API `/api/booking-created` inserta y envía emails.

## Deployment
- Variables de entorno en producción:
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (dominio verificado)
  - `NEXT_PUBLIC_SITE_URL=https://appointments.cri.works` (se usa en CTAs de emails)
- Asegurar las políticas RLS si se requieren restricciones mayores (actualmente públicas para inserts/reads).

CI/CD:
- Workflow de CI ejecuta tests y cobertura en pushes/PRs a `main` y `design`.
- Codecov sube `coverage/lcov.info`. Si es repo privado o falla, añadir `CODECOV_TOKEN` en GitHub Actions Secrets.

## Features actuales
- Crear eventos sin autenticación.
- Guardar eventos en Supabase (`public.events`).
- Listar eventos en landing desde DB.
- Slug único automático (`mi-slug`, `mi-slug-2`, ...).
- Email de confirmación al anfitrión (React Email + Resend) usando `emails/EventCreatedEmail.tsx`.
- Confirmación tras crear evento.
- Flujo de booking completo:
  - Selección de fecha/hora en `calendar-available/[eventId]`.
  - Paso de contacto en `contact/[eventId]`.
  - Llamada a `POST /api/booking-created` (inserta en `public.bookings`, envía emails a participante y host con `emails/BookingCreatedEmail.tsx`).
  - Redirección relativa a `confirmation/[bookingId]` para respetar el dominio actual.
  - Página de confirmación lee los datos reales desde Supabase.

## Roadmap cercano
- Disponibilidad real: generar slots en base a `availability_days`, zona horaria y buffers.
- Prevención de conflictos: check anti-solapamiento por host y bloqueo de slots ocupados en UI.
- Detalle de evento pública por `url_slug` con calendario embebido.
- Mejoras de UX en landing: filtros, búsqueda y paginación.
- Emails:
  - Añadir `Reply-To`, versión de texto plano, y branding unificado.
  - Adjuntar archivo ICS y link “Añadir al calendario”.
  - Manejo de zonas horarias coherente entre email y UI.
- Gestión de booking: cancelación/reprogramación (con token seguro para invitados), notificaciones.
- Seguridad y Auth:
  - RLS por ownership (`created_by = auth.uid()`), roles host/participant.
  - Limitar `insert/select` anónimos cuando integremos auth.
  - Rate limits en API (middleware/edge) y protección anti-spam.
- Observabilidad: logs centralizados y Sentry.
- CI/CD: mantener cobertura, publicar reporte en Codecov, badge por rama principal.

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

## Troubleshooting
- Emails no llegan:
  - Verifica `RESEND_API_KEY` y que `RESEND_FROM_EMAIL` use un dominio verificado.
  - Asegura que los campos `to`/`from` sean emails válidos; hay validación en `lib/email.ts`.
- Links de email apuntan a localhost:
  - Ajusta `NEXT_PUBLIC_SITE_URL` al dominio productivo; los CTAs de los emails usan esa variable.
  - La app redirige con rutas relativas (p. ej. `/confirmation/:id`) para evitar forzar hostname.
- Error al insertar booking por solapamiento:
  - El constraint `bookings_no_overlap_by_host` bloquea reservas solapadas por `host_email`. Cambia hora o desactívalo si no aplica a tu caso.
- 401/403 en Supabase con RLS:
  - En este MVP, RLS permite `select/insert` públicos. Si cambiaste políticas, revisa que el cliente use claves válidas o adapta las políticas a tu caso de uso.
