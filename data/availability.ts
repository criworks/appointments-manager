export interface TimeSlot {
    start: string;
    end: string;
  }
  
  export interface DayAvailability {
    day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    isEnabled: boolean;
    timeSlots: TimeSlot[];
  }
  
  export interface Schedule {
    id: string;
    name: string;
    isDefault: boolean;
    timezone: string;
    availability: DayAvailability[];
    dateOverrides: Array<{
      date: string;
      isAvailable: boolean;
      timeSlots?: TimeSlot[];
    }>;
  }
  
  export const availabilitySchedules: Schedule[] = [
    {
      id: 'default',
      name: 'Horario de trabajo',
      isDefault: true,
      timezone: 'America/Mexico_City',
      availability: [
        {
          day: 'monday',
          isEnabled: true,
          timeSlots: [
            { start: '09:00', end: '12:00' },
            { start: '14:00', end: '17:00' }
          ]
        },
        {
          day: 'tuesday',
          isEnabled: true,
          timeSlots: [
            { start: '09:00', end: '12:00' },
            { start: '14:00', end: '17:00' }
          ]
        },
        {
          day: 'wednesday',
          isEnabled: true,
          timeSlots: [
            { start: '09:00', end: '12:00' },
            { start: '14:00', end: '17:00' }
          ]
        },
        {
          day: 'thursday',
          isEnabled: true,
          timeSlots: [
            { start: '09:00', end: '12:00' },
            { start: '14:00', end: '17:00' }
          ]
        },
        {
          day: 'friday',
          isEnabled: true,
          timeSlots: [
            { start: '09:00', end: '12:00' },
            { start: '14:00', end: '16:00' }
          ]
        },
        {
          day: 'saturday',
          isEnabled: false,
          timeSlots: []
        },
        {
          day: 'sunday',
          isEnabled: false,
          timeSlots: []
        }
      ],
      dateOverrides: [
        {
          date: '2024-12-25',
          isAvailable: false
        },
        {
          date: '2024-01-01',
          isAvailable: false
        }
      ]
    },
    {
      id: 'flexible',
      name: 'Horario flexible',
      isDefault: false,
      timezone: 'America/Mexico_City',
      availability: [
        {
          day: 'monday',
          isEnabled: true,
          timeSlots: [
            { start: '10:00', end: '18:00' }
          ]
        },
        {
          day: 'tuesday',
          isEnabled: true,
          timeSlots: [
            { start: '10:00', end: '18:00' }
          ]
        },
        {
          day: 'wednesday',
          isEnabled: true,
          timeSlots: [
            { start: '10:00', end: '18:00' }
          ]
        },
        {
          day: 'thursday',
          isEnabled: true,
          timeSlots: [
            { start: '10:00', end: '18:00' }
          ]
        },
        {
          day: 'friday',
          isEnabled: true,
          timeSlots: [
            { start: '10:00', end: '18:00' }
          ]
        },
        {
          day: 'saturday',
          isEnabled: true,
          timeSlots: [
            { start: '11:00', end: '15:00' }
          ]
        },
        {
          day: 'sunday',
          isEnabled: false,
          timeSlots: []
        }
      ],
      dateOverrides: []
    }
  ];