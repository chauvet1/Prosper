"use client"

import { HoverEffect } from "@/components/ui/card-hover-effect"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { FileText, Scale, AlertTriangle, Mail, Calendar } from "lucide-react"
import { useTranslations } from "@/hooks/use-translations"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { LanguageToggle } from "@/components/language-toggle"
import { ThemeToggle } from "@/components/theme-toggle"
import { AIAssistant } from "@/components/ui/ai-assistant"

export default function TermsConditionsPage() {
  const { locale } = useTranslations()

  const content = {
    en: {
      title: "Terms & Conditions",
      lastUpdated: "Last updated: January 2025",
      intro: "These Terms and Conditions (\"Terms\") govern your use of the Prosper Merimee portfolio website. By accessing or using our website, you agree to be bound by these Terms.",
      sections: [
        {
          title: "Use of Website",
          icon: FileText,
          content: [
            "You may use this website for lawful purposes only",
            "You agree not to use the website in any way that could damage, disable, or impair the website",
            "You may not attempt to gain unauthorized access to any part of the website",
            "All content on this website is for informational purposes only"
          ]
        },
        {
          title: "Intellectual Property",
          icon: Scale,
          content: [
            "All content, including text, graphics, logos, and code, is the property of Prosper Merimee",
            "You may not reproduce, distribute, or create derivative works without written permission",
            "Project descriptions and technical details are provided for portfolio demonstration purposes",
            "Third-party trademarks and logos are the property of their respective owners"
          ]
        },
        {
          title: "Disclaimers",
          icon: AlertTriangle,
          content: [
            "The website is provided \"as is\" without warranties of any kind",
            "We do not guarantee the accuracy, completeness, or reliability of any information",
            "We are not liable for any damages arising from your use of the website",
            "External links are provided for convenience and we are not responsible for their content"
          ]
        },
        {
          title: "Professional Services",
          icon: Mail,
          content: [
            "Information about services is provided for general information only",
            "Any professional engagement requires a separate written agreement",
            "Project timelines and costs are estimates and subject to change",
            "We reserve the right to decline any project or service request"
          ]
        }
      ],
      additional: [
        {
          title: "Modifications",
          content: "We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting on the website."
        },
        {
          title: "Governing Law",
          content: "These Terms are governed by the laws of Cameroon. Any disputes will be resolved in the courts of Yaoundé, Cameroon."
        },
        {
          title: "Contact Information",
          content: "If you have any questions about these Terms, please contact us at xsmalfred@gmail.com"
        }
      ]
    },
    fr: {
      title: "Conditions Générales",
      lastUpdated: "Dernière mise à jour : Janvier 2025",
      intro: "Ces Conditions Générales (\"Conditions\") régissent votre utilisation du site portfolio de Prosper Merimee. En accédant ou en utilisant notre site web, vous acceptez d'être lié par ces Conditions.",
      sections: [
        {
          title: "Utilisation du Site Web",
          icon: FileText,
          content: [
            "Vous ne pouvez utiliser ce site web qu'à des fins légales",
            "Vous acceptez de ne pas utiliser le site web d'une manière qui pourrait endommager, désactiver ou altérer le site web",
            "Vous ne pouvez pas tenter d'obtenir un accès non autorisé à toute partie du site web",
            "Tout le contenu de ce site web est à des fins d'information uniquement"
          ]
        },
        {
          title: "Propriété Intellectuelle",
          icon: Scale,
          content: [
            "Tout le contenu, y compris le texte, les graphiques, les logos et le code, est la propriété de Prosper Merimee",
            "Vous ne pouvez pas reproduire, distribuer ou créer des œuvres dérivées sans autorisation écrite",
            "Les descriptions de projets et les détails techniques sont fournis à des fins de démonstration de portfolio",
            "Les marques et logos de tiers sont la propriété de leurs propriétaires respectifs"
          ]
        },
        {
          title: "Avertissements",
          icon: AlertTriangle,
          content: [
            "Le site web est fourni \"tel quel\" sans garanties d'aucune sorte",
            "Nous ne garantissons pas l'exactitude, l'exhaustivité ou la fiabilité de toute information",
            "Nous ne sommes pas responsables des dommages résultant de votre utilisation du site web",
            "Les liens externes sont fournis pour votre commodité et nous ne sommes pas responsables de leur contenu"
          ]
        },
        {
          title: "Services Professionnels",
          icon: Mail,
          content: [
            "Les informations sur les services sont fournies à titre d'information générale uniquement",
            "Tout engagement professionnel nécessite un accord écrit séparé",
            "Les délais et coûts des projets sont des estimations et sujets à changement",
            "Nous nous réservons le droit de décliner toute demande de projet ou de service"
          ]
        }
      ],
      additional: [
        {
          title: "Modifications",
          content: "Nous nous réservons le droit de modifier ces Conditions à tout moment. Les changements prendront effet immédiatement après publication sur le site web."
        },
        {
          title: "Droit Applicable",
          content: "Ces Conditions sont régies par les lois du Cameroun. Tout litige sera résolu devant les tribunaux de Yaoundé, Cameroun."
        },
        {
          title: "Informations de Contact",
          content: "Si vous avez des questions concernant ces Conditions, veuillez nous contacter à xsmalfred@gmail.com"
        }
      ]
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
                    <BreadcrumbPage>Terms & Conditions</BreadcrumbPage>
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
          <FileText className="h-8 w-8 text-primary" />
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

      {/* Main Sections */}
      <HoverEffect
        items={currentContent.sections.map((section) => ({
          title: section.title,
          description: section.content.join('\n\n• '),
        }))}
        className="grid-cols-1 sm:grid-cols-2 gap-6 px-0 mb-8"
      />

      {/* Additional Terms */}
      <HoverEffect
        items={currentContent.additional.map((item) => ({
          title: item.title,
          description: item.content,
        }))}
        className="grid-cols-1 sm:grid-cols-2 gap-6 px-0"
      />
              </div>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>

      {/* AI Assistant */}
      <AIAssistant locale={locale} context="terms" />
    </div>
  )
}
