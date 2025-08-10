import { Clock, MapPin, Video, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient';

interface EventCardProps {
  id: string
  hostName: string
  eventName: string
  durationValue: number
  durationUnit: 'minutes' | 'hours' | 'days'
  eventType: 'Online' | 'In-Person'
  eventPrice: number
  url_slug: string
  description: string
  onClick?: () => void
}

function formatDuration(value: number, unit: 'minutes' | 'hours' | 'days') {
  const u = unit === 'minutes' ? 'm' : unit === 'hours' ? 'h' : 'd';
  return `${value}${u}`;
}

export async function EventCard({ id, hostName, eventName, durationValue, durationUnit, eventType, eventPrice, url_slug, description, onClick }: EventCardProps) {
  const { data: events } = await supabase
    .from('events')
    .select('id, event_name, description, event_type, duration_value, duration_unit, host_name, url_slug, online_url, address')
    .order('created_at', { ascending: false });

  return (
    <Link href={`/calendar-available/${url_slug || id}`} className="no-underline cursor-pointer">
      <div className="mb-2">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <span>{hostName}</span>
        </div>
      </div>
      <Card key={id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">{eventName}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
          )}
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{formatDuration(durationValue, durationUnit)}</span>
            </div>
            <div className="flex items-center gap-2">
              {eventType === 'Online' ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
              <span>{eventType}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}