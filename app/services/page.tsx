"use client"

import { HoverEffect } from "@/components/ui/card-hover-effect"
import { useTranslations } from "@/hooks/use-translations"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { LanguageToggle } from "@/components/language-toggle"
import { ThemeToggle } from "@/components/theme-toggle"
import { AIAssistant } from "@/components/ui/ai-assistant"

export default function ServicesPage() {
  const { locale } = useTranslations()

  const content = {
    en: {
      title: "Professional Services",
      subtitle: "Comprehensive full-stack development solutions tailored to your business needs",
      services: [
        {
          title: "Frontend Development",
          description: "Modern, responsive web applications using React.js, Next.js, Vue.js, and Angular. Creating intuitive user interfaces with optimal performance and accessibility.",
        },
        {
          title: "Backend Development", 
          description: "Robust server-side solutions with Node.js, PHP, Python, and Java. Building scalable APIs, microservices, and database architectures.",
        },
        {
          title: "Database Design & Management",
          description: "Efficient database solutions using MySQL, PostgreSQL, MongoDB, and Firebase. Optimization, migration, and data modeling services.",
        },
        {
          title: "API Development & Integration",
          description: "RESTful and GraphQL API development, third-party integrations, payment gateways, and real-time communication systems.",
        },
        {
          title: "Mobile App Development",
          description: "Cross-platform mobile applications using React Native and progressive web apps (PWAs) for iOS and Android platforms.",
        },
        {
          title: "DevOps & Deployment",
          description: "Cloud deployment on AWS, Google Cloud, Vercel, and VPS. CI/CD pipelines, containerization, and infrastructure management.",
        },
        {
          title: "UI/UX Design",
          description: "User-centered design approach with wireframing, prototyping, and responsive design implementation for optimal user experience.",
        },
        {
          title: "E-commerce Solutions",
          description: "Complete online store development with payment processing, inventory management, and customer relationship systems.",
        },
        {
          title: "Custom Web Applications",
          description: "Tailored web solutions for specific business requirements, from CRM systems to data analytics dashboards.",
        },
        {
          title: "AI Integration",
          description: "Implementing artificial intelligence and machine learning solutions to enhance your applications with smart features.",
        },
        {
          title: "Maintenance & Support",
          description: "Ongoing technical support, bug fixes, security updates, and performance optimization for existing applications.",
        },
        {
          title: "Consulting & Strategy",
          description: "Technical consulting, architecture planning, technology stack recommendations, and digital transformation guidance.",
        },
      ]
    },
    fr: {
      title: "Services Professionnels",
      subtitle: "Solutions de développement full-stack complètes adaptées aux besoins de votre entreprise",
      services: [
        {
          title: "Développement Frontend",
          description: "Applications web modernes et responsives utilisant React.js, Next.js, Vue.js et Angular. Création d'interfaces utilisateur intuitives avec performance et accessibilité optimales.",
        },
        {
          title: "Développement Backend",
          description: "Solutions côté serveur robustes avec Node.js, PHP, Python et Java. Construction d'APIs évolutives, microservices et architectures de base de données.",
        },
        {
          title: "Conception et Gestion de Base de Données",
          description: "Solutions de base de données efficaces utilisant MySQL, PostgreSQL, MongoDB et Firebase. Services d'optimisation, migration et modélisation de données.",
        },
        {
          title: "Développement et Intégration d'API",
          description: "Développement d'API RESTful et GraphQL, intégrations tierces, passerelles de paiement et systèmes de communication en temps réel.",
        },
        {
          title: "Développement d'Applications Mobiles",
          description: "Applications mobiles multiplateformes utilisant React Native et applications web progressives (PWA) pour iOS et Android.",
        },
        {
          title: "DevOps et Déploiement",
          description: "Déploiement cloud sur AWS, Google Cloud, Vercel et VPS. Pipelines CI/CD, conteneurisation et gestion d'infrastructure.",
        },
        {
          title: "Design UI/UX",
          description: "Approche de conception centrée sur l'utilisateur avec wireframing, prototypage et implémentation de design responsive.",
        },
        {
          title: "Solutions E-commerce",
          description: "Développement complet de boutiques en ligne avec traitement des paiements, gestion d'inventaire et systèmes de relation client.",
        },
        {
          title: "Applications Web Personnalisées",
          description: "Solutions web sur mesure pour des exigences métier spécifiques, des systèmes CRM aux tableaux de bord d'analyse de données.",
        },
        {
          title: "Intégration IA",
          description: "Implémentation de solutions d'intelligence artificielle et d'apprentissage automatique pour enrichir vos applications.",
        },
        {
          title: "Maintenance et Support",
          description: "Support technique continu, corrections de bugs, mises à jour de sécurité et optimisation des performances.",
        },
        {
          title: "Conseil et Stratégie",
          description: "Conseil technique, planification d'architecture, recommandations de stack technologique et guidance de transformation digitale.",
        },
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
                    <BreadcrumbPage>Services</BreadcrumbPage>
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
                  <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                    {currentContent.subtitle}
                  </p>
                </div>

                {/* Services Grid */}
                <HoverEffect
                  items={currentContent.services.map((service) => ({
                    title: service.title,
                    description: service.description,
                    link: "/contact",
                  }))}
                  className="grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 px-0"
                />

                {/* Call to Action */}
                <div className="text-center mt-16 p-8 bg-muted/30 rounded-lg">
                  <h2 className="text-2xl font-bold mb-4">
                    {locale === 'en' ? 'Ready to Start Your Project?' : 'Prêt à Démarrer Votre Projet ?'}
                  </h2>
                  <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                    {locale === 'en'
                      ? 'Let\'s discuss your requirements and create a custom solution that perfectly fits your business needs.'
                      : 'Discutons de vos exigences et créons une solution personnalisée qui correspond parfaitement aux besoins de votre entreprise.'
                    }
                  </p>
                  <a
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {locale === 'en' ? 'Get In Touch' : 'Contactez-Moi'}
                  </a>
                </div>
              </div>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>

      {/* AI Assistant */}
      <AIAssistant locale={locale} context="services" />
    </div>
  )
}
