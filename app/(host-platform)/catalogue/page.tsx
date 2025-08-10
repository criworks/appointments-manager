import React from 'react';
import Link from 'next/link';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabaseClient';

function formatDuration(value: number, unit: 'minutes' | 'hours' | 'days') {
  const u = unit === 'minutes' ? 'm' : unit === 'hours' ? 'h' : 'd';
  return `${value}${u}`;
}

export default async function Catalogue() {
  const { data: events } = await supabase
    .from('events')
    .select('id, event_name, duration_value, duration_unit, host_name, url_slug')
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-5xl mx-auto flex">
      <div className="flex flex-col items-left w-80 mr-6">
        <Avatar className="rounded-full">
          <AvatarImage src="/avatar-cri.png" />
          <AvatarFallback>CR</AvatarFallback>
        </Avatar>
        <h2 className='text-lg font-semibold text-gray-500 mt-4'>Catálogo</h2>
      </div>
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(events ?? []).map((evt) => (
          <Card key={evt.id} className="p-4">
            <h3 className="font-medium mb-1">{evt.event_name}</h3>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{formatDuration(evt.duration_value, evt.duration_unit)}</Badge>
              <span className="text-sm text-muted-foreground">por {evt.host_name}</span>
            </div>
            <Link
              href={`/calendar-available/${evt.url_slug || evt.id}`}
              className="text-sm text-primary underline"
            >
              Ver disponibilidad
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
