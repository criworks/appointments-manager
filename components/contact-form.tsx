'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DBReservation } from '@/types'

export default function ContactForm({ eventId, date, time }: { eventId: string, date: string, time: string }) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const dateTime = new Date(`${date}T${time}:00`)
    
    const { data, error } = await supabase
      .from('reservations')
      .insert({
        event_id: eventId,
        reservation_date_time: dateTime.toISOString(),
        participant_email: email,
        participant_name: name,
        created_at: new Date().toISOString() // Add created_at
      })
      .select() as { data: DBReservation[] | null, error: any }

    if (error) {
      console.error('Error creating reservation:', error)
      return
    }

    // Send email (this should be done server-side in a real application)
    const emailResponse = await fetch('/api/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reservationId: data[0].id,
        email,
        name,
        eventId,
        date,
        time,
      }),
    })

    if (!emailResponse.ok) {
      throw new Error('Failed to send email')
    }

    router.push(`/confirmation/${data[0].id}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <Input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        required
      />
      <Button type="submit">Reserve</Button>
    </form>
  )
}