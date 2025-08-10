import { describe, test, expect, vi, beforeEach } from 'vitest'

const sendEmailMock = vi.fn().mockResolvedValue({})
const renderEmailMock = vi.fn().mockResolvedValue('<html>Email</html>')

vi.mock('@/lib/email', async () => ({
  getSiteUrl: () => 'http://example.com',
  renderEmail: renderEmailMock,
  sendEmail: sendEmailMock,
}))

vi.mock('@/lib/supabaseClient', async () => {
  const single = vi.fn().mockResolvedValue({ data: { id: 'book_123' }, error: null })
  const select = vi.fn(() => ({ single }))
  const insert = vi.fn(() => ({ select }))
  const from = vi.fn(() => ({ insert }))
  return { supabase: { from } }
})

import { POST } from '@/app/api/booking-created/route'

describe('API /api/booking-created', () => {
  beforeEach(() => {
    sendEmailMock.mockClear()
  })

  test('inserta booking, envía emails y retorna bookingId', async () => {
    const payload = {
      eventId: 'evt_1',
      eventName: 'Consulta',
      eventType: 'online',
      onlineUrl: 'https://meet.test',
      address: null,
      durationValue: 30,
      durationUnit: 'minutes' as const,
      hostName: 'Host',
      hostEmail: 'host@test.com',
      attendeeName: 'Pedro',
      attendeeEmail: 'pedro@test.com',
      date: '2025-08-20',
      time: '10:00',
      notes: '',
    }

    const req = new Request('http://localhost/api/booking-created', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const res = await POST(req)
    expect(res.ok).toBe(true)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.bookingId).toBe('book_123')
    expect(sendEmailMock).toHaveBeenCalledTimes(2)
    const recipients = sendEmailMock.mock.calls.map((c) => c[0]?.to)
    expect(recipients).toContain('pedro@test.com')
    expect(recipients).toContain('host@test.com')
  })
})


