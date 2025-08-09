import { NextResponse } from 'next/server'
import EventCreatedEmail from '@/emails/EventCreatedEmail'
import { getSiteUrl, renderEmail, sendEmail } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const {
      hostEmail,
      hostName,
      eventName,
      eventType,
      onlineUrl,
      address,
      durationValue,
      durationUnit,
    } = await req.json()

    const locationLabel = eventType === 'Online' ? onlineUrl ?? '' : address ?? ''

    const html = await renderEmail(EventCreatedEmail, {
      hostName,
      eventName,
      eventType,
      durationValue,
      durationUnit,
      locationLabel,
      ctaUrl: `${getSiteUrl()}/product-page`,
    })

    await sendEmail({
      to: hostEmail,
      subject: `Evento creado: ${eventName}`,
      html,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error en /api/event-created:', err)
    return NextResponse.json({ error: 'Unexpected' }, { status: 500 })
  }
}
