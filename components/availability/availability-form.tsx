import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Plus, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Schedule, DayAvailability, TimeSlot } from "../../data/availability";

interface AvailabilityFormProps {
  schedule?: Schedule;
  onSave: (schedule: Partial<Schedule>) => void;
  onCancel: () => void;
}

const daysOfWeek = [
  { key: 'monday' as const, label: 'Lunes' },
  { key: 'tuesday' as const, label: 'Martes' },
  { key: 'wednesday' as const, label: 'Miércoles' },
  { key: 'thursday' as const, label: 'Jueves' },
  { key: 'friday' as const, label: 'Viernes' },
  { key: 'saturday' as const, label: 'Sábado' },
  { key: 'sunday' as const, label: 'Domingo' }
];

const timezones = [
  'America/Mexico_City',
  'America/New_York',
  'Europe/London',
  'Europe/Madrid',
  'America/Los_Angeles',
  'Asia/Tokyo'
];

export function AvailabilityForm({ schedule, onSave, onCancel }: AvailabilityFormProps) {
  const [formData, setFormData] = useState({
    name: schedule?.name || '',
    isDefault: schedule?.isDefault || false,
    timezone: schedule?.timezone || 'America/Mexico_City',
    availability: schedule?.availability || daysOfWeek.map(day => ({
      day: day.key,
      isEnabled: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(day.key),
      timeSlots: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(day.key) 
        ? [{ start: '09:00', end: '17:00' }] 
        : []
    })),
    dateOverrides: schedule?.dateOverrides || []
  });

  const [selectedDate, setSelectedDate] = useState<Date>();
  const [overrideType, setOverrideType] = useState<'unavailable' | 'custom'>('unavailable');
  const [customTimes, setCustomTimes] = useState<TimeSlot[]>([{ start: '09:00', end: '17:00' }]);

  const updateDayAvailability = (dayKey: string, field: keyof DayAvailability, value: any) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.map(day =>
        day.day === dayKey ? { ...day, [field]: value } : day
      )
    }));
  };

  const addTimeSlot = (dayKey: string) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.map(day =>
        day.day === dayKey 
          ? { ...day, timeSlots: [...day.timeSlots, { start: '09:00', end: '17:00' }] }
          : day
      )
    }));
  };

  const updateTimeSlot = (dayKey: string, index: number, field: 'start' | 'end', value: string) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.map(day =>
        day.day === dayKey 
          ? {
              ...day,
              timeSlots: day.timeSlots.map((slot, i) =>
                i === index ? { ...slot, [field]: value } : slot
              )
            }
          : day
      )
    }));
  };

  const removeTimeSlot = (dayKey: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.map(day =>
        day.day === dayKey 
          ? { ...day, timeSlots: day.timeSlots.filter((_, i) => i !== index) }
          : day
      )
    }));
  };

  const copyDay = (fromDay: string, toDay: string) => {
    const sourceDay = formData.availability.find(day => day.day === fromDay);
    if (!sourceDay) return;

    setFormData(prev => ({
      ...prev,
      availability: prev.availability.map(day =>
        day.day === toDay 
          ? { ...day, isEnabled: sourceDay.isEnabled, timeSlots: [...sourceDay.timeSlots] }
          : day
      )
    }));
  };

  const addDateOverride = () => {
    if (!selectedDate) return;

    const dateString = format(selectedDate, 'yyyy-MM-dd');
    const override = {
      date: dateString,
      isAvailable: overrideType === 'custom',
      timeSlots: overrideType === 'custom' ? customTimes : undefined
    };

    setFormData(prev => ({
      ...prev,
      dateOverrides: [...prev.dateOverrides.filter(o => o.date !== dateString), override]
    }));

    setSelectedDate(undefined);
    setCustomTimes([{ start: '09:00', end: '17:00' }]);
  };

  const removeDateOverride = (date: string) => {
    setFormData(prev => ({
      ...prev,
      dateOverrides: prev.dateOverrides.filter(o => o.date !== date)
    }));
  };

  const generateTimeOptions = () => {
    const times = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 15) {
        const hour = h.toString().padStart(2, '0');
        const minute = m.toString().padStart(2, '0');
        times.push(`${hour}:${minute}`);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información del horario</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del horario</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Horario de trabajo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Zona horaria</Label>
            <Select
              value={formData.timezone}
              onValueChange={(value) => setFormData(prev => ({ ...prev, timezone: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timezones.map(tz => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="default"
              checked={formData.isDefault}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isDefault: checked }))}
            />
            <Label htmlFor="default">Usar como horario predeterminado</Label>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="weekly" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="weekly">Horario semanal</TabsTrigger>
          <TabsTrigger value="overrides">Excepciones</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Disponibilidad semanal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {daysOfWeek.map((day) => {
                const dayAvailability = formData.availability.find(a => a.day === day.key);
                if (!dayAvailability) return null;

                return (
                  <div key={day.key} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Switch
                          checked={dayAvailability.isEnabled}
                          onCheckedChange={(checked) => 
                            updateDayAvailability(day.key, 'isEnabled', checked)
                          }
                        />
                        <Label className="font-medium w-20">{day.label}</Label>
                      </div>
                      
                      {dayAvailability.isEnabled && (
                        <div className="flex items-center gap-2">
                          <Select onValueChange={(fromDay) => copyDay(fromDay, day.key)}>
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Copiar de..." />
                            </SelectTrigger>
                            <SelectContent>
                              {daysOfWeek
                                .filter(d => d.key !== day.key)
                                .map(d => (
                                  <SelectItem key={d.key} value={d.key}>
                                    {d.label}
                                  </SelectItem>
                                ))
                              }
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addTimeSlot(day.key)}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Agregar
                          </Button>
                        </div>
                      )}
                    </div>

                    {dayAvailability.isEnabled && (
                      <div className="ml-8 space-y-2">
                        {dayAvailability.timeSlots.map((slot, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Select
                              value={slot.start}
                              onValueChange={(value) => updateTimeSlot(day.key, index, 'start', value)}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {timeOptions.map(time => (
                                  <SelectItem key={time} value={time}>
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            
                            <span>-</span>
                            
                            <Select
                              value={slot.end}
                              onValueChange={(value) => updateTimeSlot(day.key, index, 'end', value)}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {timeOptions.map(time => (
                                  <SelectItem key={time} value={time}>
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            {dayAvailability.timeSlots.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeTimeSlot(day.key, index)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        
                        {dayAvailability.timeSlots.length === 0 && (
                          <p className="text-sm text-muted-foreground">
                            No hay horarios configurados para este día
                          </p>
                        )}
                      </div>
                    )}

                    <Separator />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overrides" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Excepciones de fechas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {formData.dateOverrides.length > 0 && (
                <div className="space-y-3">
                  {formData.dateOverrides.map((override) => (
                    <div key={override.date} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">
                          {format(new Date(override.date), 'dd MMMM yyyy', { locale: es })}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {override.isAvailable ? (
                            <>
                              <Badge variant="secondary">Disponible</Badge>
                              {override.timeSlots && (
                                <span className="text-sm text-muted-foreground">
                                  {override.timeSlots.map(slot => `${slot.start}-${slot.end}`).join(', ')}
                                </span>
                              )}
                            </>
                          ) : (
                            <Badge variant="destructive">No disponible</Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDateOverride(override.date)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Separator />

              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <h4 className="font-medium">Agregar excepción</h4>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Seleccionar fecha</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? (
                            format(selectedDate, 'dd MMMM yyyy', { locale: es })
                          ) : (
                            'Selecciona una fecha'
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Tipo de excepción</Label>
                    <Select
                      value={overrideType}
                      onValueChange={(value) => setOverrideType(value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unavailable">No disponible</SelectItem>
                        <SelectItem value="custom">Horario personalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {overrideType === 'custom' && (
                    <div className="space-y-2">
                      <Label>Horarios personalizados</Label>
                      {customTimes.map((slot, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Select
                            value={slot.start}
                            onValueChange={(value) => {
                              const newTimes = [...customTimes];
                              newTimes[index] = { ...newTimes[index], start: value };
                              setCustomTimes(newTimes);
                            }}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {timeOptions.map(time => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          <span>-</span>
                          
                          <Select
                            value={slot.end}
                            onValueChange={(value) => {
                              const newTimes = [...customTimes];
                              newTimes[index] = { ...newTimes[index], end: value };
                              setCustomTimes(newTimes);
                            }}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {timeOptions.map(time => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {customTimes.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setCustomTimes(prev => prev.filter((_, i) => i !== index));
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCustomTimes(prev => [...prev, { start: '09:00', end: '17:00' }]);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar horario
                      </Button>
                    </div>
                  )}

                  <Button
                    type="button"
                    onClick={addDateOverride}
                    disabled={!selectedDate}
                  >
                    Agregar excepción
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {schedule ? 'Actualizar horario' : 'Crear horario'}
        </Button>
      </div>
    </form>
  );
}