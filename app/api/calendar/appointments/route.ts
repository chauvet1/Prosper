import { NextRequest, NextResponse } from 'next/server'
import calendarService from '@/lib/calendar-service'
import { rateLimiters, getClientIdentifier } from '@/lib/rate-limiter'
import { ErrorLogger, AppError, formatErrorResponse } from '@/lib/error-handler'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - more restrictive for booking
    const identifier = getClientIdentifier(request)
    const rateLimitResult = rateLimiters.leadCapture.check(identifier)
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        formatErrorResponse(new AppError('Too many booking requests, please try again later', 429)),
        { 
          status: 429,
          headers: rateLimiters.leadCapture.getHeaders(identifier)
        }
      )
    }

    const body = await request.json()
    const {
      clientName,
      clientEmail,
      clientPhone,
      company,
      projectType,
      description,
      date,
      time,
      duration,
      timezone,
      meetingType,
      preferredLanguage
    } = body

    // Validate required fields
    if (!clientName || !clientEmail || !projectType || !description || !date || !time) {
      return NextResponse.json(
        formatErrorResponse(new AppError('Missing required fields', 400)),
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(clientEmail)) {
      return NextResponse.json(
        formatErrorResponse(new AppError('Invalid email format', 400)),
        { status: 400 }
      )
    }

    // Validate date format
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) {
      return NextResponse.json(
        formatErrorResponse(new AppError('Invalid date format. Use YYYY-MM-DD', 400)),
        { status: 400 }
      )
    }

    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(time)) {
      return NextResponse.json(
        formatErrorResponse(new AppError('Invalid time format. Use HH:MM', 400)),
        { status: 400 }
      )
    }

    // Book the appointment
    const result = await calendarService.bookAppointment({
      clientName,
      clientEmail,
      clientPhone,
      company,
      projectType,
      description,
      date,
      time,
      duration: duration || 60,
      timezone: timezone || 'America/Toronto',
      meetingType: meetingType || 'VIDEO',
      preferredLanguage: preferredLanguage || 'en'
    })

    if (!result.success) {
      return NextResponse.json(
        formatErrorResponse(new AppError(result.error || 'Failed to book appointment', 400)),
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      appointmentId: result.appointmentId,
      message: preferredLanguage === 'fr' 
        ? 'Rendez-vous réservé avec succès!'
        : 'Appointment booked successfully!',
      details: {
        date,
        time,
        duration: duration || 60,
        meetingType: meetingType || 'VIDEO'
      }
    })

  } catch (error) {
    ErrorLogger.log(error as Error, { 
      endpoint: 'calendar-appointments'
    })
    
    return NextResponse.json(
      formatErrorResponse(error as Error),
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getClientIdentifier(request)
    const rateLimitResult = rateLimiters.api.check(identifier)
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        formatErrorResponse(new AppError('Too many requests, please try again later', 429)),
        { 
          status: 429,
          headers: rateLimiters.api.getHeaders(identifier)
        }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    const appointments = await calendarService.getUpcomingAppointments(limit)

    return NextResponse.json({
      success: true,
      appointments,
      count: appointments.length
    })

  } catch (error) {
    ErrorLogger.log(error as Error, { 
      endpoint: 'calendar-appointments-get'
    })
    
    return NextResponse.json(
      formatErrorResponse(error as Error),
      { status: 500 }
    )
  }
}
