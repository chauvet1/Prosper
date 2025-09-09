"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Video, Phone, MapPin, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { format, addDays, startOfWeek, addWeeks } from 'date-fns'

interface TimeSlot {
  id: string
  date: string
  time: string
  duration: number
  available: boolean
  timezone: string
}

interface AppointmentSchedulerProps {
  locale: 'en' | 'fr'
  onAppointmentBooked?: (appointmentId: string) => void
  className?: string
}

export default function AppointmentScheduler({
  locale,
  onAppointmentBooked,
  className = ""
}: AppointmentSchedulerProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [appointmentId, setAppointmentId] = useState<string>('')

  // Form data
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    company: '',
    projectType: '',
    description: '',
    meetingType: 'VIDEO' as 'VIDEO' | 'PHONE' | 'IN_PERSON'
  })

  // Generate date options (next 4 weeks)
  const generateDateOptions = () => {
    const dates = []
    const today = new Date()
    
    for (let i = 1; i <= 28; i++) {
      const date = addDays(today, i)
      const dayOfWeek = date.getDay()
      
      // Only include weekdays (Monday to Friday)
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        dates.push({
          value: format(date, 'yyyy-MM-dd'),
          label: format(date, locale === 'fr' ? 'EEEE d MMMM yyyy' : 'EEEE, MMMM d, yyyy')
        })
      }
    }
    
    return dates
  }

  // Fetch available slots for selected date
  const fetchAvailableSlots = async (date: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/calendar/availability?startDate=${date}&endDate=${date}`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setAvailableSlots(data.slots || [])

    } catch (error) {
      console.error('Error fetching slots:', error)
      setError(locale === 'fr' 
        ? 'Erreur lors du chargement des créneaux disponibles'
        : 'Error loading available time slots'
      )
    } finally {
      setLoading(false)
    }
  }

  // Handle date selection
  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setSelectedTime('')
    fetchAvailableSlots(date)
  }

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/calendar/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          date: selectedDate,
          time: selectedTime,
          duration: 60,
          timezone: 'America/Toronto',
          preferredLanguage: locale
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to book appointment')
      }

      const data = await response.json()
      setAppointmentId(data.appointmentId)
      setSuccess(true)
      setCurrentStep(4)

      if (onAppointmentBooked) {
        onAppointmentBooked(data.appointmentId)
      }

    } catch (error) {
      console.error('Error booking appointment:', error)
      setError((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const projectTypes = [
    { value: 'web-development', label: locale === 'fr' ? 'Développement Web' : 'Web Development' },
    { value: 'mobile-app', label: locale === 'fr' ? 'Application Mobile' : 'Mobile App' },
    { value: 'ai-integration', label: locale === 'fr' ? 'Intégration IA' : 'AI Integration' },
    { value: 'consulting', label: locale === 'fr' ? 'Conseil Technique' : 'Technical Consulting' },
    { value: 'other', label: locale === 'fr' ? 'Autre' : 'Other' }
  ]

  const meetingTypes = [
    { value: 'VIDEO', icon: Video, label: locale === 'fr' ? 'Visioconférence' : 'Video Call' },
    { value: 'PHONE', icon: Phone, label: locale === 'fr' ? 'Appel Téléphonique' : 'Phone Call' },
    { value: 'IN_PERSON', icon: MapPin, label: locale === 'fr' ? 'En Personne' : 'In Person' }
  ]

  if (success) {
    return (
      <Card className={`max-w-2xl mx-auto ${className}`}>
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-4">
            {locale === 'fr' ? 'Rendez-vous Confirmé!' : 'Appointment Confirmed!'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {locale === 'fr' 
              ? 'Votre rendez-vous a été réservé avec succès. Vous recevrez un email de confirmation sous peu.'
              : 'Your appointment has been successfully booked. You will receive a confirmation email shortly.'
            }
          </p>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
            <p className="font-medium">
              {locale === 'fr' ? 'Détails du rendez-vous:' : 'Appointment Details:'}
            </p>
            <p>{format(new Date(selectedDate), locale === 'fr' ? 'EEEE d MMMM yyyy' : 'EEEE, MMMM d, yyyy')}</p>
            <p>{selectedTime} (1 hour)</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {locale === 'fr' ? 'ID de rendez-vous:' : 'Appointment ID:'} {appointmentId}
            </p>
          </div>
          <Button onClick={() => window.location.reload()}>
            {locale === 'fr' ? 'Réserver un Autre Rendez-vous' : 'Book Another Appointment'}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`max-w-2xl mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {locale === 'fr' ? 'Réserver une Consultation' : 'Schedule a Consultation'}
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <div className={`w-2 h-2 rounded-full ${currentStep >= 1 ? 'bg-blue-600' : 'bg-gray-300'}`} />
          <span>{locale === 'fr' ? 'Date & Heure' : 'Date & Time'}</span>
          <div className={`w-2 h-2 rounded-full ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
          <span>{locale === 'fr' ? 'Informations' : 'Information'}</span>
          <div className={`w-2 h-2 rounded-full ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`} />
          <span>{locale === 'fr' ? 'Confirmation' : 'Confirmation'}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-red-600 dark:text-red-400">{error}</span>
          </div>
        )}

        {/* Step 1: Date & Time Selection */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">
                {locale === 'fr' ? 'Sélectionnez une date' : 'Select a date'}
              </Label>
              <Select value={selectedDate} onValueChange={handleDateSelect}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder={locale === 'fr' ? 'Choisir une date...' : 'Choose a date...'} />
                </SelectTrigger>
                <SelectContent>
                  {generateDateOptions().map((date) => (
                    <SelectItem key={date.value} value={date.value}>
                      {date.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedDate && (
              <div>
                <Label className="text-base font-medium">
                  {locale === 'fr' ? 'Créneaux disponibles' : 'Available time slots'}
                </Label>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {availableSlots.filter(slot => slot.available).map((slot) => (
                      <Button
                        key={slot.id}
                        variant={selectedTime === slot.time ? "default" : "outline"}
                        onClick={() => setSelectedTime(slot.time)}
                        className="justify-center"
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        {slot.time}
                      </Button>
                    ))}
                  </div>
                )}
                
                {selectedTime && (
                  <div className="mt-4">
                    <Button onClick={() => setCurrentStep(2)} className="w-full">
                      {locale === 'fr' ? 'Continuer' : 'Continue'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Information Form */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientName">
                  {locale === 'fr' ? 'Nom complet' : 'Full Name'} *
                </Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                  placeholder={locale === 'fr' ? 'Votre nom' : 'Your name'}
                  required
                />
              </div>

              <div>
                <Label htmlFor="clientEmail">
                  {locale === 'fr' ? 'Email' : 'Email'} *
                </Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
                  placeholder={locale === 'fr' ? 'votre@email.com' : 'your@email.com'}
                  required
                />
              </div>

              <div>
                <Label htmlFor="clientPhone">
                  {locale === 'fr' ? 'Téléphone' : 'Phone'}
                </Label>
                <Input
                  id="clientPhone"
                  type="tel"
                  value={formData.clientPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
                  placeholder={locale === 'fr' ? '+33 1 23 45 67 89' : '+1 (555) 123-4567'}
                />
              </div>

              <div>
                <Label htmlFor="company">
                  {locale === 'fr' ? 'Entreprise' : 'Company'}
                </Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  placeholder={locale === 'fr' ? 'Nom de votre entreprise' : 'Your company name'}
                />
              </div>
            </div>

            <div>
              <Label>
                {locale === 'fr' ? 'Type de projet' : 'Project Type'} *
              </Label>
              <Select value={formData.projectType} onValueChange={(value) => setFormData(prev => ({ ...prev, projectType: value }))}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder={locale === 'fr' ? 'Sélectionnez un type...' : 'Select a type...'} />
                </SelectTrigger>
                <SelectContent>
                  {projectTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>
                {locale === 'fr' ? 'Type de réunion' : 'Meeting Type'}
              </Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {meetingTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <Button
                      key={type.value}
                      variant={formData.meetingType === type.value ? "default" : "outline"}
                      onClick={() => setFormData(prev => ({ ...prev, meetingType: type.value as any }))}
                      className="flex flex-col items-center gap-1 h-auto py-3"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-xs">{type.label}</span>
                    </Button>
                  )
                })}
              </div>
            </div>

            <div>
              <Label htmlFor="description">
                {locale === 'fr' ? 'Description du projet' : 'Project Description'} *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder={locale === 'fr' 
                  ? 'Décrivez votre projet et vos objectifs...'
                  : 'Describe your project and goals...'
                }
                rows={4}
                required
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                {locale === 'fr' ? 'Retour' : 'Back'}
              </Button>
              <Button 
                onClick={() => setCurrentStep(3)}
                disabled={!formData.clientName || !formData.clientEmail || !formData.projectType || !formData.description}
                className="flex-1"
              >
                {locale === 'fr' ? 'Continuer' : 'Continue'}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {locale === 'fr' ? 'Confirmer votre rendez-vous' : 'Confirm your appointment'}
              </h3>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">
                    {format(new Date(selectedDate), locale === 'fr' ? 'EEEE d MMMM yyyy' : 'EEEE, MMMM d, yyyy')}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span>{selectedTime} - {locale === 'fr' ? '1 heure' : '1 hour'}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {formData.meetingType === 'VIDEO' && <Video className="h-4 w-4 text-blue-600" />}
                  {formData.meetingType === 'PHONE' && <Phone className="h-4 w-4 text-blue-600" />}
                  {formData.meetingType === 'IN_PERSON' && <MapPin className="h-4 w-4 text-blue-600" />}
                  <span>{meetingTypes.find(t => t.value === formData.meetingType)?.label}</span>
                </div>
                
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="font-medium">{formData.clientName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{formData.clientEmail}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {projectTypes.find(t => t.value === formData.projectType)?.label}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                {locale === 'fr' ? 'Retour' : 'Back'}
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {locale === 'fr' ? 'Réservation...' : 'Booking...'}
                  </>
                ) : (
                  locale === 'fr' ? 'Confirmer le Rendez-vous' : 'Confirm Appointment'
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
