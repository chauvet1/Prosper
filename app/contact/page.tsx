"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HoverEffect } from "@/components/ui/card-hover-effect"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Send } from "lucide-react"
import { useTranslations } from "@/hooks/use-translations"
import { portfolioData } from "@/lib/portfolio-data"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { LanguageToggle } from "@/components/language-toggle"
import { ThemeToggle } from "@/components/theme-toggle"
import { AIAssistant } from "@/components/ui/ai-assistant"

export default function ContactPage() {
  const { locale } = useTranslations()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const content = {
    en: {
      title: "Get In Touch",
      subtitle: "Ready to start your next project? Let's connect and discuss opportunities.",
      form: {
        name: "Full Name",
        email: "Email Address",
        subject: "Subject",
        message: "Message",
        send: "Send Message",
        sending: "Sending..."
      },
      info: {
        title: "Contact Information",
        email: "Email",
        phone: "Phone",
        location: "Location",
        website: "Website",
        availability: "Availability"
      },
      availability: "Available for freelance projects",
      response: "I typically respond within 24 hours"
    },
    fr: {
      title: "Contactez-Moi",
      subtitle: "Prêt à démarrer votre prochain projet ? Connectons-nous et discutons des opportunités.",
      form: {
        name: "Nom Complet",
        email: "Adresse Email",
        subject: "Sujet",
        message: "Message",
        send: "Envoyer le Message",
        sending: "Envoi en cours..."
      },
      info: {
        title: "Informations de Contact",
        email: "Email",
        phone: "Téléphone",
        location: "Localisation",
        website: "Site Web",
        availability: "Disponibilité"
      },
      availability: "Disponible pour des projets freelance",
      response: "Je réponds généralement dans les 24 heures"
    }
  }

  const currentContent = content[locale]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Reset form
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: ""
    })
    setIsSubmitting(false)
    
    // In a real application, you would send the data to your backend
    alert(locale === 'fr' ? 'Message envoyé avec succès!' : 'Message sent successfully!')
  }

  return (
    <div className="h-screen overflow-hidden">
      <SidebarProvider defaultOpen={false}>
        <AppSidebar />
        <SidebarInset className="flex flex-col h-screen">
          <header className="flex h-16 shrink-0 items-center gap-2 justify-between sticky top-0 z-50">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/">
                      Dashboard
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Contact</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="flex items-center gap-2 px-4">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth">
            <div className="flex flex-1 flex-col gap-8 p-6 pt-0">
              <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          {currentContent.title}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {currentContent.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              {currentContent.form.send}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">{currentContent.form.name}</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">{currentContent.form.email}</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="subject">{currentContent.form.subject}</Label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="message">{currentContent.form.message}</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="mt-1"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? currentContent.form.sending : currentContent.form.send}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <HoverEffect
          items={[
            {
              title: currentContent.info.email,
              description: `📧 ${portfolioData.personal.email}`,
              link: `mailto:${portfolioData.personal.email}`,
            },
            {
              title: currentContent.info.phone,
              description: `📞 +237 691-958-707`,
            },
            {
              title: currentContent.info.location,
              description: `📍 Total Messasi, Yaoundé, Cameroon`,
            },
            {
              title: currentContent.info.website,
              description: `🌐 pepis.pro`,
              link: "https://pepis.pro",
            },
            {
              title: currentContent.info.availability,
              description: `${currentContent.availability}\n\n${currentContent.response}`,
            },
          ]}
          className="grid-cols-1 sm:grid-cols-2 gap-4 px-0"
        />
      </div>
              </div>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>

      {/* AI Assistant */}
      <AIAssistant locale={locale} context="contact" />
    </div>
  )
}
