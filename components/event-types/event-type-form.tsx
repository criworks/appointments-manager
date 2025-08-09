import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Separator } from "../ui/separator";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Checkbox } from "../ui/checkbox";
import { X, Plus, MapPin, Video, Phone, Globe } from "lucide-react";
import type { EventType } from "@/data/event-types";
import type { Question } from "@/data/event-types";

interface EventTypeFormProps {
  eventType?: EventType;
  onSave: (eventType: Partial<EventType>) => void;
  onCancel: () => void;
}

interface Location {
  type: 'video' | 'phone' | 'in-person' | 'custom';
  value: string;
  displayName: string;
}

export function EventTypeForm({ eventType, onSave, onCancel }: EventTypeFormProps) {
  const [formData, setFormData] = useState({
    title: eventType?.title || '',
    description: eventType?.description || '',
    duration: eventType?.duration || 30,
    color: eventType?.color || '#3b82f6',
    isActive: eventType?.isActive ?? true,
    location: eventType?.location || {
      type: 'video',
      value: 'https://meet.google.com/new',
      displayName: 'Google Meet'
    } as Location,
    price: eventType?.price || 0,
    currency: eventType?.currency || 'USD',
    settings: {
      bufferTimeBefore: eventType?.settings?.bufferTimeBefore || 0,
      bufferTimeAfter: eventType?.settings?.bufferTimeAfter || 0,
      minimumNotice: eventType?.settings?.minimumNotice || 60,
      maximumNotice: eventType?.settings?.maximumNotice || 4320,
      confirmationPolicy: eventType?.settings?.confirmationPolicy || 'instant',
      cancellationPolicy: eventType?.settings?.cancellationPolicy || 24,
      redirectAfterBooking: eventType?.settings?.redirectAfterBooking || '',
      showOnPublicPage: eventType?.settings?.showOnPublicPage ?? false
    },
    questions: eventType?.questions || []
  });

  const [newQuestion, setNewQuestion] = useState<Question>({
    type: 'text',
    question: '',
    required: false,
    options: []
  });

  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
  ];

  const durations = [15, 30, 45, 60, 90, 120];

  const handleLocationChange = (type: Location['type']) => {
    let defaultValue = '';
    let displayName = '';
    
    switch (type) {
      case 'video':
        defaultValue = 'https://meet.google.com/new';
        displayName = 'Google Meet';
        break;
      case 'phone':
        defaultValue = '+1234567890';
        displayName = 'Llamada telefónica';
        break;
      case 'in-person':
        defaultValue = '';
        displayName = 'Presencial';
        break;
      case 'custom':
        defaultValue = '';
        displayName = 'Personalizada';
        break;
    }

    setFormData(prev => ({
      ...prev,
      location: {
        type,
        value: defaultValue,
        displayName
      }
    }));
  };

  const addQuestion = () => {
    if (!newQuestion.question.trim()) return;

    const question: Question = {
      id: `q${Date.now()}`,
      ...newQuestion
    };

    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, question]
    }));

    setNewQuestion({
      type: 'text',
      question: '',
      required: false,
      options: []
    });
  };

  const removeQuestion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_: Question, i: number) => i !== index)
    }));
  };

  const addOption = () => {
    setNewQuestion(prev => ({
      ...prev,
      options: [...(prev.options || []), '']
    }));
  };

  const updateOption = (index: number, value: string) => {
    setNewQuestion(prev => ({
      ...prev,
      options: (prev.options || []).map((opt: string, i: number) => i === index ? value : opt)
    }));
  };

  const removeOption = (index: number) => {
    setNewQuestion(prev => ({
      ...prev,
      options: (prev.options || []).filter((_: string, i: number) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Básico</TabsTrigger>
          <TabsTrigger value="location">Ubicación</TabsTrigger>
          <TabsTrigger value="questions">Preguntas</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título del evento</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="ej. Reunión de 30 minutos"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Una breve descripción de este tipo de evento"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duración</Label>
                  <Select
                    value={formData.duration.toString()}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, duration: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {durations.map(duration => (
                        <SelectItem key={duration} value={duration.toString()}>
                          {duration} minutos
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {colors.map(color => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.color === color ? 'border-primary' : 'border-gray-200'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="active">Evento activo</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="public"
                  checked={formData.settings.showOnPublicPage}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({
                      ...prev,
                      settings: { ...prev.settings, showOnPublicPage: checked }
                    }))
                  }
                />
                <Label htmlFor="public">Mostrar en página pública</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="location" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ubicación del evento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={formData.location.type}
                onValueChange={handleLocationChange}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="video" id="video" />
                  <Label htmlFor="video" className="flex items-center">
                    <Video className="w-4 h-4 mr-2" />
                    Videollamada
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="phone" id="phone" />
                  <Label htmlFor="phone" className="flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    Llamada telefónica
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="in-person" id="in-person" />
                  <Label htmlFor="in-person" className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    Presencial
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="custom" />
                  <Label htmlFor="custom" className="flex items-center">
                    <Globe className="w-4 h-4 mr-2" />
                    Personalizada
                  </Label>
                </div>
              </RadioGroup>

              <div className="space-y-2">
                <Label htmlFor="location-value">
                  {formData.location.type === 'video' && 'URL de la videollamada'}
                  {formData.location.type === 'phone' && 'Número de teléfono'}
                  {formData.location.type === 'in-person' && 'Dirección'}
                  {formData.location.type === 'custom' && 'Detalles de ubicación'}
                </Label>
                <Input
                  id="location-value"
                  value={formData.location.value}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, value: e.target.value }
                  }))}
                  placeholder={
                    formData.location.type === 'video' ? 'https://meet.google.com/new' :
                    formData.location.type === 'phone' ? '+1234567890' :
                    formData.location.type === 'in-person' ? 'Dirección completa' :
                    'Detalles personalizados'
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="display-name">Nombre para mostrar</Label>
                <Input
                  id="display-name"
                  value={formData.location.displayName}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, displayName: e.target.value }
                  }))}
                  placeholder="Nombre que verán los asistentes"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preguntas adicionales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.questions.length > 0 && (
                <div className="space-y-3">
                  {formData.questions.map((question: Question, index: number) => (
                    <div key={question.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{question.question}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">{question.type}</Badge>
                            {question.required && <Badge variant="outline">Requerida</Badge>}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuestion(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Separator />

              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <h4 className="font-medium">Agregar nueva pregunta</h4>
                
                <div className="space-y-2">
                  <Label>Tipo de pregunta</Label>
                  <Select
                    value={newQuestion.type}
                    onValueChange={(value) => setNewQuestion(prev => ({ ...prev, type: value as Question['type'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Texto corto</SelectItem>
                      <SelectItem value="textarea">Texto largo</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Teléfono</SelectItem>
                      <SelectItem value="select">Selección única</SelectItem>
                      <SelectItem value="radio">Opciones múltiples</SelectItem>
                      <SelectItem value="checkbox">Casilla de verificación</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Pregunta</Label>
                  <Input
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
                    placeholder="¿Cuál es tu pregunta?"
                  />
                </div>

                {(newQuestion.type === 'select' || newQuestion.type === 'radio') && (
                  <div className="space-y-2">
                    <Label>Opciones</Label>
                    {newQuestion.options?.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          placeholder={`Opción ${index + 1}`}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeOption(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addOption}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar opción
                    </Button>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="required"
                    checked={newQuestion.required}
                    onCheckedChange={(checked) => 
                      setNewQuestion(prev => ({ ...prev, required: !!checked }))
                    }
                  />
                  <Label htmlFor="required">Pregunta requerida</Label>
                </div>

                <Button type="button" onClick={addQuestion}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar pregunta
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración avanzada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tiempo libre antes (minutos)</Label>
                  <Input
                    type="number"
                    value={formData.settings.bufferTimeBefore}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      settings: { ...prev.settings, bufferTimeBefore: parseInt(e.target.value) || 0 }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tiempo libre después (minutos)</Label>
                  <Input
                    type="number"
                    value={formData.settings.bufferTimeAfter}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      settings: { ...prev.settings, bufferTimeAfter: parseInt(e.target.value) || 0 }
                    }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Aviso mínimo (minutos)</Label>
                  <Input
                    type="number"
                    value={formData.settings.minimumNotice}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      settings: { ...prev.settings, minimumNotice: parseInt(e.target.value) || 0 }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Aviso máximo (minutos)</Label>
                  <Input
                    type="number"
                    value={formData.settings.maximumNotice}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      settings: { ...prev.settings, maximumNotice: parseInt(e.target.value) || 0 }
                    }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Política de confirmación</Label>
                <Select
                  value={formData.settings.confirmationPolicy}
                  onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    settings: { ...prev.settings, confirmationPolicy: value as any }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instant">Confirmación instantánea</SelectItem>
                    <SelectItem value="manual">Confirmación manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Política de cancelación (horas antes)</Label>
                <Input
                  type="number"
                  value={formData.settings.cancellationPolicy}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    settings: { ...prev.settings, cancellationPolicy: parseInt(e.target.value) || 0 }
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label>URL de redirección después de agendar</Label>
                <Input
                  value={formData.settings.redirectAfterBooking}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    settings: { ...prev.settings, redirectAfterBooking: e.target.value }
                  }))}
                  placeholder="https://example.com/gracias"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {eventType ? 'Actualizar evento' : 'Crear evento'}
        </Button>
      </div>
    </form>
  );
}