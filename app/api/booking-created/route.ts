import { NextResponse } from 'next/server'
import { addMinutes, addHours, addDays, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { supabase } from '@/lib/supabaseClient'
import { getSiteUrl, renderEmail, sendEmail } from '@/lib/email'
import BookingCreatedEmail from '@/emails/BookingCreatedEmail'

type DurationUnit = 'minutes' | 'hours' | 'days'

export async function POST(req: Request) {
  try {
    const {
      eventId,
      eventName,
      eventType, // 'online' | 'in-person-business' | 'in-person-client' OR 'Online'/'Presencial'
      onlineUrl,
      address,
      durationValue,
      durationUnit,
      hostName,
      hostEmail,
      attendeeName,
      attendeeEmail,
      date, // YYYY-MM-DD
      time, // HH:mm
      notes,
    } = await req.json()

    // Calcular fecha/hora inicio y fin
    const start = new Date(`${date}T${time}:00`)
    const addByUnit = (d: Date, value: number, unit: DurationUnit) =>
      unit === 'minutes' ? addMinutes(d, value) : unit === 'hours' ? addHours(d, value) : addDays(d, value)
    const end = addByUnit(start, durationValue, durationUnit)

    const dateLabel = format(start, 'PPP', { locale: es })
    const timeLabel = format(start, 'HH:mm', { locale: es })
    const endTimeLabel = format(end, 'HH:mm', { locale: es })

    const isOnline = String(eventType).toLowerCase().startsWith('online')
    const locationLabel = isOnline && onlineUrl ? onlineUrl : address || ''

    // Insertar booking en Supabase
    const { data: inserted, error: insertError } = await supabase
      .from('bookings')
      .insert([
        {
          event_id: eventId ?? null,
          event_name: eventName,
          host_name: hostName,
          host_email: hostEmail,
          attendee_name: attendeeName,
          attendee_email: attendeeEmail,
          start_time: start.toISOString(),
          end_time: end.toISOString(),
          location: {
            type: isOnline ? 'online' : 'in-person',
            displayName: isOnline ? 'Online' : 'Presencial',
            details: locationLabel,
          },
          status: 'confirmed',
          notes: notes ?? null,
        },
      ])
      .select('id')
      .single()

    if (insertError || !inserted) {
      throw new Error(`No se pudo guardar el booking: ${insertError?.message || 'Unknown error'}`)
    }

    const bookingId = inserted.id as string
    const confirmationUrl = `${getSiteUrl()}/confirmation/${bookingId}`

    // Emails: participante
    const participantHtml = await renderEmail(BookingCreatedEmail, {
      isParticipant: true,
      hostName,
      hostEmail,
      attendeeName,
      attendeeEmail,
      eventName,
      eventType: isOnline ? 'Online' : 'Presencial',
      durationValue,
      durationUnit,
      locationLabel,
      dateLabel,
      timeLabel,
      endTimeLabel,
      ctaUrl: confirmationUrl,
    })

    await sendEmail({
      to: attendeeEmail,
      subject: `Confirmación de tu reserva para ${eventName}`,
      html: participantHtml,
      tags: [
        { name: 'category', value: 'booking-created' },
        { name: 'role', value: 'participant' },
      ],
    })

    // Emails: host
    const hostHtml = await renderEmail(BookingCreatedEmail, {
      isParticipant: false,
      hostName,
      hostEmail,
      attendeeName,
      attendeeEmail,
      eventName,
      eventType: isOnline ? 'Online' : 'Presencial',
      durationValue,
      durationUnit,
      locationLabel,
      dateLabel,
      timeLabel,
      endTimeLabel,
      ctaUrl: confirmationUrl,
    })

    await sendEmail({
      to: hostEmail,
      subject: `Nueva reserva para tu evento ${eventName}`,
      html: hostHtml,
      tags: [
        { name: 'category', value: 'booking-created' },
        { name: 'role', value: 'host' },
      ],
    })

    return NextResponse.json({ success: true, bookingId, confirmationUrl })
  } catch (error) {
    console.error('Error en /api/booking-created:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}