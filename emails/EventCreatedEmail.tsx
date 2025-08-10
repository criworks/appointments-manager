import * as React from 'react'
import { Html, Head, Preview, Body, Container, Heading, Text, Hr, Button } from '@react-email/components'

export interface EventCreatedEmailProps {
  hostName: string
  eventName: string
  eventType: string
  durationValue: number
  durationUnit: 'minutes' | 'hours' | 'days'
  locationLabel?: string
  ctaUrl?: string
}

export default function EventCreatedEmail({
  hostName,
  eventName,
  eventType,
  durationValue,
  durationUnit,
  locationLabel,
  ctaUrl,
}: EventCreatedEmailProps) {
  const duration = `${durationValue}${durationUnit === 'minutes' ? 'm' : durationUnit === 'hours' ? 'h' : 'd'}`
  return (
    <Html>
      <Head />
      <Preview>Tu evento “{eventName}” fue creado con éxito</Preview>
      <Body style={{ backgroundColor: '#f6f9fc', margin: 0, padding: '24px 0' }}>
        <Container style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 24, width: '100%', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
          <Heading as="h2" style={{ margin: 0, marginBottom: 12 }}>Hola {hostName},</Heading>
          <Text style={{ margin: 0, marginBottom: 16 }}>
            Tu evento ha sido creado exitosamente.
            <br />
            Aquí tienes los detalles del evento que has creado.
          </Text>
          <Hr style={{ borderColor: '#eee', margin: '16px 0' }} />

          <Text style={{ margin: 0 }}><strong>Nombre:</strong> {eventName}</Text>
          <Text style={{ margin: 0 }}><strong>Tipo:</strong> {eventType}</Text>
          <Text style={{ margin: 0, marginBottom: 8 }}><strong>Duración:</strong> {duration}</Text>
          {locationLabel && (
            <Text style={{ margin: 0, marginBottom: 8 }}><strong>Ubicación:</strong> {locationLabel}</Text>
          )}

          {ctaUrl && (
            <div style={{ marginTop: 16 }}>
              <Button
                href={ctaUrl}
                style={{
                  backgroundColor: '#111827',
                  color: '#ffffff',
                  padding: '10px 16px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  display: 'inline-block',
                }}
              >
                Ver en la landing
              </Button>
            </div>
          )}

          <Hr style={{ borderColor: '#eee', margin: '16px 0' }} />
          <Text style={{ color: '#6b7280', fontSize: 12 }}>
            Gracias por usar nuestra app de agendamiento.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
