import { supabase } from '@/lib/supabaseClient'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { DBReservation, DBEvent } from '@/types'

export default async function ConfirmationPage({ params }: { params: { reservationId: string } }) {
  const { data: reservation } = await supabase
    .from('reservations')
    .select('*, events(*)')
    .eq('id', params.reservationId)
    .single() as { data: (DBReservation & { events: DBEvent }) | null }

  if (!reservation) {
    notFound()
  }

  const event = reservation.events

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Reservation Confirmed</h1>
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <p className="mb-4"><strong>Event:</strong> {event.event_name}</p>
        <p className="mb-4"><strong>Host:</strong> {event.host_name}</p>
        <p className="mb-4"><strong>Date:</strong> {format(new Date(reservation.reservation_date_time), 'MMMM d, yyyy')}</p>
        <p className="mb-4"><strong>Time:</strong> {format(new Date(reservation.reservation_date_time), 'h:mm a')}</p>
        <p className="mb-4"><strong>Participant:</strong> {reservation.participant_name}</p>
        <p className="mb-4"><strong>Email:</strong> {reservation.participant_email}</p>
      </div>
    </div>
  )
}