import { render, screen, waitFor } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import React from 'react'

// Mock router params
vi.mock('next/navigation', () => ({ useParams: () => ({ bookingId: 'book_123' }) }))

// Mock Supabase client
vi.mock('@/lib/supabaseClient', () => {
  const single = vi.fn().mockResolvedValue({
    data: {
      id: 'book_123',
      event_name: 'Mi Evento',
      host_name: 'Host',
      host_email: 'host@test.com',
      attendee_name: 'Pedro',
      attendee_email: 'pedro@example.com',
      start_time: '2025-08-20T10:00:00.000Z',
      end_time: '2025-08-20T10:30:00.000Z',
      location: { type: 'online', displayName: 'Online', details: 'https://meet' },
      status: 'confirmed',
    },
    error: null,
  })
  const eq = vi.fn(() => ({ single }))
  const select = vi.fn(() => ({ eq, single }))
  const from = vi.fn(() => ({ select }))
  return { supabase: { from } }
})

import ConfirmationPage from '@/app/(booking-flow)/confirmation/[bookingId]/page'

describe('Página de confirmación de booking', () => {

  it('muestra los datos del booking cargados desde Supabase', async () => {
    render(React.createElement(ConfirmationPage))

    // Espera a que se cargue el booking
    await waitFor(() => expect(screen.getByText('Mi Evento')).toBeInTheDocument())

    // Cabecera de estado
    expect(screen.getByText('¡Cita confirmada!')).toBeInTheDocument()

    // Correos
    expect(screen.getByText(/pedro@example.com/i)).toBeInTheDocument()
    expect(screen.getByText(/host@test.com/i)).toBeInTheDocument()

    // Ubicación
    expect(screen.getByText(/Online/i)).toBeInTheDocument()
  })
})


