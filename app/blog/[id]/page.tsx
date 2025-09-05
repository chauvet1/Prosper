"use client"

import { useParams } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { LanguageToggle } from "@/components/language-toggle"
import { ThemeToggle } from "@/components/theme-toggle"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTranslations } from "@/hooks/use-translations"
import { useBlogPost } from "@/hooks/use-blog-data"
import { Calendar, Clock, ArrowLeft, Share2, Heart } from "lucide-react"
import { BlogPostComponent } from "@/components/blog-post"

export default function BlogPostPage() {
  const params = useParams()
  const { t, locale } = useTranslations()
  const { post, loading, error } = useBlogPost(params.id as string)

  if (loading) {
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
                  className="mr-2 h-4"
                />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/">
                      {locale === 'fr' ? 'Accueil' : 'Home'}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/blog">
                      {t.blog.title}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>
                      {locale === 'fr' ? 'Chargement...' : 'Loading...'}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              </div>
              <div className="flex items-center gap-2 px-4">
                <LanguageToggle />
                <ThemeToggle />
              </div>
            </header>

            <div className="flex flex-1 flex-col gap-4 p-4 pt-0 overflow-auto">
            {/* Loading skeleton */}
            <Card className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-8 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="h-screen overflow-hidden">
        <SidebarProvider defaultOpen={false}>
          <AppSidebar />
          <SidebarInset className="flex flex-col h-screen">
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/">
                      {locale === 'fr' ? 'Accueil' : 'Home'}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/blog">
                      {t.blog.title}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>
                      {locale === 'fr' ? 'Article non trouvé' : 'Post not found'}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="ml-auto flex items-center gap-2 px-4">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <Card>
              <CardContent className="p-6 text-center">
                <h1 className="text-2xl font-bold mb-4">
                  {locale === 'fr' ? 'Article non trouvé' : 'Post not found'}
                </h1>
                <p className="text-muted-foreground mb-4">
                  {locale === 'fr' 
                    ? 'L\'article que vous recherchez n\'existe pas ou a été supprimé.'
                    : 'The post you\'re looking for doesn\'t exist or has been removed.'
                  }
                </p>
                <Button onClick={() => window.history.back()}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {locale === 'fr' ? 'Retour' : 'Go back'}
                </Button>
              </CardContent>
            </Card>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    )
  }

  return (
    <div className="h-screen overflow-hidden">
      <SidebarProvider defaultOpen={false}>
        <AppSidebar />
        <SidebarInset className="flex flex-col h-screen">
          <header className="flex h-16 shrink-0 items-center gap-2 justify-between sticky top-0 z-50">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/">
                    {locale === 'fr' ? 'Accueil' : 'Home'}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/blog">
                    {t.blog.title}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="max-w-[200px] truncate">
                    {post.title[locale]}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto flex items-center gap-2 px-4">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Heart className="h-4 w-4" />
            </Button>
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </header>

          <div className="flex flex-1 flex-col gap-4 p-4 pt-0 overflow-auto">
          {/* Back button */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-fit"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {locale === 'fr' ? 'Retour aux articles' : 'Back to articles'}
          </Button>

          {/* Blog post content */}
          <BlogPostComponent 
            post={post} 
            onBack={() => window.history.back()} 
          />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
