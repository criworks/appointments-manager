export interface EventType {
    id: string;
    title: string;
    slug: string;
    description?: string;
    duration: number;
    durationUnit: 'minutes' | 'hours' | 'days';
    eventDate: Date;
    type: 'online' | 'in-person-business' | 'in-person-client';
    location: {
      type: 'online' | 'in-person-business' | 'in-person-client';
      displayName: string;
      details?: string; // URL for online, address for in-person
    };
    hostContact: {
      name: string;
      email: string;
    };
    weeklyAvailability: {
      [key in 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday']: {
        enabled: boolean;
        timeSlots: {
          from: string;
          to: string;
        }[];
      };
    };
    color: string;
    isActive: boolean;
    settings: {
      showOnPublicPage: boolean;
      requireConfirmation: boolean;
      bufferTime?: number;
    };
    createdAt: Date;
    updatedAt: Date;
  }
  
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
  
  export interface Schedule {
    id: string;
    name: string;
    timezone: string;
    isDefault: boolean;
    availability: {
      day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
      isEnabled: boolean;
      timeSlots: {
        start: string;
        end: string;
      }[];
    }[];
  }
  
  // Mock data for public events
  export const eventTypes: EventType[] = [
    {
      id: "1",
      title: "Consulta de Marketing Digital",
      slug: "consulta-marketing-digital",
      description: "Sesión de 30 minutos para revisar tu estrategia de marketing digital y identificar oportunidades de mejora.",
      duration: 30,
      durationUnit: 'minutes',
      eventDate: new Date('2024-12-15'),
      type: 'online',
      location: {
        type: 'online',
        displayName: 'Google Meet',
        details: 'https://meet.google.com/xyz-abc-def'
      },
      hostContact: {
        name: 'María González',
        email: 'maria@example.com'
      },
      weeklyAvailability: {
        monday: {
          enabled: true,
          timeSlots: [
            { from: '09:00', to: '12:00' },
            { from: '14:00', to: '17:00' }
          ]
        },
        tuesday: {
          enabled: true,
          timeSlots: [
            { from: '09:00', to: '12:00' },
            { from: '14:00', to: '17:00' }
          ]
        },
        wednesday: {
          enabled: true,
          timeSlots: [
            { from: '09:00', to: '12:00' },
            { from: '14:00', to: '17:00' }
          ]
        },
        thursday: {
          enabled: true,
          timeSlots: [
            { from: '09:00', to: '12:00' },
            { from: '14:00', to: '17:00' }
          ]
        },
        friday: {
          enabled: true,
          timeSlots: [
            { from: '09:00', to: '12:00' }
          ]
        },
        saturday: { enabled: false, timeSlots: [] },
        sunday: { enabled: false, timeSlots: [] }
      },
      color: "#3b82f6",
      isActive: true,
      settings: {
        showOnPublicPage: true,
        requireConfirmation: false
      },
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: "2",
      title: "Reunión de Ventas",
      slug: "reunion-ventas",
      description: "Conversación para entender tus necesidades y ver cómo podemos ayudarte con nuestros servicios.",
      duration: 45,
      durationUnit: 'minutes',
      eventDate: new Date('2024-12-20'),
      type: 'in-person-business',
      location: {
        type: 'in-person-business',
        displayName: 'Oficina Central',
        details: 'Av. Reforma 123, Ciudad de México'
      },
      hostContact: {
        name: 'Carlos Martínez',
        email: 'carlos@example.com'
      },
      weeklyAvailability: {
        monday: {
          enabled: true,
          timeSlots: [
            { from: '10:00', to: '16:00' }
          ]
        },
        tuesday: {
          enabled: true,
          timeSlots: [
            { from: '10:00', to: '16:00' }
          ]
        },
        wednesday: {
          enabled: true,
          timeSlots: [
            { from: '10:00', to: '16:00' }
          ]
        },
        thursday: {
          enabled: true,
          timeSlots: [
            { from: '10:00', to: '16:00' }
          ]
        },
        friday: {
          enabled: true,
          timeSlots: [
            { from: '10:00', to: '14:00' }
          ]
        },
        saturday: { enabled: false, timeSlots: [] },
        sunday: { enabled: false, timeSlots: [] }
      },
      color: "#10b981",
      isActive: true,
      settings: {
        showOnPublicPage: true,
        requireConfirmation: true
      },
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20')
    },
    {
      id: "3",
      title: "Workshop de Diseño UX",
      slug: "workshop-diseno-ux",
      description: "Taller práctico de 2 horas sobre principios fundamentales de diseño UX y experiencia de usuario.",
      duration: 2,
      durationUnit: 'hours',
      eventDate: new Date('2024-12-25'),
      type: 'online',
      location: {
        type: 'online',
        displayName: 'Zoom',
        details: 'https://zoom.us/j/123456789'
      },
      hostContact: {
        name: 'Ana López',
        email: 'ana@example.com'
      },
      weeklyAvailability: {
        monday: { enabled: false, timeSlots: [] },
        tuesday: { enabled: false, timeSlots: [] },
        wednesday: {
          enabled: true,
          timeSlots: [
            { from: '18:00', to: '21:00' }
          ]
        },
        thursday: { enabled: false, timeSlots: [] },
        friday: { enabled: false, timeSlots: [] },
        saturday: {
          enabled: true,
          timeSlots: [
            { from: '10:00', to: '14:00' }
          ]
        },
        sunday: { enabled: false, timeSlots: [] }
      },
      color: "#8b5cf6",
      isActive: true,
      settings: {
        showOnPublicPage: true,
        requireConfirmation: false
      },
      createdAt: new Date('2024-01-25'),
      updatedAt: new Date('2024-01-25')
    }
  ];
  
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
    }
  ];