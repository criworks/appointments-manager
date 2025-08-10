'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon, Clock, MapPin, Video, User } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { HoursAvailable } from '@/components/hours-available';
import { supabase } from '@/lib/supabaseClient';

interface SupabaseEvent {
  id: string;
  host_name: string;
  event_name: string;
  description?: string;
  event_type: 'Online' | 'Presencial (negocio)' | 'Presencial (cliente)';
  online_url?: string;
  address?: string;
  duration_value: number;
  duration_unit: 'minutes' | 'hours' | 'days';
}

export default function CalendarAvailablePage() {
  const router = useRouter();
  const params = useParams() as { eventId: string };
  const eventId = params.eventId;

  const [event, setEvent] = useState<SupabaseEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  function isUuidLike(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  }

  useEffect(() => {
    (async () => {
      const column = isUuidLike(eventId) ? 'id' : 'url_slug';
      const { data } = await supabase
        .from('events')
        .select('id, host_name, event_name, description, event_type, online_url, address, duration_value, duration_unit')
        .eq(column, eventId)
        .single();
      if (data) setEvent(data as SupabaseEvent);
    })();
  }, [eventId]);

  const availableHours = useMemo(() => {
    // Simplificado: slots cada 30 min de 09:00 a 17:00
    const slots: string[] = [];
    if (!selectedDate) return slots;
    const startHour = 9;
    const endHour = 17;
    for (let h = startHour; h < endHour; h++) {
      slots.push(`${String(h).padStart(2, '0')}:00`);
      slots.push(`${String(h).padStart(2, '0')}:30`);
    }
    return slots;
  }, [selectedDate]);

  const handleContinue = () => {
    if (!selectedDate || !selectedTime || !event) return;
    sessionStorage.setItem(
      'selectedBooking',
      JSON.stringify({ eventId: event.id, date: selectedDate.toISOString(), time: selectedTime })
    );
    router.push(`/contact/${event.id}`);
  };

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h1 className="text-2xl font-bold mb-2">Cargando...</h1>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/catalogue">
          <ArrowLeftIcon />
          Volver a eventos
        </Link>
      </Button>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{event.event_name}</h1>
            {event.description && <p className="text-muted-foreground text-lg">{event.description}</p>}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <span className="text-lg">
                {event.duration_value}
                {event.duration_unit === 'minutes' ? 'm' : event.duration_unit === 'hours' ? 'h' : 'd'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {event.event_type === 'Online' ? (
                <Video className="w-5 h-5 text-muted-foreground" />
              ) : (
                <MapPin className="w-5 h-5 text-muted-foreground" />
              )}
              <span className="text-lg">{event.event_type}</span>
            </div>

            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-muted-foreground" />
              <span className="text-lg">{event.host_name}</span>
            </div>
          </div>

          {(event.online_url || event.address) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detalles del evento</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground break-all">
                  <strong>Ubicación:</strong> {event.online_url || event.address}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(d) => setSelectedDate(d as Date)}
              locale={es}
              className="rounded-md border"
            />
          </div>

          <HoursAvailable
            date={selectedDate}
            availableHours={availableHours}
            selectedHour={selectedTime}
            onHourSelect={setSelectedTime}
            onSchedule={handleContinue}
          />
        </div>
      </div>
    </div>
  );
}

function ArrowLeftIcon() {
  return (
    <span className="inline-flex items-center">
      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5" />
        <path d="M12 19l-7-7 7-7" />
      </svg>
    </span>
  );
}