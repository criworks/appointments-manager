import * as React from 'react'
import { Html } from '@react-email/html'
import { Head } from '@react-email/head'
import { Preview } from '@react-email/preview'
import { Section } from '@react-email/section'
import { Container } from '@react-email/container'
import { Text } from '@react-email/text'
import { Link } from '@react-email/link'
import { Hr } from '@react-email/hr'

interface BookingCreatedEmailProps {
  isParticipant: boolean
  hostName: string
  hostEmail: string
  attendeeName: string
  attendeeEmail: string
  eventName: string
  eventType: 'Online' | 'Presencial'
  durationValue: number
  durationUnit: 'minutes' | 'hours' | 'days'
  locationLabel: string
  dateLabel: string
  timeLabel: string
  endTimeLabel: string
  ctaUrl: string
}

export default function BookingCreatedEmail(props: BookingCreatedEmailProps) {
  const {
    isParticipant,
    hostName,
    hostEmail,
    attendeeName,
    attendeeEmail,
    eventName,
    eventType,
    durationValue,
    durationUnit,
    locationLabel,
    dateLabel,
    timeLabel,
    endTimeLabel,
    ctaUrl,
  } = props

  const durationUnitLabel =
    durationUnit === 'minutes' ? 'minutos' : durationUnit === 'hours' ? 'horas' : 'días'

  return (
    <Html>
      <Head />
      <Preview>
        {isParticipant
          ? `Confirmación: ${eventName} el ${dateLabel} ${timeLabel}`
          : `Nueva reserva para ${eventName} el ${dateLabel} ${timeLabel}`}
      </Preview>
      <Section style={styles.wrapper}>
        <Container style={styles.container}>
          <Text style={styles.h1}>
            {isParticipant ? '¡Reserva confirmada!' : 'Nueva reserva creada'}
          </Text>
          <Text style={styles.p}>
            {isParticipant
              ? `Hola ${attendeeName}, tu reserva para "${eventName}" ha sido confirmada.`
              : `Hola ${hostName}, se ha generado una nueva reserva para "${eventName}".`}
          </Text>

          <Hr style={styles.hr} />
          <Text style={styles.p}><strong>Evento:</strong> {eventName}</Text>
          <Text style={styles.p}><strong>Tipo:</strong> {eventType}</Text>
          <Text style={styles.p}><strong>Fecha:</strong> {dateLabel}</Text>
          <Text style={styles.p}><strong>Hora:</strong> {timeLabel} - {endTimeLabel}</Text>
          <Text style={styles.p}><strong>Duración:</strong> {durationValue} {durationUnitLabel}</Text>
          <Text style={styles.p}><strong>Ubicación:</strong> {locationLabel}</Text>
          <Hr style={styles.hr} />

          <Text style={styles.p}><strong>Anfitrión:</strong> {hostName} ({hostEmail})</Text>
          <Text style={styles.p}><strong>Participante:</strong> {attendeeName} ({attendeeEmail})</Text>

          <Section style={{ marginTop: 24 }}>
            <Link href={ctaUrl} style={styles.button}>
              Ver detalles de la reserva
            </Link>
          </Section>

          <Text style={{ ...styles.p, color: '#6b7280', marginTop: 24 }}>
            Si no esperabas este mensaje, puedes ignorarlo.
          </Text>
        </Container>
      </Section>
    </Html>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    width: '100%',
    backgroundColor: '#f8fafc',
    padding: '24px 12px',
  },
  container: {
    margin: '0 auto',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    maxWidth: 560,
    border: '1px solid #e5e7eb',
  },
  h1: {
    fontSize: 20,
    fontWeight: 700,
    color: '#111827',
    margin: '0 0 8px 0',
  },
  p: {
    fontSize: 14,
    lineHeight: '22px',
    color: '#111827',
    margin: '6px 0',
  },
  hr: {
    border: 'none',
    borderTop: '1px solid #e5e7eb',
    margin: '16px 0',
  },
  button: {
    display: 'inline-block',
    backgroundColor: '#111827',
    color: '#ffffff',
    textDecoration: 'none',
    padding: '10px 14px',
    borderRadius: 8,
    fontSize: 14,
  },
}


