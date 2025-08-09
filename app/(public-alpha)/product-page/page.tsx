export const dynamic = 'force-dynamic'

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Video, User } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

function formatDuration(value: number, unit: 'minutes' | 'hours' | 'days') {
  const u = unit === 'minutes' ? 'm' : unit === 'hours' ? 'h' : 'd';
  return `${value}${u}`;
}

export default async function ProductPage() {
  const { data: events } = await supabase
    .from('events')
    .select('id, event_name, description, event_type, duration_value, duration_unit, host_name, url_slug, online_url, address')
    .order('created_at', { ascending: false });

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold">Infraestructura de agendamiento para todos</h1>
        <p className="text-xl text-muted-foreground">
          Conecta tu calendario, establece tu disponibilidad y permite que las personas agenden reuniones contigo.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/create-event">Crear evento</Link>
          </Button>
        </div>
      </div>

      {(events && events.length > 0) && (
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Eventos disponibles</h2>
            <p className="text-muted-foreground">Agenda una reunión directamente desde aquí</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {events.map((evt) => (
              <Card key={evt.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{evt.event_name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {evt.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{evt.description}</p>
                  )}
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{formatDuration(evt.duration_value, evt.duration_unit)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {evt.event_type === 'Online' ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                      <span>{evt.event_type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{evt.host_name}</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" asChild>
                    <Link href={`/calendar-available/${evt.url_slug || evt.id}`}>Agendar reunión</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="mt-20 grid md:grid-cols-3 gap-8">
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
            <CardTitle>Integración con calendario</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Sincroniza con Google Calendar, Outlook y otras aplicaciones de calendario populares.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}