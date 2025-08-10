'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin, Video, Phone, Globe, User } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

type DbLocation = {
  type: 'online' | 'in-person' | 'phone' | 'custom';
  displayName: string;
  details?: string;
};

type DbBooking = {
  id: string;
  event_name: string;
  host_name: string;
  host_email: string;
  attendee_name: string;
  attendee_email: string;
  start_time: string;
  end_time: string;
  location: DbLocation;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'rescheduled';
};

function getLocationIcon(type: DbLocation['type']) {
  switch (type) {
    case 'online':
      return <Video className="w-4 h-4" />;
    case 'phone':
      return <Phone className="w-4 h-4" />;
    case 'in-person':
      return <MapPin className="w-4 h-4" />;
    case 'custom':
    default:
      return <Globe className="w-4 h-4" />;
  }
}

export default function ConfirmationPage() {
  const params = useParams() as { bookingId: string };
  const bookingId = params.bookingId;
  const [booking, setBooking] = useState<DbBooking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select('id, event_name, host_name, host_email, attendee_name, attendee_email, start_time, end_time, location, status')
        .eq('id', bookingId)
        .single();
      if (!error && data) setBooking(data as DbBooking);
      setLoading(false);
    })();
  }, [bookingId]);

  const startDate = useMemo(() => (booking ? new Date(booking.start_time) : null), [booking]);
  const endDate = useMemo(() => (booking ? new Date(booking.end_time) : null), [booking]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <Card>
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold mb-2">Cargando...</h1>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!booking || !startDate || !endDate) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <Card>
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold mb-2">Reserva no encontrada</h1>
            <p className="text-muted-foreground mb-4">
              No se pudo encontrar la información de tu reserva.
            </p>
            <Button asChild>
              <Link href="/catalogue">Volver al catálogo</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 text-center space-y-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <Calendar className="w-8 h-8 text-green-600" />
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold">
          {booking.status === 'confirmed' ? '¡Cita confirmada!' : '¡Solicitud enviada!'}
        </h1>
        <p className="text-muted-foreground text-lg">
          {booking.status === 'confirmed'
            ? 'Tu cita ha sido confirmada exitosamente. Se han enviado emails de confirmación a ambas partes.'
            : 'Tu solicitud ha sido enviada y recibirás una confirmación pronto.'}
        </p>
      </div>

      <Card className="text-left">
        <CardHeader>
          <CardTitle>Detalles de la cita</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong>Evento:</strong> {booking.event_name}
          </div>
          <div>
            <strong>Fecha:</strong> {startDate.toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
          <div>
            <strong>Hora:</strong> {startDate.toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
            })}{' '}
            -{' '}
            {endDate.toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
          <div className="flex items-center gap-2">
            <strong>Ubicación:</strong>
            {getLocationIcon(booking.location?.type || 'custom')}
            <span>{booking.location?.displayName || '—'}</span>
          </div>
          {booking.location?.details && (
            <div className="text-sm text-muted-foreground break-all">
              <strong>Detalles:</strong> {booking.location.details}
            </div>
          )}
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span>
              <strong>Anfitrión:</strong> {booking.host_name}
            </span>
          </div>
          <div>
            <strong>Participante:</strong> {booking.attendee_name}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Se ha enviado un email de confirmación a <strong>{booking.attendee_email}</strong> y a{' '}
          <strong>{booking.host_email}</strong>
        </p>
        <div className="flex gap-3">
          <Button variant="outline" asChild className="flex-1">
            <Link href="/catalogue">Volver al catálogo</Link>
          </Button>
          <Button asChild className="flex-1">
            <Link href="/hours">Crear mi evento</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}


