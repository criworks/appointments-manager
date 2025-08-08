import { supabase } from '@/lib/supabaseClient'
import { Badge } from '@/components/ui/badge'
import { CalendarPlus} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EventCard } from '@/components/event-card'
import { DBEvent } from '@/types'

export default async function Home() {
  const { data: events } = await supabase.from('events').select('*')

  return (
    <>
      {/* Hero */}
      <section className="text-center">
        <div className="mb-4 flex flex-col items-center">
          <Badge variant="secondary">Proyecto Portfolio</Badge>
          <span className="mt-2 text-lg font-semibold">Agendamientos</span>
        </div>
        <h1 className="text-4xl lg:text-5xl font-bold">Crea eventos</h1>
        <h1 className="text-4xl lg:text-5xl font-bold">Recibe agendamientos</h1>
        <p className="mt-2 text-lg text-gray-500">Crea eventos para que la gente que invites reserve en tu agenda</p>
        <Button className="mt-4" variant="default">
          <CalendarPlus className="mr-2 w-4 h-4" />
          Crear evento
        </Button>
      </section>

      {/* Events Section */}
      <section>
        <h4 className="text-xl font-semibold mb-4">Ejemplos</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events?.map((event: DBEvent) => (
            <EventCard
              key={event.id}
              id={event.id}
              hostName={event.host_name}
              eventName={event.event_name}
              eventDuration={event.event_duration}
              eventPrice={event.event_price}
            />
          ))}
        </div>
      </section>
    </>
  )
}