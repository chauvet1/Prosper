"use client"

import { Button } from "@/components/ui/button"
import { HoverEffect } from "@/components/ui/card-hover-effect"
import { Card, CardContent } from "@/components/ui/card"
import { portfolioData } from "@/lib/portfolio-data"
import { useTranslations } from "@/hooks/use-translations"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { LanguageToggle } from "@/components/language-toggle"
import { ThemeToggle } from "@/components/theme-toggle"

export default function ProjectsPage() {
  const { locale } = useTranslations()

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
                    <BreadcrumbPage>Projects</BreadcrumbPage>
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
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">
          {locale === 'fr' ? 'Mes Projets' : 'My Projects'}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          {locale === 'fr'
            ? 'Découvrez une sélection de mes projets les plus récents, allant des applications web aux solutions blockchain.'
            : 'Explore a selection of my recent projects, ranging from web applications to blockchain solutions.'
          }
        </p>
      </div>

      {/* Projects Grid */}
      <HoverEffect
        items={portfolioData.projects.map((project) => ({
          title: project.name,
          description: `${locale === 'fr' ? project.description.fr : project.description.en}

🛠️ Technologies: ${project.tech.join(" • ")}

📊 Status: ${project.status}`,
          link: project.name === "Prellia.com" ? "https://prellia.com" :
                project.name === "Pepis Dev" ? "https://pepis.pro" : undefined,
        }))}
        className="grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 px-0"
      />

      {/* Additional Info Section */}
      <div className="mt-12 text-center">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <h3 className="text-xl font-semibold mb-3">
              {locale === 'fr' ? 'Intéressé par une collaboration ?' : 'Interested in collaborating?'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {locale === 'fr'
                ? 'Je suis toujours ouvert à de nouveaux projets et opportunités. Contactez-moi pour discuter de vos idées.'
                : "I'm always open to new projects and opportunities. Get in touch to discuss your ideas."
              }
            </p>
            <Button asChild>
              <a href="/contact">
                {locale === 'fr' ? 'Me Contacter' : 'Contact Me'}
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
              </div>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
