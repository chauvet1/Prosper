// Calendar booking service for appointment scheduling
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface TimeSlot {
  id: string
  date: string
  time: string
  duration: number // in minutes
  available: boolean
  timezone: string
}

export interface Appointment {
  id: string
  clientName: string
  clientEmail: string
  clientPhone?: string
  company?: string
  projectType: string
  description: string
  date: string
  time: string
  duration: number
  timezone: string
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED'
  meetingType: 'VIDEO' | 'PHONE' | 'IN_PERSON'
  meetingLink?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface AvailabilityConfig {
  workingDays: number[] // 0 = Sunday, 1 = Monday, etc.
  workingHours: {
    start: string // "09:00"
    end: string   // "17:00"
  }
  timezone: string
  slotDuration: number // in minutes
  bufferTime: number   // buffer between appointments in minutes
  advanceBookingDays: number // how many days in advance can be booked
  blackoutDates: string[] // dates to exclude (YYYY-MM-DD)
}

class CalendarService {
  private defaultConfig: AvailabilityConfig = {
    workingDays: [1, 2, 3, 4, 5], // Monday to Friday
    workingHours: {
      start: "09:00",
      end: "17:00"
    },
    timezone: "America/Toronto", // Eastern Time
    slotDuration: 60, // 1 hour slots
    bufferTime: 15,   // 15 minutes between appointments
    advanceBookingDays: 30,
    blackoutDates: []
  }

  // Get available time slots for a date range
  async getAvailableSlots(
    startDate: string, 
    endDate: string, 
    config: Partial<AvailabilityConfig> = {}
  ): Promise<TimeSlot[]> {
    const finalConfig = { ...this.defaultConfig, ...config }
    const slots: TimeSlot[] = []

    const start = new Date(startDate)
    const end = new Date(endDate)
    
    // Generate slots for each day in the range
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.getDay()
      const dateStr = date.toISOString().split('T')[0]

      // Skip if not a working day
      if (!finalConfig.workingDays.includes(dayOfWeek)) continue

      // Skip if blackout date
      if (finalConfig.blackoutDates.includes(dateStr)) continue

      // Skip if too far in advance
      const today = new Date()
      const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      if (diffDays > finalConfig.advanceBookingDays) continue

      // Skip if in the past
      if (date < today) continue

      // Generate time slots for this day
      const daySlots = await this.generateDaySlots(dateStr, finalConfig)
      slots.push(...daySlots)
    }

    return slots
  }

