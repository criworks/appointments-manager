import { supabase } from '@/lib/supabaseClient'
import { notFound } from 'next/navigation'
import ContactForm from '@/components/contact-form'
import { DBEvent } from '@/types'

export default async function ContactPage({ params, searchParams }: { params: { eventId: string }, searchParams: { date: string, time: string } }) {
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
      <h1 className="text-3xl font-bold mb-6">Contact Information</h1>
      <p className="text-xl mb-4">Event: {event.event_name}</p>
      <p className="text-xl mb-4">Host: {event.host_name}</p>
      <p className="text-xl mb-4">Date: {searchParams.date}</p>
      <p className="text-xl mb-4">Time: {searchParams.time}</p>
      <ContactForm eventId={event.id} date={searchParams.date} time={searchParams.time} />
    </div>
  )
}