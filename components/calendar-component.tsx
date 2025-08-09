'use client';

import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CalendarIcon } from 'lucide-react';
import { format, addDays, isSameDay, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import type { EventType, Booking } from '@/types';

interface CalendarComponentProps {
  eventType: EventType;
  existingBookings: Booking[];
  onTimeSelect: (date: Date, time: string) => void;
  selectedDate?: Date;
  selectedTime?: string;
}

export function CalendarComponent({ 
  eventType, 
  existingBookings, 
  onTimeSelect,
  selectedDate,
  selectedTime 
}: CalendarComponentProps) {
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(selectedDate);

  const getAvailableTimeSlots = (date: Date) => {
    const dayName = format(date, 'EEEE', { locale: es }).toLowerCase();
    const dayMapping: { [key: string]: keyof typeof eventType.weeklyAvailability } = {
      'lunes': 'monday',
      'martes': 'tuesday', 
      'miércoles': 'wednesday',
      'jueves': 'thursday',
      'viernes': 'friday',
      'sábado': 'saturday',
      'domingo': 'sunday'
    };
    
    const mappedDay = dayMapping[dayName];
    if (!mappedDay || !eventType.weeklyAvailability[mappedDay].enabled) {
      return [];
    }

    const timeSlots = eventType.weeklyAvailability[mappedDay].timeSlots;
    const availableSlots: string[] = [];

    timeSlots.forEach(slot => {
      const [startHour, startMinute] = slot.from.split(':').map(Number);
      const [endHour, endMinute] = slot.to.split(':').map(Number);
      
      const startTime = startHour * 60 + startMinute;
      const endTime = endHour * 60 + endMinute;
      const durationInMinutes = eventType.durationUnit === 'hours' 
        ? eventType.duration * 60 
        : eventType.durationUnit === 'days'
        ? eventType.duration * 24 * 60
        : eventType.duration;

      for (let time = startTime; time + durationInMinutes <= endTime; time += 30) {
        const hour = Math.floor(time / 60);
        const minute = time % 60;
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // Check if this time slot is already booked
        const isBooked = existingBookings.some(booking => 
          isSameDay(booking.startTime, date) && 
          booking.startTime.getHours() === hour && 
          booking.startTime.getMinutes() === minute &&
          booking.status !== 'cancelled'
        );

        if (!isBooked) {
          availableSlots.push(timeString);
        }
      }
    });

    return availableSlots;
  };

  const handleDateSelect = (date: Date | undefined) => {
    setCalendarDate(date);
  };

  const handleTimeClick = (time: string) => {
    if (calendarDate) {
      onTimeSelect(calendarDate, time);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Selecciona una fecha</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={calendarDate}
            onSelect={handleDateSelect}
            disabled={(date) => {
              const today = startOfDay(new Date());
              return date < today;
            }}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      {calendarDate && (
        <Card>
          <CardHeader>
            <CardTitle>
              Horarios disponibles - {format(calendarDate, 'PPPP', { locale: es })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {getAvailableTimeSlots(calendarDate).map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTimeClick(time)}
                  className="text-sm"
                >
                  {time}
                </Button>
              ))}
            </div>
            {getAvailableTimeSlots(calendarDate).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay horarios disponibles para esta fecha
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {calendarDate && selectedTime && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumen de la cita</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                <span>{format(calendarDate, 'PPPP', { locale: es })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>{selectedTime}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}