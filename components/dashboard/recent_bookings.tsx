import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { bookings } from "../../data/bookings";
import { eventTypes } from "../../data/event-types";

export function RecentBookings() {
  const recentBookings = bookings
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'pending': return 'secondary';
      case 'cancelled': return 'destructive';
      case 'completed': return 'outline';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelada';
      case 'completed': return 'Completada';
      case 'rescheduled': return 'Reprogramada';
      default: return status;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Citas recientes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentBookings.map((booking) => {
            const eventType = eventTypes.find(e => e.id === booking.eventTypeId);
            return (
              <div key={booking.id} className="flex items-center space-x-4">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>
                    {booking.attendeeName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {booking.attendeeName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {eventType?.title} • {booking.startTime.toLocaleDateString('es-ES')}
                  </p>
                </div>
                <Badge variant={getStatusColor(booking.status)}>
                  {getStatusLabel(booking.status)}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}