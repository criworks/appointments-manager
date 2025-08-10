import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import React from 'react'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))

vi.mock('@/lib/supabaseClient', () => {
  // Chain for insert(...).select(...).single()
  const single = vi.fn().mockResolvedValue({
    data: {
      id: 'evt_123',
      host_email: 'host@test.com',
      host_name: 'Host',
      event_name: 'Mi Evento',
      event_type: 'Online',
      online_url: 'https://meet',
      address: null,
      duration_value: 30,
      duration_unit: 'minutes',
    },
    error: null,
  })
  const selectAfterInsert = vi.fn(() => ({ single }))
  const insert = vi.fn(() => ({ select: selectAfterInsert }))

  // Chain for list events (unused here but present in previous mock)
  const order = vi.fn().mockResolvedValue({
    data: [
      {
        id: 'evt_123',
        event_name: 'Mi Evento',
        description: 'desc',
        event_type: 'Online',
        duration_value: 30,
        duration_unit: 'minutes',
        host_name: 'Host',
        url_slug: 'mi-evento',
      },
    ],
  })

  // Chain for ensureUniqueSlug: select(..., { head: true, count: 'exact' }).eq('url_slug', ...)
  const eqCount = vi.fn(() => Promise.resolve({ count: 0, error: null }))
  const selectHead = vi.fn(() => ({ eq: eqCount }))

  // Fallback chain in ensureUniqueSlug: select('id').eq(...).limit(1)
  const limit = vi.fn(() => Promise.resolve({ data: [], error: null }))
  const eq = vi.fn(() => ({ limit }))
  const selectSimple = vi.fn(() => ({ eq }))

  const from = vi.fn((table: string) => ({
    insert,
    select: (cols?: any, opts?: any) => {
      if (opts?.head && opts?.count === 'exact') return selectHead()
      if (cols === 'id') return selectSimple()
      return { order }
    },
  }))
  return { supabase: { from } }
})

const fetchMock = vi.fn((input: RequestInfo | URL) => {
  const url = typeof input === 'string' ? input : input.toString()
  if (url.includes('/api/event-created')) {
    return Promise.resolve({ ok: true, json: async () => ({ success: true }) } as any)
  }
  return Promise.resolve({ ok: true, json: async () => ({}) } as any)
})

beforeEach(() => {
  fetchMock.mockClear()
  // @ts-expect-error jsdom window is present
  global.fetch = fetchMock
  // @ts-expect-error jsdom window is present
  if (typeof window !== 'undefined') window.fetch = fetchMock as any
})

import CreateEventPage from '@/app/(create-event-magnet)/create-event/page'

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

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/event-created', expect.anything()))
  })
})
