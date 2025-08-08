// types/index.ts

// Tipos que reflejan la estructura de la base de datos Supabase
export interface DBEvent {
    id: string;
    host_name: string;
    event_name: string;
    event_duration: string;
    event_price: number;
    created_at: string; // ISO string from Supabase timestamp
}

export interface DBReservation {
    id: string;
    event_id: string;
    reservation_date_time: string;
    participant_name: string;
    participant_email: string;
    created_at: string;
}

// Tipos para usar en la aplicación
export interface Event {
    id: string;
    hostName: string;
    eventName: string;
    eventDuration: string;
    eventPrice: number;
}

export interface Reservation {
    id?: string;
    eventId: string;
    participantName: string;
    participantEmail: string;
    reservationDateTime: string;
    event?: Event;  // Opcional: para incluir los detalles del evento si es necesario
}

// Funciones de mapeo de DB a App
export function dbEventToEvent(dbEvent: DBEvent): Event {
    return {
        id: dbEvent.id,
        hostName: dbEvent.host_name,
        eventName: dbEvent.event_name,
        eventDuration: dbEvent.event_duration,
        eventPrice: dbEvent.event_price,
    };
}

export function dbReservationToReservation(dbReservation: DBReservation): Reservation {
    return {
        id: dbReservation.id,
        eventId: dbReservation.event_id,
        participantName: dbReservation.participant_name,
        participantEmail: dbReservation.participant_email,
        reservationDateTime: dbReservation.reservation_date_time,
    };
}

// Funciones de mapeo de App a DB
export function eventToDBEvent(event: Event): DBEvent {
    return {
        id: event.id,
        host_name: event.hostName,
        event_name: event.eventName,
        event_duration: event.eventDuration,
        event_price: event.eventPrice,
        created_at: new Date().toISOString() // Assuming creation on client-side for new events
    };
}

export function reservationToDBReservation(reservation: Reservation): DBReservation {
    return {
        id: reservation.id,
        event_id: reservation.eventId,
        participant_name: reservation.participantName,
        participant_email: reservation.participantEmail,
        reservation_date_time: reservation.reservationDateTime,
        created_at: new Date().toISOString() // Assuming creation on client-side
    };
}