import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('Booking API basic flow', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('returns bookingId and confirmationUrl on success', async () => {
    // Mock fetch to API route
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ bookingId: '00000000-0000-4000-8000-000000000000', confirmationUrl: 'http://localhost:3000/confirmation/00000000-0000-4000-8000-000000000000' }),
    }) as any

    const payload = {
      eventId: '00000000-0000-4000-8000-000000000001',
      eventName: 'Consulta de Marketing Digital',
      eventType: 'online',
      onlineUrl: 'https://meet.google.com/xyz-abc-def',
      address: null,
      durationValue: 30,
      durationUnit: 'minutes' as const,
      hostName: 'María González',
      hostEmail: 'maria@example.com',
      attendeeName: 'Pedro Ramírez',
      attendeeEmail: 'pedro@example.com',
      date: '2025-08-20',
      time: '10:00',
    }

    const res = await fetch('/api/booking-created', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    expect(res.ok).toBe(true)
    const json = await (res as any).json()
    expect(json.bookingId).toBeTypeOf('string')
    expect(json.confirmationUrl).toContain('/confirmation/')

    global.fetch = originalFetch
  })
})


