import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Calendar, Clock, Users, TrendingUp } from "lucide-react";
import { bookings } from "../../data/bookings";

export function StatsCards() {
  const today = new Date();
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const totalBookings = bookings.length;
  const thisMonthBookings = bookings.filter(b => b.createdAt >= thisMonth).length;
  const upcomingBookings = bookings.filter(b => b.startTime > today && b.status === 'confirmed').length;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;

  const stats = [
    {
      title: "Total de citas",
      value: totalBookings.toString(),
      icon: Calendar,
      change: "+12% del mes pasado"
    },
    {
      title: "Este mes",
      value: thisMonthBookings.toString(),
      icon: TrendingUp,
      change: "+8% del mes pasado"
    },
    {
      title: "Próximas",
      value: upcomingBookings.toString(),
      icon: Clock,
      change: "Próximos 7 días"
    },
    {
      title: "Completadas",
      value: completedBookings.toString(),
      icon: Users,
      change: "Histórico"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}