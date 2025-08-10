'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import slugify from 'slugify'

interface AvailabilityDay {
  start: string;
  end: string;
}

type EventType = 'Online' | 'Presencial (negocio)' | 'Presencial (cliente)';
type DurationUnit = 'minutes' | 'hours' | 'days';

const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function CreateEventPage() {
  const router = useRouter()

  const [eventName, setEventName] = useState<string>('')
  const [urlSlug, setUrlSlug] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [eventType, setEventType] = useState<EventType>('Online')
  const [onlineUrl, setOnlineUrl] = useState<string>('')
  const [address, setAddress] = useState<string>('')
  const [durationValue, setDurationValue] = useState<number>(30)
  const [durationUnit, setDurationUnit] = useState<DurationUnit>('minutes')
  const [availableFrom, setAvailableFrom] = useState<Date | undefined>(new Date())
  const [availableUntil, setAvailableUntil] = useState<Date | undefined>(undefined)
  const [availabilityDays, setAvailabilityDays] = useState<{ [key: string]: AvailabilityDay[] }>(
    Object.fromEntries(daysOfWeek.map(day => [day, [{ start: '09:00', end: '17:00' }]]))
  )
  const [isDayActive, setIsDayActive] = useState<{ [key: string]: boolean }>(
    Object.fromEntries(daysOfWeek.map(day => [day, true]))
  )
  const [hostName, setHostName] = useState<string>('')
  const [hostEmail, setHostEmail] = useState<string>('')
  const [eventPrice, setEventPrice] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  // Generar slug automáticamente al cambiar el nombre del evento
  useEffect(() => {
    if (eventName && !urlSlug) {
      setUrlSlug(slugify(eventName, { lower: true, strict: true }));
    }
  }, [eventName, urlSlug]);

  const handleAvailabilityChange = (day: string, type: 'start' | 'end', value: string, index: number = 0) => {
    setAvailabilityDays(prev => ({
      ...prev,
      [day]: [{ ...prev[day][index], [type]: value }]
    }));
  };

  const handleToggleDay = (day: string, checked: boolean) => {
    setIsDayActive(prev => ({ ...prev, [day]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Generar slug base y asegurar unicidad en DB
    const baseSlug = (urlSlug || slugify(eventName, { lower: true, strict: true })).trim();
    const ensureUniqueSlug = async (candidate: string) => {
      let unique = candidate;
      let suffix = 1;
      // Verificamos si existe; si existe, incrementamos sufijo
      // Usamos head + count para no traer filas
      // Nota: count puede venir null si head=true en algunas versiones; fallback a comprobar error
      // Por simplicidad, si count no está disponible, intentamos single() y comprobamos data
      // Bucle con tope razonable
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { count, error } = await supabase
          .from('events')
          .select('id', { head: true, count: 'exact' })
          .eq('url_slug', unique);
        if (error) {
          // si falla el count, intentamos consulta alternativa
          const { data } = await supabase
            .from('events')
            .select('id')
            .eq('url_slug', unique)
            .limit(1);
          if (!data || data.length === 0) break;
        } else if (!count || count === 0) {
          break;
        }
        suffix += 1;
        unique = `${candidate}-${suffix}`;
        if (suffix > 100) break; // safety
      }
      return unique;
    };

    const finalSlug = await ensureUniqueSlug(baseSlug);

    // Construir payload para Supabase (snake_case)
    const payload = {
      host_name: hostName,
      host_email: hostEmail,
      event_name: eventName,
      url_slug: finalSlug,
      description,
      event_type: eventType,
      online_url: eventType === 'Online' ? onlineUrl : null,
      address: eventType !== 'Online' ? address : null,
      duration_value: durationValue,
      duration_unit: durationUnit,
      available_until: availableUntil ? format(availableUntil, 'yyyy-MM-dd') : null,
      availability_days: Object.fromEntries(
        Object.entries(availabilityDays).filter(([day]) => isDayActive[day])
      ),
      event_price: eventPrice,
    } as const;

    try {
      const { data, error } = await supabase
        .from('events')
        .insert([payload])
        .select('id, host_name, host_email, event_name, event_type, online_url, address, duration_value, duration_unit')
        .single();

      if (error) {
        console.error('Error creating event:', error);
        setIsSubmitting(false);
        return;
      }

      // Actualizar UI con el slug final generado
      setUrlSlug(finalSlug);

      // Email al anfitrión (best-effort)
      try {
        await fetch('/api/event-created', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hostEmail: data.host_email,
            hostName: data.host_name,
            eventName: data.event_name,
            eventType: data.event_type,
            onlineUrl: data.online_url,
            address: data.address,
            durationValue: data.duration_value,
            durationUnit: data.duration_unit,
          }),
        });
      } catch (e) {
        console.warn('No se pudo enviar email de evento creado:', e);
      }

      // Redirigir a confirmación del evento creado
      router.push(`/create-event/created/${data.id}`);
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 text-center">Crear Nuevo Evento</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
        {/* Nombre del evento */}
        <div>
          <Label htmlFor="eventName">Nombre del Evento</Label>
          <Input
            id="eventName"
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="Mi Evento de Prueba"
            required
            className="mt-1"
          />
        </div>

        {/* URL Slug */}
        <div>
          <Label htmlFor="urlSlug">URL Slug</Label>
          <Input
            id="urlSlug"
            type="text"
            value={urlSlug}
            onChange={(e) => setUrlSlug(e.target.value)}
            placeholder="mi-evento-de-prueba"
            required
            className="mt-1"
          />
          <p className="text-sm text-gray-500 mt-1">
            https://yourdomain.com/
            <span className="font-semibold text-blue-600">{urlSlug || '[tu-slug]'}</span>
          </p>
        </div>

        {/* Descripción */}
        <div>
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Una breve descripción de tu evento..."
            rows={4}
            className="mt-1"
          />
        </div>

        {/* Tipo de Evento */}
        <div>
          <Label htmlFor="eventType">Tipo de Evento</Label>
          <Select value={eventType} onValueChange={(value: EventType) => setEventType(value)}>
            <SelectTrigger className="w-full mt-1">
              <SelectValue placeholder="Selecciona un tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Online">Online</SelectItem>
              <SelectItem value="Presencial (negocio)">Presencial (negocio)</SelectItem>
              <SelectItem value="Presencial (cliente)">Presencial (cliente)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Campos Condicionales de Dirección */}
        {eventType === 'Online' && (
          <div>
            <Label htmlFor="onlineUrl">Dirección Web (URL)</Label>
            <Input
              id="onlineUrl"
              type="url"
              value={onlineUrl}
              onChange={(e) => setOnlineUrl(e.target.value)}
              placeholder="https://meet.google.com/xyz"
              required
              className="mt-1"
            />
          </div>
        )}

        {(eventType === 'Presencial (negocio)' || eventType === 'Presencial (cliente)') && (
          <div>
            <Label htmlFor="address">Dirección Domiciliaria</Label>
            <Input
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Calle Falsa, Springfield"
              required
              className="mt-1"
            />
          </div>
        )}

        {/* Duración */}
        <div className="flex items-end space-x-2">
          <div className="grow">
            <Label htmlFor="durationValue">Duración</Label>
            <Input
              id="durationValue"
              type="number"
              value={durationValue}
              onChange={(e) => setDurationValue(Number(e.target.value))}
              min={1}
              required
              className="mt-1"
            />
          </div>
          <Select value={durationUnit} onValueChange={(value: DurationUnit) => setDurationUnit(value)}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Unidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="minutes">minutos</SelectItem>
              <SelectItem value="hours">horas</SelectItem>
              <SelectItem value="days">días</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Rango de Fechas Disponibles */}
        <div>
          <Label>Rango de Fechas Disponibles</Label>
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={"w-full justify-start text-left font-normal"}
                >
                  {availableFrom ? format(availableFrom, "PPP", { locale: es }) : <span>Fecha de inicio</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={availableFrom}
                  onSelect={setAvailableFrom}
                  initialFocus
                  locale={es}
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={"w-full justify-start text-left font-normal"}
                >
                  {availableUntil ? format(availableUntil, "PPP", { locale: es }) : <span>Fecha de fin (opcional)</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={availableUntil}
                  onSelect={setAvailableUntil}
                  initialFocus
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Disponibilidad por Día de la Semana */}
        <div>
          <Label className="block mb-2">Disponibilidad (Horas)</Label>
          {daysOfWeek.map(day => (
            <div key={day} className="flex items-center space-x-4 mb-3">
              <Checkbox
                id={`day-${day}`}
                checked={isDayActive[day]}
                onCheckedChange={(checked) => handleToggleDay(day, checked as boolean)}
              />
              <Label htmlFor={`day-${day}`} className="w-24">
                {day}
              </Label>
              {isDayActive[day] ? (
                <div className="flex space-x-2">
                  <Input
                    type="time"
                    value={availabilityDays[day]?.[0]?.start || '09:00'}
                    onChange={(e) => handleAvailabilityChange(day, 'start', e.target.value)}
                    className="w-auto"
                  />
                  <span>-</span>
                  <Input
                    type="time"
                    value={availabilityDays[day]?.[0]?.end || '17:00'}
                    onChange={(e) => handleAvailabilityChange(day, 'end', e.target.value)}
                    className="w-auto"
                  />
                </div>
              ) : (
                <span className="text-gray-500">No disponible</span>
              )}
            </div>
          ))}
        </div>

        {/* Tarjeta de Contacto */}
        <h2 className="text-xl font-semibold mt-8 mb-4">Información de Contacto del Anfitrión</h2>
        <div>
          <Label htmlFor="hostName">Tu Nombre</Label>
          <Input
            id="hostName"
            type="text"
            value={hostName}
            onChange={(e) => setHostName(e.target.value)}
            placeholder="Tu Nombre Completo"
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="hostEmail">Tu Email</Label>
          <Input
            id="hostEmail"
            type="email"
            value={hostEmail}
            onChange={(e) => setHostEmail(e.target.value)}
            placeholder="tu.email@ejemplo.com"
            required
            className="mt-1"
          />
        </div>

        {/* Precio del Evento (si aplica) */}
        <div>
          <Label htmlFor="eventPrice">Precio del Evento (opcional)</Label>
          <Input
            id="eventPrice"
            type="number"
            value={eventPrice}
            onChange={(e) => setEventPrice(Number(e.target.value))}
            placeholder="0"
            min={0}
            className="mt-1"
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Creando Evento...' : 'Crear Evento'}
        </Button>
      </form>
    </div>
  );
}
