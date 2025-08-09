'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { useRouter } from 'next/navigation';
import { Reservation, Event } from "@/types";
import { format, parseISO, addMinutes, addHours, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

interface ConfirmationClientProps {
  reservation: Reservation;
  event: Event;
}

export default function ConfirmationClient({ reservation, event }: ConfirmationClientProps) {
  const router = useRouter();

  // Convertir reservationDateTime a un objeto Date
  const reservationDateTime = parseISO(reservation.reservationDateTime);
  const scheduledDate = format(reservationDateTime, 'PPP', { locale: es });
  const scheduledTime = format(reservationDateTime, 'HH:mm');

  const endTime = calculateEndTime(reservationDateTime, event.durationValue, event.durationUnit);

  return (
    <div className="max-w-[540px] mx-auto space-y-10">
      <Card className="text-center">
        <CardHeader className="p-10">
          <CalendarIcon className="h-12 w-12 mx-auto text-gray-500" />
          <CardTitle className="text-2xl font-bold mt-4">Agendamiento realizado con éxito</CardTitle>
          <p className="text-gray-500 mt-2">
            Te enviamos una invitación con todos los detalles a tu email ({reservation.participantEmail})
          </p>
        </CardHeader>
        <CardContent className="space-y-4 text-left p-10 pt-0">
          <div>
            <p className="font-semibold">Evento:</p>
            <p>{event.eventName}</p>
            {event.description && <p className="text-sm text-gray-700 mt-1">{event.description}</p>}
          </div>
          <div>
            <p className="font-semibold">Cuándo:</p>
            <p>{scheduledDate}</p>
            <p>De {scheduledTime} a {endTime} horas</p>
          </div>
          <div>
            <p className="font-semibold">Dónde:</p>
            <p>{event.eventType}</p>
            {event.eventType === 'Online' && event.onlineUrl && (
              <a href={event.onlineUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {event.onlineUrl}
              </a>
            )}
            {(event.eventType === 'Presencial (negocio)' || event.eventType === 'Presencial (cliente)') && event.address && (
              <p>{event.address}</p>
            )}
          </div>
          <div>
            <p className="font-semibold">Organiza:</p>
            <p>{event.hostName} ({event.hostEmail})</p>
          </div>
          {event.eventPrice > 0 && (
            <div>
              <p className="font-semibold">Precio:</p>
              <p>${event.eventPrice}</p>
            </div>
          )}
          <div className="mt-4">
            <p className="text-lg font-semibold">¿Necesitas hacer un cambio?</p>
            <div className="flex space-x-4 justify-center mt-2">
              <Button variant="outline">Reagendar</Button>
              <Button variant="outline">Anular</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="text-center mt-10">
        <p className="text-gray-500 mb-4">
          Tú también puedes recibir agendamientos creando eventos gratis en este proyecto
        </p>
        <Button variant="default" onClick={() => router.push('/create-event')}>Crear evento</Button>
      </div>
    </div>
  );
}

// Función auxiliar para calcular la hora de finalización
function calculateEndTime(startTime: Date, durationValue: number, durationUnit: 'minutes' | 'hours' | 'days'): string {
  let endTime: Date;
  if (durationUnit === 'minutes') {
    endTime = addMinutes(startTime, durationValue);
  } else if (durationUnit === 'hours') {
    endTime = addHours(startTime, durationValue);
  } else if (durationUnit === 'days') {
    endTime = addDays(startTime, durationValue);
  } else {
    endTime = startTime; // Fallback
  }
  return format(endTime, 'HH:mm');
}

