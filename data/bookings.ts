export interface Booking {
  id: string;
  eventTypeId: string;
  title: string;
  attendeeName: string;
  attendeeEmail: string;
  startTime: Date;
  endTime: Date;
  location: {
    type: 'online' | 'in-person-business' | 'in-person-client';
    displayName: string;
    details?: string;
  };
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'rescheduled';
  notes?: string;
  hostContact: {
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt?: Date;
}

export const bookings: Booking[] = [
  {
    id: "1",
    eventTypeId: "1",
    title: "Consulta de Marketing Digital",
    attendeeName: "Pedro Ramírez",
    attendeeEmail: "pedro@example.com",
    startTime: new Date("2024-02-15T10:00:00"),
    endTime: new Date("2024-02-15T10:30:00"),
    location: {
      type: 'online',
      displayName: 'Google Meet',
      details: 'https://meet.google.com/xyz-abc-def'
    },
    status: "confirmed",
    hostContact: {
      name: 'María González',
      email: 'maria@example.com'
    },
    createdAt: new Date("2024-02-10T09:00:00")
  },
  {
    id: "2",
    eventTypeId: "2",
    title: "Reunión de Ventas",
    attendeeName: "Laura Silva",
    attendeeEmail: "laura@example.com",
    startTime: new Date("2024-02-16T14:00:00"),
    endTime: new Date("2024-02-16T14:45:00"),
    location: {
      type: 'in-person-business',
      displayName: 'Oficina Central',
      details: 'Av. Reforma 123, Ciudad de México'
    },
    status: "pending",
    hostContact: {
      name: 'Carlos Martínez',
      email: 'carlos@example.com'
    },
    createdAt: new Date("2024-02-12T11:30:00")
  },
  {
    id: "3",
    eventTypeId: "1",
    title: "Consulta de Marketing Digital",
    attendeeName: "José Hernández",
    attendeeEmail: "jose@example.com",
    startTime: new Date("2024-02-14T15:00:00"),
    endTime: new Date("2024-02-14T15:30:00"),
    location: {
      type: 'online',
      displayName: 'Google Meet',
      details: 'https://meet.google.com/xyz-abc-def'
    },
    status: "completed",
    hostContact: {
      name: 'María González',
      email: 'maria@example.com'
    },
    createdAt: new Date("2024-02-08T16:45:00")
  }
];