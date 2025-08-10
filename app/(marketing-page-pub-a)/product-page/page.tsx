export const dynamic = 'force-dynamic'

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarPlus } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Badge } from '@/components/ui/badge';
import { EventCard } from '@/components/event-card';

export default async function ProductPage() {
  const { data: events } = await supabase
    .from('events')
    .select('id, event_name, description, event_type, duration_value, duration_unit, host_name, url_slug, online_url, address, event_price')
    .order('created_at', { ascending: false });

  return (
    <>

      {/* Hero */}
      <section className="text-center mt-10 flex flex-col gap-10">
        <div className="mb-4 flex flex-col items-center">
          <Badge variant="secondary">Proyecto Portfolio</Badge>
          <span className="mt-2 text-lg font-semibold">Agendamientos</span>
        </div>

        <div className='flex flex-col gap-4 items-center'>
          <h1 className="text-4xl lg:text-5xl font-bold">
            Crea eventos
            <br />
            Recibe agendamientos
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">Crea eventos para que la gente que invites reserve en tu agenda</p>
          <div className="flex items-center justify-center gap-4">

            <Button className="mt-4" variant="default" asChild>
              <Link href="/create-event">
                <CalendarPlus className="mr-2 w-4 h-4" />
                Crear evento
              </Link>
            </Button>

          </div>
        </div>
        
      </section>

      
      {/* Events Section */}
      {(events && events.length > 0) && (
        <section>
          <h4 className="text-xl font-semibold mb-4">Eventos creados por usuarios</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((evt) => (
              <EventCard
                key={evt.id}
                id={evt.id}
                hostName={evt.host_name}
                eventName={evt.event_name}
                durationValue={evt.duration_value}
                durationUnit={evt.duration_unit}
                eventType={evt.event_type}
                url_slug={evt.url_slug}
                description={evt.description}
                eventPrice={evt.event_price}
              />

            ))}
          </div>
        </section>
      )}

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Agendamiento fácil</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Establece tu disponibilidad y permite que otros agenden tiempo contigo automáticamente.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Múltiples tipos de eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Crea diferentes tipos de reuniones con duraciones y configuraciones personalizadas.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Integración con calendario <Badge variant="secondary">Pronto</Badge></CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Sincroniza con Google Calendar, Outlook y otras aplicaciones de calendario populares.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}