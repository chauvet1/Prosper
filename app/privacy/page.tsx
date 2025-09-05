"use client"

import { HoverEffect } from "@/components/ui/card-hover-effect"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Shield, Eye, Lock, Mail, Calendar } from "lucide-react"
import { useTranslations } from "@/hooks/use-translations"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { LanguageToggle } from "@/components/language-toggle"
import { ThemeToggle } from "@/components/theme-toggle"

export default function PrivacyPolicyPage() {
  const { locale } = useTranslations()

  const content = {
    en: {
      title: "Privacy Policy",
      lastUpdated: "Last updated: January 2025",
      intro: "This Privacy Policy describes how Prosper Merimee (\"we\", \"our\", or \"us\") collects, uses, and protects your information when you visit our portfolio website.",
      sections: [
        {
          title: "Information We Collect",
          icon: Eye,
          content: [
            "Personal information you provide when contacting us (name, email, message)",
            "Technical information such as IP address, browser type, and device information",
            "Usage data including pages visited and time spent on the site",
            "Cookies and similar tracking technologies for analytics purposes"
          ]
        },
        {
          title: "How We Use Your Information",
          icon: Shield,
          content: [
            "To respond to your inquiries and provide customer support",
            "To improve our website and user experience",
            "To analyze website traffic and usage patterns",
            "To comply with legal obligations and protect our rights"
          ]
        },
        {
          title: "Data Protection",
          icon: Lock,
          content: [
            "We implement appropriate security measures to protect your personal information",
            "Your data is stored securely and access is limited to authorized personnel",
            "We do not sell, trade, or rent your personal information to third parties",
            "We retain your information only as long as necessary for the stated purposes"
          ]
        },
        {
          title: "Your Rights",
          icon: Mail,
          content: [
            "You have the right to access, update, or delete your personal information",
            "You can opt-out of non-essential communications at any time",
            "You can request a copy of the data we hold about you",
            "You can file a complaint with relevant data protection authorities"
          ]
        }
      ],
      contact: "If you have any questions about this Privacy Policy, please contact us at:",
      email: "xsmalfred@gmail.com"
    },
    fr: {
      title: "Politique de Confidentialité",
      lastUpdated: "Dernière mise à jour : Janvier 2025",
      intro: "Cette Politique de Confidentialité décrit comment Prosper Merimee (\"nous\", \"notre\", ou \"nos\") collecte, utilise et protège vos informations lorsque vous visitez notre site portfolio.",
      sections: [
        {
          title: "Informations que Nous Collectons",
          icon: Eye,
          content: [
            "Informations personnelles que vous fournissez lors de nous contacter (nom, email, message)",
            "Informations techniques telles que l'adresse IP, le type de navigateur et les informations de l'appareil",
            "Données d'utilisation incluant les pages visitées et le temps passé sur le site",
            "Cookies et technologies de suivi similaires à des fins d'analyse"
          ]
        },
        {
          title: "Comment Nous Utilisons Vos Informations",
          icon: Shield,
          content: [
            "Pour répondre à vos demandes et fournir un support client",
            "Pour améliorer notre site web et l'expérience utilisateur",
            "Pour analyser le trafic et les modèles d'utilisation du site web",
            "Pour respecter les obligations légales et protéger nos droits"
          ]
        },
        {
          title: "Protection des Données",
          icon: Lock,
          content: [
            "Nous mettons en place des mesures de sécurité appropriées pour protéger vos informations personnelles",
            "Vos données sont stockées en sécurité et l'accès est limité au personnel autorisé",
            "Nous ne vendons, n'échangeons ou ne louons pas vos informations personnelles à des tiers",
            "Nous conservons vos informations seulement aussi longtemps que nécessaire pour les fins déclarées"
          ]
        },
        {
          title: "Vos Droits",
          icon: Mail,
          content: [
            "Vous avez le droit d'accéder, de mettre à jour ou de supprimer vos informations personnelles",
            "Vous pouvez vous désabonner des communications non essentielles à tout moment",
            "Vous pouvez demander une copie des données que nous détenons sur vous",
            "Vous pouvez déposer une plainte auprès des autorités compétentes de protection des données"
          ]
        }
      ],
      contact: "Si vous avez des questions concernant cette Politique de Confidentialité, veuillez nous contacter à :",
      email: "xsmalfred@gmail.com"
    }
  }

  const currentContent = content[locale]

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
                    <BreadcrumbPage>Privacy Policy</BreadcrumbPage>
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
              <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          {currentContent.title}
        </h1>
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {currentContent.lastUpdated}
        </p>
      </div>

      {/* Introduction */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <p className="text-lg leading-relaxed text-muted-foreground">
            {currentContent.intro}
          </p>
        </CardContent>
      </Card>

      {/* Sections */}
      <HoverEffect
        items={currentContent.sections.map((section) => ({
          title: section.title,
          description: section.content.join('\n\n• '),
        }))}
        className="grid-cols-1 sm:grid-cols-2 gap-6 px-0"
      />

      {/* Contact Information */}
      <Card className="mt-8">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-lg mb-4">{currentContent.contact}</p>
            <a 
              href={`mailto:${currentContent.email}`}
              className="text-primary hover:underline font-medium text-lg"
            >
              {currentContent.email}
            </a>
          </div>
        </CardContent>
      </Card>
              </div>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
