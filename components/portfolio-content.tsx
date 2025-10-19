"use client"

import * as React from "react"
import { useTranslations } from "@/hooks/use-translations"
import { useRecentPosts } from "@/hooks/use-blog-data"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SkillsSection } from "@/components/skills-section"
import { ProjectsEvervaultCards } from "@/components/projects-evervault-cards"
import { ExperienceEvervaultCards } from "@/components/experience-evervault-cards"
import { AboutMeSpotlight } from "@/components/about-me-spotlight"
import { PortfolioFooter } from "@/components/portfolio-footer"
import SmartRecommendations from "@/components/ui/smart-recommendations"
import { useSmartRecommendations } from "@/hooks/use-behavior-tracking"
import { Mail, Phone, ExternalLink, Calendar, Clock } from "lucide-react"

export function PortfolioContent() {
  const { t, locale } = useTranslations()
  const { posts: recentPosts, loading, error } = useRecentPosts(3)
  const { recommendationProps } = useSmartRecommendations('home', locale)

  return (
    <div className="flex flex-1 flex-col gap-8 p-6 pt-0">
      {/* About Me Section with Spotlight Cards */}
      <AboutMeSpotlight />

      {/* Experience Section */}
      <section id="experience" className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold">{t.experience.title}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {locale === 'en'
              ? "Explore my professional journey with encrypted-style Evervault cards featuring interactive hover effects and dynamic animations"
              : "Explorez mon parcours professionnel avec des cartes de style crypté Evervault avec des effets de survol interactifs et des animations dynamiques"
            }
          </p>
        </div>
        <ExperienceEvervaultCards />
      </section>

      {/* Skills Section */}
      <SkillsSection />

      {/* Projects Section */}
      <section id="projects" className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold">{t.projects.title}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {locale === 'en'
              ? "Discover my featured projects with encrypted-style Evervault cards featuring interactive hover effects and dynamic animations"
              : "Découvrez mes projets phares avec des cartes de style crypté Evervault avec des effets de survol interactifs et des animations dynamiques"
            }
          </p>
        </div>
        <ProjectsEvervaultCards />
      </section>

      {/* Smart Recommendations */}
      <div className="mt-8">
        <SmartRecommendations
          {...recommendationProps}
          limit={4}
          className="max-w-6xl mx-auto"
        />
      </div>

      {/* Blog Section */}
      <section id="blog" className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{t.blog.title}</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('/blog', '_blank')}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            {locale === 'fr' ? 'Voir tous les articles' : 'View all posts'}
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))
          ) : error ? (
            // Error state
            <Card className="col-span-full">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  Unable to load blog posts at the moment.
                </p>
              </CardContent>
            </Card>
          ) : recentPosts.length === 0 ? (
            // Empty state
            <Card className="col-span-full">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  No blog posts available yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            // Actual posts
            recentPosts.map((post, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{post.title?.[locale] || post.title || 'Untitled'}</CardTitle>
                <CardDescription>{post.excerpt?.[locale] || post.excerpt || 'No description available'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {post.tags.slice(0, 3).map((tag, tagIndex) => (
                    <Badge key={tagIndex} variant="secondary">{tag}</Badge>
                  ))}
                </div>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(post.publishedAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{post.readTime} min</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
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
      </section>

      {/* Contact Section - Simplified since footer has detailed contact */}
      <section id="contact" className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold">{t.contact.title}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {locale === 'en'
              ? "Ready to start your next project? Let's connect and discuss how we can work together."
              : "Prêt à commencer votre prochain projet ? Connectons-nous et discutons de la façon dont nous pouvons travailler ensemble."
            }
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
          <Button size="lg" className="w-full sm:w-auto">
            <Mail className="mr-2 h-4 w-4" />
            {t.hero.cta}
          </Button>
          <Button variant="outline" size="lg" className="w-full sm:w-auto">
            <Phone className="mr-2 h-4 w-4" />
            {t.contact.phone}
          </Button>
        </div>
      </section>

      {/* Footer Section */}
      <PortfolioFooter />
    </div>
  )
}
