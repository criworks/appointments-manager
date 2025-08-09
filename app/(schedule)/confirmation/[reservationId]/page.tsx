'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin, Video, Phone, Globe, User } from 'lucide-react';
import type { Location } from '@/data/event-types';

// Definir Booking localmente según lo guardado en sessionStorage
interface Booking {
  id: string;
  eventTypeId: string;
  title: string;
  attendeeName: string;
  attendeeEmail: string;
  startTime: Date;
  endTime: Date;
  location: Location;
  status: 'pending' | 'confirmed';
  createdAt: Date;
  hostContact?: { name: string; email: string }; // opcional por compatibilidad
}

function getLocationIcon(type: Location['type']) {
  switch (type) {
    case 'video':
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
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    // Get booking data from sessionStorage
    const bookingData = sessionStorage.getItem('completedBooking');
    if (bookingData) {
      const parsed = JSON.parse(bookingData);
      // Convert date strings back to Date objects
      parsed.startTime = new Date(parsed.startTime);
      parsed.endTime = new Date(parsed.endTime);
      parsed.createdAt = new Date(parsed.createdAt);
      setBooking(parsed as Booking);
    }
  }, []);

  if (!booking) {
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
            : 'Tu solicitud ha sido enviada y recibirás una confirmación pronto.'
          }
        </p>
      </div>

      <Card className="text-left">
        <CardHeader>
          <CardTitle>Detalles de la cita</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong>Evento:</strong> {booking.title}
          </div>
          <div>
            <strong>Fecha:</strong> {booking.startTime.toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
          <div>
            <strong>Hora:</strong> {booking.startTime.toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit'
            })} - {booking.endTime.toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
          <div className="flex items-center gap-2">
            <strong>Ubicación:</strong>
            {getLocationIcon(booking.location.type)}
            <span>{booking.location.displayName}</span>
          </div>
          {booking.hostContact?.name && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span>
                <strong>Anfitrión:</strong> {booking.hostContact.name}
              </span>
            </div>
          )}
          <div>
            <strong>Participante:</strong> {booking.attendeeName}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Se ha enviado un email de confirmación a <strong>{booking.attendeeEmail}</strong>
          {booking.hostContact?.email && (
            <>
              {' '}y a <strong>{booking.hostContact.email}</strong>
            </>
          )}
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