  // Generate time slots for a specific day
  private async generateDaySlots(date: string, config: AvailabilityConfig): Promise<TimeSlot[]> {
    const slots: TimeSlot[] = []
    const [startHour, startMinute] = config.workingHours.start.split(':').map(Number)
    const [endHour, endMinute] = config.workingHours.end.split(':').map(Number)

    const startTime = startHour * 60 + startMinute // minutes from midnight
    const endTime = endHour * 60 + endMinute

    // Get existing appointments for this date
    const existingAppointments = await this.getAppointmentsForDate(date)

    // Generate slots
    for (let time = startTime; time < endTime; time += config.slotDuration + config.bufferTime) {
      const hour = Math.floor(time / 60)
      const minute = time % 60
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`

      // Check if slot conflicts with existing appointment
      const isAvailable = !existingAppointments.some(apt => {
        const aptTime = this.timeToMinutes(apt.time)
        return time < aptTime + apt.duration && time + config.slotDuration > aptTime
      })

      slots.push({
        id: `${date}-${timeStr}`,
        date,
        time: timeStr,
        duration: config.slotDuration,
        available: isAvailable,
        timezone: config.timezone
      })
    }

    return slots
  }

  // Book an appointment
  async bookAppointment(appointmentData: {
    clientName: string
    clientEmail: string
    clientPhone?: string
    company?: string
    projectType: string
    description: string
    date: string
    time: string
    duration?: number
    timezone?: string
    meetingType?: 'VIDEO' | 'PHONE' | 'IN_PERSON'
    preferredLanguage?: 'en' | 'fr'
  }): Promise<{ success: boolean; appointmentId?: string; error?: string }> {
    try {
      // Validate the time slot is available
      const isAvailable = await this.isSlotAvailable(
        appointmentData.date, 
        appointmentData.time, 
        appointmentData.duration || 60
      )

      if (!isAvailable) {
        return { success: false, error: 'Time slot is no longer available' }
      }

      // Generate meeting link for video calls
      let meetingLink: string | undefined
      if (appointmentData.meetingType === 'VIDEO') {
        meetingLink = await this.generateMeetingLink(appointmentData)
      }

      // Create appointment in database
      const appointment = await prisma.appointment.create({
        data: {
          clientName: appointmentData.clientName,
          clientEmail: appointmentData.clientEmail,
          clientPhone: appointmentData.clientPhone,
          company: appointmentData.company,
          projectType: appointmentData.projectType,
          description: appointmentData.description,
          date: appointmentData.date,
          time: appointmentData.time,
          duration: appointmentData.duration || 60,
          timezone: appointmentData.timezone || this.defaultConfig.timezone,
          status: 'SCHEDULED',
          meetingType: appointmentData.meetingType || 'VIDEO',
          meetingLink,
          preferredLanguage: appointmentData.preferredLanguage || 'en'
        }
      })

      // Send confirmation email (in a real app)
      await this.sendConfirmationEmail(appointment)

      return { success: true, appointmentId: appointment.id }

    } catch (error) {
      console.error('Error booking appointment:', error)
      return { success: false, error: 'Failed to book appointment' }
    }
  }

  // Check if a time slot is available
  private async isSlotAvailable(date: string, time: string, duration: number): Promise<boolean> {
    const appointments = await this.getAppointmentsForDate(date)
    const requestedTime = this.timeToMinutes(time)

    return !appointments.some(apt => {
      const aptTime = this.timeToMinutes(apt.time)
      return requestedTime < aptTime + apt.duration && requestedTime + duration > aptTime
    })
  }

  // Get appointments for a specific date
  private async getAppointmentsForDate(date: string): Promise<Appointment[]> {
    try {
      const appointments = await prisma.appointment.findMany({
        where: {
          date,
          status: {
            in: ['SCHEDULED', 'CONFIRMED']
          }
        }
      })

      return appointments.map(apt => ({
        id: apt.id,
        clientName: apt.clientName,
        clientEmail: apt.clientEmail,
        clientPhone: apt.clientPhone || undefined,
        company: apt.company || undefined,
        projectType: apt.projectType,
        description: apt.description,
        date: apt.date,
        time: apt.time,
        duration: apt.duration,
        timezone: apt.timezone,
        status: apt.status as any,
        meetingType: apt.meetingType as any,
        meetingLink: apt.meetingLink || undefined,
        notes: apt.notes || undefined,
        createdAt: apt.createdAt,
        updatedAt: apt.updatedAt
      }))
    } catch (error) {
      console.error('Error fetching appointments:', error)
      return []
    }
  }

  // Generate meeting link (placeholder - would integrate with Zoom, Google Meet, etc.)
  private async generateMeetingLink(appointmentData: any): Promise<string> {
    // In a real implementation, this would integrate with:
    // - Zoom API
    // - Google Meet API
    // - Microsoft Teams API
    // - Custom video solution

    const meetingId = `meeting-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    return `https://meet.example.com/${meetingId}`
  }

  // Send confirmation email (placeholder)
  private async sendConfirmationEmail(appointment: any): Promise<void> {
    // In a real implementation, this would send an email with:
    // - Appointment details
    // - Calendar invite (.ics file)
    // - Meeting link (if video call)
    // - Cancellation/rescheduling link

    console.log('Confirmation email sent for appointment:', appointment.id)
  }

  // Utility function to convert time string to minutes
  private timeToMinutes(time: string): number {
    const [hour, minute] = time.split(':').map(Number)
    return hour * 60 + minute
  }

  // Get upcoming appointments
  async getUpcomingAppointments(limit: number = 10): Promise<Appointment[]> {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      const appointments = await prisma.appointment.findMany({
        where: {
          date: {
            gte: today
          },
          status: {
            in: ['SCHEDULED', 'CONFIRMED']
          }
        },
        orderBy: [
          { date: 'asc' },
          { time: 'asc' }
        ],
        take: limit
      })

      return appointments.map(apt => ({
        id: apt.id,
        clientName: apt.clientName,
        clientEmail: apt.clientEmail,
        clientPhone: apt.clientPhone || undefined,
        company: apt.company || undefined,
        projectType: apt.projectType,
        description: apt.description,
        date: apt.date,
        time: apt.time,
        duration: apt.duration,
        timezone: apt.timezone,
        status: apt.status as any,
        meetingType: apt.meetingType as any,
        meetingLink: apt.meetingLink || undefined,
        notes: apt.notes || undefined,
        createdAt: apt.createdAt,
        updatedAt: apt.updatedAt
      }))
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error)
      return []
    }
  }

  // Cancel appointment
  async cancelAppointment(appointmentId: string, reason?: string): Promise<boolean> {
    try {
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          status: 'CANCELLED',
          notes: reason ? `Cancelled: ${reason}` : 'Cancelled'
        }
      })
      return true
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      return false
    }
  }
}

export const calendarService = new CalendarService()
export default calendarService
