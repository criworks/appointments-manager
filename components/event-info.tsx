import * as React from "react";
import { Event } from "@/types";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type EventInfoProps = Omit<Event, 'id' | 'eventPrice' | 'urlSlug' | 'availableFrom' | 'availableUntil' | 'availabilityDays' | 'createdAt' | 'hostId'> & {
  scheduledDate?: string;
  scheduledTime?: string;
};

const EventInfo: React.FC<EventInfoProps> = ({
  hostName,
  eventName,
  description,
  eventType,
  onlineUrl,
  address,
  durationValue,
  durationUnit,
  hostEmail,
  scheduledDate,
  scheduledTime,
}) => {
  const formattedDuration = `${durationValue} ${durationUnit === 'minutes' ? 'min' : durationUnit === 'hours' ? 'h' : 'd'}`;

  return (
    <div className="max-w-[325px] space-y-4 p-4 border rounded-lg shadow-sm">
      <div className="text-lg text-gray-500">{hostName}</div>
      <div className="text-xl font-medium">{eventName}</div>
      <div className="text-sm text-gray-700 mt-2">{description}</div>

      <div className="space-y-2 text-sm text-gray-500">
        {/* Cuándo */}
        {scheduledDate && scheduledTime && (
          <div>
            <p className="font-semibold">Cuándo</p>
            <div>{format(new Date(scheduledDate), 'PPP', { locale: es })}</div>
            <div>{scheduledTime}</div>
          </div>
        )}

        {/* Tipo de Evento y Ubicación */}
        <div>
          <p className="font-semibold">Tipo de evento</p>
          <div>{eventType}</div>
          {eventType === 'Online' && onlineUrl && (
            <> 
              <p className="font-semibold mt-2">Dirección Web</p>
              <a href={onlineUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {onlineUrl}
              </a>
            </>
          )}
          {(eventType === 'Presencial (negocio)' || eventType === 'Presencial (cliente)') && address && (
            <> 
              <p className="font-semibold mt-2">Dirección</p>
              <div>{address}</div>
            </>
          )}
        </div>

        {/* Duración */}
        <div>
          <p className="font-semibold">Duración</p>
          <div>{formattedDuration}</div>
        </div>

        {/* Contacto del Anfitrión */}
        <div>
          <p className="font-semibold">Contacto del Anfitrión</p>
          <div>{hostEmail}</div>
        </div>
      </div>
    </div>
  );
};

export default EventInfo;