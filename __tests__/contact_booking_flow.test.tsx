import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import React from 'react'

// Mock router
const push = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }), useParams: () => ({ eventId: 'evt_123' }) }))

// Mock Supabase client for event fetch
vi.mock('@/lib/supabaseClient', () => {
  const single = vi.fn().mockResolvedValue({
    data: {
      id: 'evt_123',
      host_name: 'Host',
      host_email: 'host@test.com',
      event_name: 'Mi Evento',
      description: 'desc',
      event_type: 'Online',
      online_url: 'https://meet',
      address: null,
      duration_value: 30,
      duration_unit: 'minutes',
    },
    error: null,
  })
  const select = vi.fn(() => ({ single }))
  const from = vi.fn(() => ({ select }))
  return { supabase: { from } }
})

// Mock fetch to booking API
vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ bookingId: 'book_123', confirmationUrl: '/confirmation/book_123' }),
}))

import ContactPage from '@/app/(booking-flow)/contact/[eventId]/page'

describe('Flujo de contacto y booking', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    // preset selection in sessionStorage
    const selection = { eventId: 'evt_123', date: '2025-08-20T00:00:00.000Z', time: '10:00' }
    // @ts-expect-error JSDOM
    window.sessionStorage.setItem('selectedBooking', JSON.stringify(selection))
  })

  it('envía payload a /api/booking-created y redirige a confirmation', async () => {
    render(React.createElement(ContactPage))

    // Espera que la UI cargue
    await screen.findByText('Mi Evento')

    // Completar formulario de contacto
    fireEvent.change(screen.getByLabelText(/Tu nombre/i), { target: { value: 'Pedro' } })
    fireEvent.change(screen.getByLabelText(/Tu email/i), { target: { value: 'pedro@example.com' } })

    fireEvent.click(screen.getByRole('button', { name: /Confirmar reserva/i }))

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/booking-created', expect.any(Object))
      expect(push).toHaveBeenCalledWith('/confirmation/book_123')
    })
  })
})


