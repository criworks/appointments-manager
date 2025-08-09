import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabase } from '@/lib/supabaseClient'
import fs from 'fs'
import path from 'path'
// import { DBReservation, DBEvent } from '@/types'
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
    const { data: reservationFromDb, error: reservationError } = await supabase
      .from('reservations')
      .select('*, events(*)')
      .eq('id', reservationId)
      .single() as unknown as { data: any, error: any }

    if (reservationError || !reservationFromDb) {
      console.error("Error al obtener la reserva desde la DB:", reservationError);
      throw new Error("No se pudo encontrar la reserva.");
    }

    const event = (reservationFromDb as any).events;
    const reservationDateTime = new Date(`${date}T${time}:00`);

    const calculateEndTime = (startTime: Date, dValue: number, dUnit: 'minutes' | 'hours' | 'days'): string => {
      let endTime: Date;
      if (dUnit === 'minutes') {
        endTime = addMinutes(startTime, dValue);
      } else if (dUnit === 'hours') {
        endTime = addHours(startTime, dValue);
      } else if (dUnit === 'days') {
        endTime = addDays(startTime, dValue);
      } else {
        endTime = startTime;
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

    const emailTemplatePath = path.join(process.cwd(), 'emailTemplates', 'confirmationEmail.html');
    const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf8');

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
      .replace(/\{\{isParticipant\}\}/g, 'true');
    
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
      .replace(/\{\{isParticipant\}\}/g, 'false');
    
    const participantEmailRes = await resend.emails.send({
      from: `Appointments App <${process.env.RESEND_FROM_EMAIL}>`,
      to: email,
      subject: `Confirmación de tu reserva para ${eventName}`,
      html: participantEmailContent
    })
    
    if ((participantEmailRes as any).error) {
      console.error("Error al enviar email al participante:", (participantEmailRes as any).error);
      throw new Error("Fallo al enviar el email al participante.");
    }
    
    const hostEmailRes = await resend.emails.send({
      from: `Appointments App <${process.env.RESEND_FROM_EMAIL}>`,
      to: hostEmail,
      subject: `Nueva reserva para tu evento ${eventName}`,
      html: hostEmailContent
    })
    
    if ((hostEmailRes as any).error) {
      console.error("Error al enviar email al anfitrión:", (hostEmailRes as any).error);
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error en la ruta /api/send:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}