"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { LanguageToggle } from "@/components/language-toggle"
import { ThemeToggle } from "@/components/theme-toggle"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTranslations } from "@/hooks/use-translations"
import { useBlogPosts } from "@/hooks/use-blog-data"
import { Calendar, Clock, Search, Filter, ExternalLink } from "lucide-react"

export default function BlogPage() {
  const { t, locale } = useTranslations()
  const { posts, loading, error } = useBlogPosts()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Filter posts based on search and category
  const filteredPosts = posts.filter(post => {
    const matchesSearch = searchTerm === "" ||
      post.title[locale].toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt[locale].toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === null ||
      post.tags.includes(selectedCategory)

    return matchesSearch && matchesCategory
  })

  // Get unique categories from all posts
  const categories = Array.from(new Set(posts.flatMap(post => post.tags)))

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
                    <BreadcrumbPage>{t.blog.title}</BreadcrumbPage>
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
          {/* Blog Header */}
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t.blog.title}</h1>
              <p className="text-muted-foreground">
                {locale === 'fr' 
                  ? 'Découvrez nos derniers articles sur le développement web, l\'IA et les technologies modernes.'
                  : 'Discover our latest articles on web development, AI, and modern technologies.'
                }
              </p>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={locale === 'fr' ? 'Rechercher des articles...' : 'Search articles...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  {locale === 'fr' ? 'Tous' : 'All'}
                </Button>
                {categories.slice(0, 5).map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Blog Posts Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <div className="h-6 bg-muted rounded w-16"></div>
                        <div className="h-6 bg-muted rounded w-20"></div>
                      </div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : error ? (
              // Error state
              <Card className="col-span-full">
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">
                    {locale === 'fr' 
                      ? 'Impossible de charger les articles pour le moment.'
                      : 'Unable to load articles at the moment.'
                    }
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">{error}</p>
                </CardContent>
              </Card>
            ) : filteredPosts.length === 0 ? (
              // No results
              <Card className="col-span-full">
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">
                    {searchTerm || selectedCategory
                      ? (locale === 'fr' ? 'Aucun article trouvé.' : 'No articles found.')
                      : (locale === 'fr' ? 'Aucun article disponible.' : 'No articles available.')
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              // Blog posts
              filteredPosts.map((post) => (
                <Card key={post.id} className="group hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {post.title[locale]}
                    </CardTitle>
                    <CardDescription className="line-clamp-3">
                      {post.excerpt[locale]}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {post.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {post.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{post.tags.length - 3}
                        </Badge>
                      )}
                    </div>

                    {/* Meta info */}
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(post.publishedAt).toLocaleDateString(
                              locale === 'fr' ? 'fr-FR' : 'en-US'
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{post.readTime} min</span>
                        </div>
                      </div>
                      {post.featured && (
                        <Badge variant="default" className="text-xs">
                          {locale === 'fr' ? 'À la une' : 'Featured'}
                        </Badge>
                      )}
                    </div>

                    {/* Read more button */}
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      onClick={() => window.open(`/blog/${post.id}`, '_blank')}
                    >
                      <ExternalLink className="mr-2 h-3 w-3" />
                      {t.blog.readMore}
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Results count */}
          {!loading && !error && (
            <div className="text-center text-sm text-muted-foreground">
              {locale === 'fr' 
                ? `${filteredPosts.length} article${filteredPosts.length !== 1 ? 's' : ''} trouvé${filteredPosts.length !== 1 ? 's' : ''}`
                : `${filteredPosts.length} article${filteredPosts.length !== 1 ? 's' : ''} found`
              }
            </div>
          )}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
