import { supabase } from '@/lib/supabaseClient'
import { notFound } from 'next/navigation'
import CalendarComponent from '@/components/calendar-component'
import { DBEvent } from '@/types'

export default async function CalendarAvailable({ params }: { params: { eventId: string } }) {
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.eventId)
    .single() as { data: DBEvent | null }

  if (!event) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{event.event_name}</h1>
      <p className="text-xl mb-4">Hosted by: {event.host_name}</p>
      <CalendarComponent eventId={event.id} />
    </div>
  )
}