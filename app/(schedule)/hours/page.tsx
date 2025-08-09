'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { EventType } from '@/types';

export default function HoursPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    duration: 30,
    durationUnit: 'minutes' as 'minutes' | 'hours' | 'days',
    eventDate: new Date(),
    type: 'online' as 'online' | 'in-person-business' | 'in-person-client',
    locationDetails: '',
    hostName: '',
    hostEmail: '',
    weeklyAvailability: {
      monday: { enabled: true, timeSlots: [{ from: '09:00', to: '17:00' }] },
      tuesday: { enabled: true, timeSlots: [{ from: '09:00', to: '17:00' }] },
      wednesday: { enabled: true, timeSlots: [{ from: '09:00', to: '17:00' }] },
      thursday: { enabled: true, timeSlots: [{ from: '09:00', to: '17:00' }] },
      friday: { enabled: true, timeSlots: [{ from: '09:00', to: '17:00' }] },
      saturday: { enabled: false, timeSlots: [] },
      sunday: { enabled: false, timeSlots: [] }
    }
  });

  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  const handleDayToggle = (day: keyof typeof formData.weeklyAvailability, enabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      weeklyAvailability: {
        ...prev.weeklyAvailability,
        [day]: {
          enabled,
          timeSlots: enabled ? [{ from: '09:00', to: '17:00' }] : []
        }
      }
    }));
  };

  const handleTimeSlotChange = (
    day: keyof typeof formData.weeklyAvailability, 
    index: number, 
    field: 'from' | 'to', 
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      weeklyAvailability: {
        ...prev.weeklyAvailability,
        [day]: {
          ...prev.weeklyAvailability[day],
          timeSlots: prev.weeklyAvailability[day].timeSlots.map((slot, i) =>
            i === index ? { ...slot, [field]: value } : slot
          )
        }
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here we would normally save to Supabase
    console.log('Saving event:', formData);
    
    // For now, redirect to catalogue
    router.push('/catalogue');
  };

  const getLocationDisplayName = () => {
    switch (formData.type) {
      case 'online':
        return 'Online';
      case 'in-person-business':
        return 'Oficina';
      case 'in-person-client':
        return 'A domicilio';
      default:
        return 'Por definir';
    }
  };

  const getDayLabel = (day: string) => {
    const labels = {
      monday: 'Lunes',
      tuesday: 'Martes', 
      wednesday: 'Miércoles',
      thursday: 'Jueves',
      friday: 'Viernes',
      saturday: 'Sábado',
      sunday: 'Domingo'
    };
    return labels[day as keyof typeof labels];
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-3xl font-bold">Crear nuevo evento</h1>
        <p className="text-muted-foreground">
          Configura tu evento para que otros puedan agendar contigo
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Información básica */}
        <Card>
          <CardHeader>
            <CardTitle>Información del evento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Nombre del evento *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="ej. Consulta de Marketing Digital"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL del evento *</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">calclone.com/</span>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="consulta-marketing-digital"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe brevemente de qué trata tu evento..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duración *</Label>
                <div className="flex gap-2">
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 1 }))}
                    className="flex-1"
                    required
                  />
                  <Select 
                    value={formData.durationUnit} 
                    onValueChange={(value: 'minutes' | 'hours' | 'days') => 
                      setFormData(prev => ({ ...prev, durationUnit: value }))
                    }
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minutes">min</SelectItem>
                      <SelectItem value="hours">h</SelectItem>
                      <SelectItem value="days">d</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Fecha del evento *</Label>
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.eventDate ? (
                        format(formData.eventDate, 'PPP', { locale: es })
                      ) : (
                        <span>Selecciona una fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.eventDate}
                      onSelect={(date) => {
                        if (date) {
                          setFormData(prev => ({ ...prev, eventDate: date }));
                          setDatePickerOpen(false);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tipo de evento y ubicación */}
        <Card>
          <CardHeader>
            <CardTitle>Ubicación del evento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de evento *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value: 'online' | 'in-person-business' | 'in-person-client') => 
                  setFormData(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="in-person-business">Presencial (negocio)</SelectItem>
                  <SelectItem value="in-person-client">Presencial (cliente)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="locationDetails">
                {formData.type === 'online' 
                  ? 'Dirección web (ej. enlace de Zoom, Meet, etc.)'
                  : 'Dirección domiciliaria'
                } *
              </Label>
              <Input
                id="locationDetails"
                value={formData.locationDetails}
                onChange={(e) => setFormData(prev => ({ ...prev, locationDetails: e.target.value }))}
                placeholder={
                  formData.type === 'online' 
                    ? 'https://zoom.us/j/123456789'
                    : 'Calle 123, Colonia, Ciudad'
                }
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Disponibilidad semanal */}
        <Card>
          <CardHeader>
            <CardTitle>Disponibilidad semanal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(formData.weeklyAvailability).map(([day, config]) => (
              <div key={day} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={config.enabled}
                    onCheckedChange={(enabled) => handleDayToggle(day as keyof typeof formData.weeklyAvailability, enabled)}
                  />
                  <Label className="min-w-[80px]">{getDayLabel(day)}</Label>
                </div>
                
                {config.enabled ? (
                  <div className="flex items-center gap-2">
                    <Label className="text-sm text-muted-foreground">Desde</Label>
                    <Input
                      type="time"
                      value={config.timeSlots[0]?.from || '09:00'}
                      onChange={(e) => handleTimeSlotChange(day as keyof typeof formData.weeklyAvailability, 0, 'from', e.target.value)}
                      className="w-24"
                    />
                    <Label className="text-sm text-muted-foreground">Hasta</Label>
                    <Input
                      type="time"
                      value={config.timeSlots[0]?.to || '17:00'}
                      onChange={(e) => handleTimeSlotChange(day as keyof typeof formData.weeklyAvailability, 0, 'to', e.target.value)}
                      className="w-24"
                    />
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">No disponible</span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Tarjeta de contacto */}
        <Card>
          <CardHeader>
            <CardTitle>Tarjeta de contacto del anfitrión</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hostName">Nombre completo *</Label>
              <Input
                id="hostName"
                value={formData.hostName}
                onChange={(e) => setFormData(prev => ({ ...prev, hostName: e.target.value }))}
                placeholder="Tu nombre completo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hostEmail">Email de contacto *</Label>
              <Input
                id="hostEmail"
                type="email"
                value={formData.hostEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, hostEmail: e.target.value }))}
                placeholder="tu@email.com"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" className="flex-1">
            Crear evento
          </Button>
        </div>
      </form>
    </div>
  );
}