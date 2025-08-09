'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabaseClient'
import { useParams } from 'next/navigation'

export default function EventCreatedPage() {
  const { eventId } = useParams() as { eventId: string }
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('events')
        .select('id, event_name, event_type, host_name, online_url, address, duration_value, duration_unit')
        .eq('id', eventId)
        .single()
      setData(data)
    })()
  }, [eventId])

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Evento creado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data ? (
            <>
              <p><strong>Nombre:</strong> {data.event_name}</p>
              <p><strong>Anfitrión:</strong> {data.host_name}</p>
              <p><strong>Tipo:</strong> {data.event_type}</p>
              <p><strong>Duración:</strong> {data.duration_value}{data.duration_unit === 'minutes' ? 'm' : data.duration_unit === 'hours' ? 'h' : 'd'}</p>
              {(data.online_url || data.address) && (
                <p><strong>Ubicación:</strong> {data.online_url || data.address}</p>
              )}
            </>
          ) : (
            <p>Cargando...</p>
          )}

          <div className="pt-2">
            <Button asChild>
              <Link href="/product-page">Ir a la landing</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
