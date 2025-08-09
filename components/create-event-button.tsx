'use client'

import { CalendarPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function CreateEventButton() {
  const router = useRouter()

  return (
    <Button className="mt-4" variant="default" onClick={() => router.push('/create-event')}>
      <CalendarPlus className="mr-2 w-4 h-4" />
      Crear evento
    </Button>
  )
}
