import React from 'react'
import { Resend } from 'resend'
import { renderAsync } from '@react-email/render'

const resend = new Resend(process.env.RESEND_API_KEY)

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'http://localhost:3000'
}

export function buildFrom(raw?: string): string {
  if (!raw) {
    return 'Appointments App <onboarding@resend.dev>'
  }
  const trimmed = String(raw).trim()
  const angleMatch = trimmed.match(/<([^>]+)>/)
  const email = (angleMatch ? angleMatch[1] : trimmed).trim()
  const name = angleMatch ? trimmed.replace(/<[^>]+>/, '').trim() || 'Appointments App' : 'Appointments App'
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  if (!isValidEmail) {
    return 'Appointments App <onboarding@resend.dev>'
  }
  return `${name} <${email}>`
}

export async function renderEmail(Component: React.ComponentType<any>, props: Record<string, any>): Promise<string> {
  const element = React.createElement(Component, props)
  return await renderAsync(element)
}

interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  from?: string
  tags?: { name: string; value: string }[]
}

export async function sendEmail({ to, subject, html, from, tags }: SendEmailOptions) {
  const finalFrom = buildFrom(from || process.env.RESEND_FROM_EMAIL)
  const result = await resend.emails.send({ from: finalFrom, to, subject, html, tags })
  if (result.error) {
    throw new Error(`Resend error: ${JSON.stringify(result.error)}`)
  }
  return result
}
