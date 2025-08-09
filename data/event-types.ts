export interface Question {
  id?: string; // Hacer la propiedad 'id' opcional
  type: 'text' | 'textarea' | 'email' | 'phone' | 'select' | 'radio' | 'checkbox';
  question: string;
  required: boolean;
  options?: string[];
}

export interface Location {
  type: 'video' | 'phone' | 'in-person' | 'custom';
  value: string;
  displayName: string;
}

export interface EventType {
  id: string;
  title: string;
  slug?: string; // Hacer slug opcional si el formulario no lo genera directamente
  description?: string;
  duration: number; // Siempre en minutos según el formulario
  location: Location;
  color: string;
  isActive: boolean;
  price: number;
  currency: string;
  settings: {
    showOnPublicPage: boolean;
    bufferTimeBefore: number;
    bufferTimeAfter: number;
    minimumNotice: number;
    maximumNotice: number;
    confirmationPolicy: 'instant' | 'manual';
    cancellationPolicy: number;
    redirectAfterBooking: string;
  };
  questions: Question[];
  createdAt: Date;
  updatedAt: Date;
}

// Mock data for public events
export const eventTypes: EventType[] = [
  {
    id: "1",
    title: "Consulta de Marketing Digital",
    slug: "consulta-marketing-digital",
    description: "Sesión de 30 minutos para revisar tu estrategia de marketing digital y identificar oportunidades de mejora.",
    duration: 30,
    location: {
      type: 'video',
      displayName: 'Google Meet',
      value: 'https://meet.google.com/xyz-abc-def'
    },
    color: "#3b82f6",
    isActive: true,
    price: 0,
    currency: 'USD',
    settings: {
      showOnPublicPage: true,
      bufferTimeBefore: 0,
      bufferTimeAfter: 0,
      minimumNotice: 60,
      maximumNotice: 4320,
      confirmationPolicy: 'instant',
      cancellationPolicy: 24,
      redirectAfterBooking: '',
    },
    questions: [],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: "2",
    title: "Reunión de Ventas",
    slug: "reunion-ventas",
    description: "Conversación para entender tus necesidades y ver cómo podemos ayudarte con nuestros servicios.",
    duration: 45,
    location: {
      type: 'in-person',
      displayName: 'Oficina Central',
      value: 'Av. Reforma 123, Ciudad de México'
    },
    color: "#10b981",
    isActive: true,
    price: 0,
    currency: 'USD',
    settings: {
      showOnPublicPage: true,
      bufferTimeBefore: 0,
      bufferTimeAfter: 0,
      minimumNotice: 60,
      maximumNotice: 4320,
      confirmationPolicy: 'instant',
      cancellationPolicy: 24,
      redirectAfterBooking: '',
    },
    questions: [],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: "3",
    title: "Workshop de Diseño UX",
    slug: "workshop-diseno-ux",
    description: "Taller práctico de 2 horas sobre principios fundamentales de diseño UX y experiencia de usuario.",
    duration: 120,
    location: {
      type: 'video',
      displayName: 'Zoom',
      value: 'https://zoom.us/j/123456789'
    },
    color: "#8b5cf6",
    isActive: true,
    price: 0,
    currency: 'USD',
    settings: {
      showOnPublicPage: true,
      bufferTimeBefore: 0,
      bufferTimeAfter: 0,
      minimumNotice: 60,
      maximumNotice: 4320,
      confirmationPolicy: 'instant',
      cancellationPolicy: 24,
      redirectAfterBooking: '',
    },
    questions: [],
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25')
  }
];