"use client";

import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import EventInfo from "@/components/event-info";
import { HoursAvailable } from "@/components/hours-available";
import { useParams, useRouter } from 'next/navigation';
import { Event, DBEvent, dbEventToEvent } from "@/types";
import { supabase } from "@/lib/supabaseClient";

const CalendarAvailable: React.FC = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [event, setEvent] = useState<Event | null>(null);
  const [selectedHour, setSelectedHour] = useState<string | null>(null);
  const [availableHours, setAvailableHours] = useState<string[]>([]);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const fetchEvent = async () => {
      const eventId = params.eventId as string;
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) {
        console.error('Error fetching event:', error);
        return;
      }

      if (data) {
        const fetchedEvent: Event = dbEventToEvent(data as DBEvent);
        setEvent(fetchedEvent);
      }
    };

    fetchEvent();

    // Simular la obtención de fechas disponibles
    const today = new Date();
    const simulatedAvailableDates = Array.from({ length: 15 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      return date;
    });
    setAvailableDates(simulatedAvailableDates);
    setDate(today);
  }, [params.eventId]);

  useEffect(() => {
    if (date) {
      // Simular la obtención de horas disponibles
      const simulatedAvailableHours = [
        "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"
      ];
      setAvailableHours(simulatedAvailableHours);
    }
  }, [date]);

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      setSelectedHour(null);
    }
  };

  const handleHourSelect = (hour: string) => {
    setSelectedHour(hour);
    console.log("Hora seleccionada:", hour); // Para depuración
  };

  useEffect(() => {
    console.log("Estado de selectedHour actualizado:", selectedHour); // Para depuración
  }, [selectedHour]);

  const handleSchedule = () => {
    if (event && date && selectedHour) {
      const formattedDate = date.toISOString().split('T')[0];
      router.push(`/contact/${event.id}?date=${formattedDate}&time=${selectedHour}`);
    }
  };

  if (!event) return <div>Cargando...</div>;

  return (
    <div className="flex space-x-10">
      <EventInfo
        hostName={event.hostName}
        eventName={event.eventName}
        eventDuration={event.eventDuration}
        scheduledDate={date.toLocaleDateString()}
        scheduledTime={selectedHour || ""}
      />
      <div className="flex-grow">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          className="rounded-md border"
          disabled={(date) => !availableDates.some(d => d.toDateString() === date.toDateString())}
        />
      </div>
      <HoursAvailable 
        date={date}
        availableHours={availableHours}
        onHourSelect={handleHourSelect}
        onSchedule={handleSchedule}
        selectedHour={selectedHour}
      />
    </div>
  );
};

export default CalendarAvailable;