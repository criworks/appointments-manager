'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContactForm } from '@/components/contact-form';
import { ArrowLeft, Clock, MapPin, Video, Globe, User, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/lib/supabaseClient';

interface BookingSelection {
  eventId: string;
  date: string;
  time: string;
}

type SupabaseEvent = {
  id: string;
  host_name: string;
  host_email: string;
  event_name: string;
  description?: string;
  event_type: 'Online' | 'Presencial (negocio)' | 'Presencial (cliente)';
  online_url?: string;
  address?: string;
  duration_value: number;
  duration_unit: 'minutes' | 'hours' | 'days';
};

function getDurationLabelFromDB(evt: SupabaseEvent) {
  const unit = evt.duration_unit === 'minutes' ? 'm' : evt.duration_unit === 'hours' ? 'h' : 'd';
  return `${evt.duration_value}${unit}`;
}

function getLocationIconFromDB(eventType: SupabaseEvent['event_type']) {
  switch (eventType) {
    case 'Online':
      return <Video className="w-4 h-4" />;
    default:
      return <MapPin className="w-4 h-4" />;
  }
}

export default function ContactPage() {
  const router = useRouter();
  const params = useParams() as { eventId: string };
  const eventId = params.eventId;
  const [bookingSelection, setBookingSelection] = useState<BookingSelection | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [event, setEvent] = useState<SupabaseEvent | null>(null);

  useEffect(() => {
    const selection = sessionStorage.getItem('selectedBooking');
    if (selection) {
      setBookingSelection(JSON.parse(selection));
    } else {
      router.push(`/calendar-available/${eventId}`);
    }
  }, [eventId, router]);

  useEffect(() => {
    (async () => {
      const isUuidLike = (value: string) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
      const column = isUuidLike(eventId) ? 'id' : 'url_slug';
      const { data, error } = await supabase
        .from('events')
        .select('id, host_name, host_email, event_name, description, event_type, online_url, address, duration_value, duration_unit')
        .eq(column, eventId)
        .single();
      if (!error && data) setEvent(data as SupabaseEvent);
    })();
  }, [eventId]);

  if (!bookingSelection || !event) {
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

  const selectedDate = new Date(bookingSelection.date);

  const handleBooking = async (contactData: { name: string; email: string }) => {
    setIsLoading(true);

    try {
      const [hour, minute] = bookingSelection.time.split(':').map(Number);
      const startTime = new Date(selectedDate);
      startTime.setHours(hour, minute, 0, 0);
      const endTime = new Date(startTime);
      if (event.duration_unit === 'days') endTime.setDate(endTime.getDate() + event.duration_value);
      else if (event.duration_unit === 'hours') endTime.setHours(endTime.getHours() + event.duration_value);
      else endTime.setMinutes(endTime.getMinutes() + event.duration_value);
      // 1) Crear booking y enviar emails vía API
      const res = await fetch('/api/booking-created', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          eventName: event.event_name,
          eventType: event.event_type,
          onlineUrl: event.online_url,
          address: event.address,
          durationValue: event.duration_value,
          durationUnit: event.duration_unit,
          hostName: event.host_name,
          hostEmail: event.host_email,
          attendeeName: contactData.name,
          attendeeEmail: contactData.email,
          date: format(selectedDate, 'yyyy-MM-dd'),
          time: bookingSelection.time,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'No se pudo crear el booking');
      }

      const { bookingId, confirmationUrl } = (await res.json()) as { bookingId: string; confirmationUrl: string };

      // 2) Guardar booking en sessionStorage para la página de confirmación (opcional)
      const completedBooking = {
        id: bookingId,
        eventTypeId: event.id,
        title: event.event_name,
        attendeeName: contactData.name,
        attendeeEmail: contactData.email,
        startTime,
        endTime,
        location: {
          type: event.event_type === 'Online' ? 'video' : 'in-person',
          displayName: event.event_type === 'Online' ? 'Online' : 'Presencial',
          value: event.online_url || event.address || '',
        },
        status: 'confirmed',
        createdAt: new Date(),
        hostContact: event.host_email || event.host_name
          ? { name: event.host_name, email: event.host_email }
          : undefined,
      };

      sessionStorage.setItem('completedBooking', JSON.stringify(completedBooking));
      sessionStorage.removeItem('selectedBooking');

      // 3) Redirigir a la página de confirmación devuelta por el API
      router.push(confirmationUrl);
    } catch (error) {
      console.error('Error creating booking:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Button variant="ghost" asChild className="mb-6">
        <Link href={`/calendar-available/${eventId}`}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al calendario
        </Link>
      </Button>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Detalles del evento con hora seleccionada */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{event.event_name}</h1>
            {event.description && (
              <p className="text-muted-foreground text-lg">{event.description}</p>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detalles de la cita</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-5 h-5 text-muted-foreground" />
                <span className="text-lg">{format(selectedDate, 'PPPP', { locale: es })}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <span className="text-lg">{bookingSelection.time} ({getDurationLabelFromDB(event)})</span>
              </div>
              <div className="flex items-center gap-3">
                {getLocationIconFromDB(event.event_type)}
                <span className="text-lg">{event.event_type === 'Online' ? 'Online' : 'Presencial'}</span>
              </div>
              {Boolean(event.online_url || event.address) && (
                <div className="text-sm text-muted-foreground break-all">
                  <strong>Detalles:</strong> {event.online_url || event.address}
                </div>
              )}
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <span className="text-lg">{event.host_name}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formulario de contacto */}
        <div className="space-y-6">
          <ContactForm onSubmit={handleBooking} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}