import { NextRequest, NextResponse } from 'next/server'
import calendarService from '@/lib/calendar-service'
import { rateLimiters, getClientIdentifier } from '@/lib/rate-limiter'
import { ErrorLogger, AppError, formatErrorResponse } from '@/lib/error-handler'

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
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const timezone = searchParams.get('timezone') || 'America/Toronto'

    if (!startDate || !endDate) {
      return NextResponse.json(
        formatErrorResponse(new AppError('Start date and end date are required', 400)),
        { status: 400 }
      )
    }

    // Validate date format
    const startDateObj = new Date(startDate)
    const endDateObj = new Date(endDate)
    
    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      return NextResponse.json(
        formatErrorResponse(new AppError('Invalid date format. Use YYYY-MM-DD', 400)),
        { status: 400 }
      )
    }

    // Limit date range to prevent abuse
    const daysDiff = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24))
    if (daysDiff > 60) {
      return NextResponse.json(
        formatErrorResponse(new AppError('Date range cannot exceed 60 days', 400)),
        { status: 400 }
      )
    }

    const availableSlots = await calendarService.getAvailableSlots(
      startDate,
      endDate,
      { timezone }
    )

    return NextResponse.json({
      success: true,
      slots: availableSlots,
      dateRange: {
        start: startDate,
        end: endDate,
        timezone
      },
      summary: {
        totalSlots: availableSlots.length,
        availableSlots: availableSlots.filter(slot => slot.available).length,
        bookedSlots: availableSlots.filter(slot => !slot.available).length
      }
    })

  } catch (error) {
    ErrorLogger.log(error as Error, { 
      endpoint: 'calendar-availability'
    })
    
    return NextResponse.json(
      formatErrorResponse(error as Error),
      { status: 500 }
    )
  }
}
