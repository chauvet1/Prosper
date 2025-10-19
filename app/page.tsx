"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUserRole } from "@/hooks/use-user-role"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { PortfolioContent } from "@/components/portfolio-content"
import { AIAssistant } from "@/components/ui/ai-assistant"
import { useTranslations } from "@/hooks/use-translations"

export default function Home() {
  const { locale } = useTranslations()
  const { isAuthenticated, isLoading, role } = useUserRole()
  const router = useRouter()

  // Redirect authenticated users to their appropriate dashboard
  useEffect(() => {
    console.log('Landing page redirect check:', { isAuthenticated, isLoading, role });
    if (!isLoading && isAuthenticated) {
      if (role === 'admin') {
        console.log('Redirecting admin to /admin');
        router.push('/admin')
      } else if (role === 'client') {
        console.log('Redirecting client to /dashboard');
        router.push('/dashboard')
      } else {
        console.log('User authenticated but no role determined, staying on landing page');
      }
    }
  }, [isAuthenticated, isLoading, role, router])

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show nothing if authenticated (will redirect)
  if (isAuthenticated) {
    return null
  }

  // Show landing page for unauthenticated users
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
                    <BreadcrumbLink href="#">
                      Dashboard
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Home</BreadcrumbPage>
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
            <div className="h-full p-4 pb-8">
              <PortfolioContent />
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>

      {/* AI Assistant */}
      <AIAssistant locale={locale} context="home" />
    </div>
  )
}
