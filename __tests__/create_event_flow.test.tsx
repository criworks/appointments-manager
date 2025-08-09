import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import React from 'react'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))

vi.mock('@/lib/supabaseClient', () => {
  const single = vi.fn().mockResolvedValue({ data: { id: 'evt_123', host_email: 'host@test.com', host_name: 'Host', event_name: 'Mi Evento', event_type: 'Online', online_url: 'https://meet', address: null, duration_value: 30, duration_unit: 'minutes' }, error: null })
  const select = vi.fn(() => ({ single }))
  const insert = vi.fn(() => ({ select }))
  const order = vi.fn().mockResolvedValue({ data: [{ id: 'evt_123', event_name: 'Mi Evento', description: 'desc', event_type: 'Online', duration_value: 30, duration_unit: 'minutes', host_name: 'Host', url_slug: 'mi-evento' }] })
  const from = vi.fn((table: string) => ({ insert, select: vi.fn(() => ({ order })) }))
  return { supabase: { from } }
})

vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true }) }))

import CreateEventPage from '@/app/(schedule)/create-event/page'

describe('Flujo de creación de evento', () => {
  it('envía payload snake_case, llama a email y redirige', async () => {
    render(React.createElement(CreateEventPage))

    fireEvent.change(screen.getByLabelText(/Nombre del Evento/i), { target: { value: 'Mi Evento' } })
    fireEvent.change(screen.getByLabelText(/URL Slug/i), { target: { value: 'mi-evento' } })
    fireEvent.change(screen.getByLabelText(/Descripción/i), { target: { value: 'desc' } })
    fireEvent.change(screen.getByLabelText(/Tu Nombre/i), { target: { value: 'Host' } })
    fireEvent.change(screen.getByLabelText(/Tu Email/i), { target: { value: 'host@test.com' } })
    // Online URL es requerida cuando el tipo es Online por defecto
    fireEvent.change(screen.getByLabelText(/Dirección Web \(URL\)/i), { target: { value: 'https://meet' } })

    fireEvent.click(screen.getByRole('button', { name: /Crear Evento/i }))

    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/event-created', expect.anything()))
  })
})
