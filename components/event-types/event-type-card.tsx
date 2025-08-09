import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "../ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Copy, ExternalLink } from "lucide-react";
import { EventType } from "@/data/event-types";

interface EventTypeCardProps {
  eventType: EventType;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onToggle?: (id: string, isActive: boolean) => void;
  onCopy?: (id: string) => void;
}

export function EventTypeCard({ 
  eventType, 
  onEdit, 
  onDelete, 
  onToggle, 
  onCopy 
}: EventTypeCardProps) {
  const publicUrl = `${window.location.origin}/book/${eventType.id}`;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: eventType.color }}
              />
              <h3 className="font-medium">{eventType.title}</h3>
              <Badge variant={eventType.isActive ? "default" : "secondary"}>
                {eventType.isActive ? "Activo" : "Inactivo"}
              </Badge>
            </div>
            {eventType.description && (
              <p className="text-sm text-muted-foreground">
                {eventType.description}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(eventType.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCopy?.(eventType.id)}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.open(publicUrl, '_blank')}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Ver página pública
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete?.(eventType.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Duración</span>
            <span className="text-sm">{eventType.duration} minutos</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Ubicación</span>
            <span className="text-sm">
              {eventType.location.displayName}
            </span>
          </div>
          
          {eventType.price && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Precio</span>
              <span className="text-sm">
                {eventType.currency} {eventType.price}
              </span>
            </div>
          )}
          
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm">Activo</span>
            <Switch 
              checked={eventType.isActive}
              onCheckedChange={(checked) => onToggle?.(eventType.id, checked)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}