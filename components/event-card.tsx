import { Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface EventCardProps {
  id: string
  hostName: string
  eventName: string
  durationValue: number
  durationUnit: 'minutes' | 'hours' | 'days'
  eventPrice: number
  onClick?: () => void
}

export function EventCard({ id, hostName, eventName, durationValue, durationUnit, eventPrice, onClick }: EventCardProps) {
  return (
    <div className="no-underline cursor-pointer" onClick={onClick}>
      <div className="mb-2">
        <p className="text-sm font-medium text-gray-500">{hostName}</p>
      </div>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle>{eventName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-sm text-gray-500 mt-2">
            <Badge variant="secondary" icon={Clock}>{`${durationValue} ${durationUnit === 'minutes' ? 'min' : durationUnit === 'hours' ? 'h' : 'd'}`}</Badge>
          </div>
          <p className="mt-2 font-semibold text-sm">${eventPrice}</p>
        </CardContent>
      </Card>
    </div>
  )
}