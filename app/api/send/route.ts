import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabase } from '@/lib/supabaseClient'
import fs from 'fs'
import path from 'path'
import { DBReservation, DBEvent } from '@/types'
import { addMinutes, addHours, addDays, format } from 'date-fns'
import { es } from 'date-fns/locale'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const { 
      reservationId,
      email, // Email del participante
      name, // Nombre del participante
      eventName,
      hostName,
      eventType,
      onlineUrl,
      address,
      durationValue,
      durationUnit,
      hostEmail,
      date, // Fecha seleccionada por el usuario (ISO string)
      time // Hora seleccionada por el usuario (HH:mm)
    } = await req.json()

    // Obtener los datos de la reserva de Supabase (ya están en req.json(), pero podemos verificar)
    // Aunque los datos del evento se pasan en el body, es buena práctica obtener la reserva
    // directamente de Supabase para asegurar la integridad y obtener created_at si es necesario.
    const { data: reservationFromDb, error: reservationError } = await supabase
      .from('reservations')
      .select('*, events(*)') // Asegúrate de seleccionar el evento relacionado
      .eq('id', reservationId)
      .single() as { data: (DBReservation & { events: DBEvent }) | null, error: any }

    if (reservationError || !reservationFromDb) {
      console.error("Error al obtener la reserva desde la DB:", reservationError);
      throw new Error("No se pudo encontrar la reserva.");
    }

    const event = reservationFromDb.events; // Usar los datos del evento de la DB
    const reservationDateTime = new Date(`${date}T${time}:00`); // Usar la fecha y hora pasadas del cliente

    // Función auxiliar para calcular la hora de finalización
    const calculateEndTime = (startTime: Date, durationValue: number, durationUnit: 'minutes' | 'hours' | 'days'): string => {
      let endTime: Date;
      if (durationUnit === 'minutes') {
        endTime = addMinutes(startTime, durationValue);
      } else if (durationUnit === 'hours') {
        endTime = addHours(startTime, durationValue);
      } else if (durationUnit === 'days') {
        endTime = addDays(startTime, durationValue);
      } else {
        endTime = startTime; // Fallback
      }
      return format(endTime, 'HH:mm', { locale: es });
    };

    const formattedDate = format(reservationDateTime, 'PPP', { locale: es });
    const formattedTime = format(reservationDateTime, 'HH:mm', { locale: es });
    const calculatedEndTime = calculateEndTime(reservationDateTime, durationValue, durationUnit);

    let locationDetails = '';
    if (eventType === 'Online' && onlineUrl) {
      locationDetails = `Online: <a href="${onlineUrl}" target="_blank" rel="noopener noreferrer">${onlineUrl}</a>`;
    } else if (address) {
      locationDetails = `Presencial: ${address}`;
    }

    const formattedDuration = `${durationValue} ${durationUnit === 'minutes' ? 'minutos' : durationUnit === 'hours' ? 'horas' : 'días'}`;

    // Leer la plantilla del email
    const emailTemplatePath = path.join(process.cwd(), 'emailTemplates', 'confirmationEmail.html');
    const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf8');

    // Reemplazar los placeholders con los datos reales para el participante
    const participantEmailContent = emailTemplate
      .replace(/\{\{eventName\}\}/g, eventName)
      .replace(/\{\{eventDate\}\}/g, formattedDate)
      .replace(/\{\{eventTime\}\}/g, formattedTime)
      .replace(/\{\{endTime\}\}/g, calculatedEndTime)
      .replace(/\{\{eventLocation\}\}/g, locationDetails)
      .replace(/\{\{hostName\}\}/g, hostName)
      .replace(/\{\{participantName\}\}/g, name)
      .replace(/\{\{participantEmail\}\}/g, email)
      .replace(/\{\{eventDuration\}\}/g, formattedDuration)
      .replace(/\{\{isParticipant\}\}/g, 'true'); // Variable para la plantilla
    
    // Contenido para el anfitrión (opcional, si quieres una plantilla diferente o texto simple)
    const hostEmailContent = emailTemplate
      .replace(/\{\{eventName\}\}/g, eventName)
      .replace(/\{\{eventDate\}\}/g, formattedDate)
      .replace(/\{\{eventTime\}\}/g, formattedTime)
      .replace(/\{\{endTime\}\}/g, calculatedEndTime)
      .replace(/\{\{eventLocation\}\}/g, locationDetails)
      .replace(/\{\{hostName\}\}/g, hostName)
      .replace(/\{\{participantName\}\}/g, name)
      .replace(/\{\{participantEmail\}\}/g, email)
      .replace(/\{\{eventDuration\}\}/g, formattedDuration)
      .replace(/\{\{isParticipant\}\}/g, 'false'); // Variable para la plantilla
    
    // Enviar email al participante
    const participantEmailRes = await resend.emails.send({
      from: `Appointments App <${process.env.RESEND_FROM_EMAIL}>`,
      to: email,
      subject: `Confirmación de tu reserva para ${eventName}`,
      html: participantEmailContent
    })
    
    if (participantEmailRes.error) {
      console.error("Error al enviar email al participante:", participantEmailRes.error);
      throw new Error("Fallo al enviar el email al participante.");
    }
    
    // Enviar email al anfitrión
    const hostEmailRes = await resend.emails.send({
      from: `Appointments App <${process.env.RESEND_FROM_EMAIL}>`,
      to: hostEmail,
      subject: `Nueva reserva para tu evento ${eventName}`,
      html: hostEmailContent
    })
    
    if (hostEmailRes.error) {
      console.error("Error al enviar email al anfitrión:", hostEmailRes.error);
      // No arrojamos un error para no bloquear la confirmación del usuario
      // pero registramos el fallo.
    }
    
    return NextResponse.json({ success: true, participantEmailId: participantEmailRes.data?.id, hostEmailId: hostEmailRes.data?.id })
  } catch (error) {
    console.error("Error en la ruta /api/send:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}