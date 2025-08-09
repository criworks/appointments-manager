import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { 
  MoreHorizontal, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Video, 
  Phone, 
  Globe,
  User,
  Mail,
  MessageSquare,
  Check,
  X,
  RefreshCw,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Booking } from "../../data/bookings";
import type { EventType } from "../../data/event-types";

interface BookingManagementProps {
  bookings: Booking[];
  eventTypes: EventType[];
  onUpdateBooking: (bookingId: string, updates: Partial<Booking>) => void;
  onDeleteBooking: (bookingId: string) => void;
}

export function BookingManagement({ 
  bookings, 
  eventTypes, 
  onUpdateBooking, 
  onDeleteBooking 
}: BookingManagementProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState<Date>();
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    rescheduled: 'bg-blue-100 text-blue-800',
    completed: 'bg-gray-100 text-gray-800'
  };

  const statusLabels = {
    pending: 'Pendiente',
    confirmed: 'Confirmada',
    cancelled: 'Cancelada',
    rescheduled: 'Reprogramada',
    completed: 'Completada'
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = selectedStatus === 'all' || booking.status === selectedStatus;
    const matchesSearch = booking.attendeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.attendeeEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const upcomingBookings = filteredBookings.filter(booking => 
    booking.startTime > new Date() && ['confirmed', 'pending'].includes(booking.status)
  );

  const pastBookings = filteredBookings.filter(booking => 
    booking.startTime <= new Date() || ['cancelled', 'completed'].includes(booking.status)
  );

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      case 'in-person': return <MapPin className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const handleConfirmBooking = (bookingId: string) => {
    onUpdateBooking(bookingId, { 
      status: 'confirmed',
      updatedAt: new Date()
    });
  };

  const handleCancelBooking = (bookingId: string) => {
    onUpdateBooking(bookingId, { 
      status: 'cancelled',
      updatedAt: new Date()
    });
    setCancellationReason('');
  };

  const handleRescheduleBooking = (bookingId: string) => {
    if (!rescheduleDate || !rescheduleTime) return;

    const [hours, minutes] = rescheduleTime.split(':').map(Number);
    const newStartTime = new Date(rescheduleDate);
    newStartTime.setHours(hours, minutes, 0, 0);

    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const newEndTime = new Date(newStartTime);
    newEndTime.setMinutes(newEndTime.getMinutes() + (eventTypes.find(et => et.id === booking.eventTypeId)?.duration || 30));

    onUpdateBooking(bookingId, {
      startTime: newStartTime,
      endTime: newEndTime,
      status: 'confirmed',
      updatedAt: new Date()
    });

    setShowRescheduleDialog(false);
    setRescheduleDate(undefined);
    setRescheduleTime('');
    setRescheduleReason('');
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const BookingCard = ({ booking }: { booking: Booking }) => (
    <Card key={booking.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{booking.title}</h3>
              <Badge className={statusColors[booking.status]}>
                {statusLabels[booking.status]}
              </Badge>
            </div>
            
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                <span>
                  {format(booking.startTime, 'dd MMM yyyy', { locale: es })} a las{' '}
                  {format(booking.startTime, 'HH:mm')}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{booking.attendeeName}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{booking.attendeeEmail}</span>
              </div>
              
              <div className="flex items-center gap-2">
                {getLocationIcon(booking.location.type)}
                <span>{booking.location.displayName}</span>
              </div>
            </div>

            {booking.notes && (
              <div className="flex items-start gap-2 text-sm">
                <MessageSquare className="w-4 h-4 mt-0.5" />
                <span className="text-muted-foreground">{booking.notes}</span>
              </div>
            )}

            { (booking as any).responses && (booking as any).responses.length > 0 && (
              <div className="mt-2 space-y-1">
                {(booking as any).responses.map((response: any, index: number) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium">{response.question}:</span>
                    <span className="text-muted-foreground ml-2">{response.answer}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelectedBooking(booking)}>
                <Eye className="w-4 h-4 mr-2" />
                Ver detalles
              </DropdownMenuItem>
              
              {booking.status === 'pending' && (
                <DropdownMenuItem onClick={() => handleConfirmBooking(booking.id)}>
                  <Check className="w-4 h-4 mr-2" />
                  Confirmar
                </DropdownMenuItem>
              )}
              
              {['confirmed', 'pending'].includes(booking.status) && (
                <>
                  <DropdownMenuItem onClick={() => {
                    setSelectedBooking(booking);
                    setShowRescheduleDialog(true);
                  }}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reprogramar
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={() => {
                      const reason = prompt('Razón de cancelación (opcional):');
                      setCancellationReason(reason || '');
                      handleCancelBooking(booking.id);
                    }}
                    className="text-destructive"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </DropdownMenuItem>
                </>
              )}
              
              {booking.status === 'confirmed' && booking.startTime <= new Date() && (
                <DropdownMenuItem onClick={() => onUpdateBooking(booking.id, { status: 'completed' })}>
                  <Check className="w-4 h-4 mr-2" />
                  Marcar como completada
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar por nombre, email o evento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="confirmed">Confirmadas</SelectItem>
            <SelectItem value="cancelled">Canceladas</SelectItem>
            <SelectItem value="completed">Completadas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs para próximas y pasadas */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList>
          <TabsTrigger value="upcoming">
            Próximas ({upcomingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Pasadas ({pastBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingBookings.length > 0 ? (
            upcomingBookings.map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No hay citas próximas.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastBookings.length > 0 ? (
            pastBookings.map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No hay citas pasadas.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog de detalles */}
      {selectedBooking && (
        <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalles de la cita</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Evento</Label>
                  <p className="font-medium">{selectedBooking.title}</p>
                </div>
                <div>
                  <Label>Estado</Label>
                  <Badge className={statusColors[selectedBooking.status]}>
                    {statusLabels[selectedBooking.status]}
                  </Badge>
                </div>
                <div>
                  <Label>Fecha y hora</Label>
                  <p>
                    {format(selectedBooking.startTime, 'dd MMMM yyyy', { locale: es })} a las{' '}
                    {format(selectedBooking.startTime, 'HH:mm')}
                  </p>
                </div>
                <div>
                  <Label>Duración</Label>
                  <p>
                    {Math.round((selectedBooking.endTime.getTime() - selectedBooking.startTime.getTime()) / (1000 * 60))} minutos
                  </p>
                </div>
                <div>
                  <Label>Asistente</Label>
                  <p>{selectedBooking.attendeeName}</p>
                  <p className="text-sm text-muted-foreground">{selectedBooking.attendeeEmail}</p>
                  {(selectedBooking as any).attendeePhone && (
                    <p className="text-sm text-muted-foreground">{(selectedBooking as any).attendeePhone}</p>
                  )}
                </div>
                <div>
                  <Label>Ubicación</Label>
                  <div className="flex items-center gap-2">
                    {getLocationIcon(selectedBooking.location.type)}
                    <span>{selectedBooking.location.displayName}</span>
                  </div>
                </div>
              </div>

              {selectedBooking.notes && (
                <div>
                  <Label>Notas</Label>
                  <p className="text-sm text-muted-foreground">{selectedBooking.notes}</p>
                </div>
              )}

              {(selectedBooking as any).responses && (selectedBooking as any).responses.length > 0 && (
                <div>
                  <Label>Respuestas adicionales</Label>
                  <div className="space-y-2 mt-2">
                    {(selectedBooking as any).responses.map((response: any, index: number) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <p className="font-medium text-sm">{response.question}</p>
                        <p className="text-sm text-muted-foreground">{response.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(selectedBooking as any).cancellationReason && (
                <div>
                  <Label>Razón de cancelación</Label>
                  <p className="text-sm text-muted-foreground">{(selectedBooking as any).cancellationReason}</p>
                </div>
              )}

              {(selectedBooking as any).rescheduleReason && (
                <div>
                  <Label>Razón de reprogramación</Label>
                  <p className="text-sm text-muted-foreground">{(selectedBooking as any).rescheduleReason}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog de reprogramación */}
      <Dialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reprogramar cita</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nueva fecha</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {rescheduleDate ? (
                      format(rescheduleDate, 'dd MMMM yyyy', { locale: es })
                    ) : (
                      'Selecciona una fecha'
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={rescheduleDate}
                    onSelect={setRescheduleDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Nueva hora</Label>
              <Select value={rescheduleTime} onValueChange={setRescheduleTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una hora" />
                </SelectTrigger>
                <SelectContent>
                  {generateTimeSlots().map(time => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Razón de reprogramación</Label>
              <Textarea
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                placeholder="Opcional: explica por qué se reprograma la cita"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowRescheduleDialog(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                onClick={() => selectedBooking && handleRescheduleBooking(selectedBooking.id)}
                disabled={!rescheduleDate || !rescheduleTime}
                className="flex-1"
              >
                Reprogramar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}