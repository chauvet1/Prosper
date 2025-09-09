"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, ArrowRight, Sparkles, BookOpen, Briefcase, FolderOpen, Lightbulb } from 'lucide-react'
import Link from 'next/link'

interface ContentRecommendation {
  id: string
  type: 'blog_post' | 'service' | 'project'
  title: string
  excerpt: string
  url: string
  score: number
  reason: string
  tags: string[]
  readTime?: number
  category?: string
}

interface SmartRecommendationsProps {
  sessionId: string
  currentPage: string
  locale: 'en' | 'fr'
  limit?: number
  showAIRecommendations?: boolean
  className?: string
}

export default function SmartRecommendations({
  sessionId,
  currentPage,
  locale,
  limit = 6,
  showAIRecommendations = false,
  className = ""
}: SmartRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<ContentRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recommendationType, setRecommendationType] = useState<'standard' | 'ai' | 'default'>('standard')
  const [userInterests, setUserInterests] = useState<string[]>([])

  useEffect(() => {
    fetchRecommendations()
  }, [sessionId, currentPage, locale, limit, showAIRecommendations])

  const fetchRecommendations = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        sessionId,
        page: currentPage,
        locale,
        limit: limit.toString(),
        ...(showAIRecommendations && { type: 'ai' })
      })

      const response = await fetch(`/api/recommendations?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setRecommendations(data.recommendations || [])
      setRecommendationType(data.type || 'standard')
      setUserInterests(data.userInterests || [])

    } catch (error) {
      console.error('Error fetching recommendations:', error)
      setError(locale === 'fr' 
        ? 'Erreur lors du chargement des recommandations'
        : 'Error loading recommendations'
      )
    } finally {
      setLoading(false)
    }
  }

  const trackInteraction = async (recommendationId: string, action: string) => {
    try {
      await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          action: {
            type: 'interaction',
            data: {
              recommendationId,
              action,
              page: currentPage
            }
          }
        })
      })
    } catch (error) {
      console.error('Error tracking interaction:', error)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'blog_post':
        return <BookOpen className="h-4 w-4" />
      case 'service':
        return <Briefcase className="h-4 w-4" />
      case 'project':
        return <FolderOpen className="h-4 w-4" />
      default:
        return <Lightbulb className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    const labels = {
      blog_post: locale === 'fr' ? 'Article' : 'Article',
      service: locale === 'fr' ? 'Service' : 'Service',
      project: locale === 'fr' ? 'Projet' : 'Project'
    }
    return labels[type as keyof typeof labels] || type
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'blog_post':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'service':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'project':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 animate-pulse" />
          <h3 className="text-lg font-semibold">
            {locale === 'fr' ? 'Chargement des recommandations...' : 'Loading recommendations...'}
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <Button 
          onClick={fetchRecommendations} 
          variant="outline" 
          className="mt-4"
        >
          {locale === 'fr' ? 'Réessayer' : 'Try Again'}
        </Button>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <Lightbulb className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">
          {locale === 'fr' 
            ? 'Aucune recommandation disponible pour le moment'
            : 'No recommendations available at the moment'
          }
        </p>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">
            {locale === 'fr' ? 'Recommandations Personnalisées' : 'Personalized Recommendations'}
          </h3>
          {recommendationType === 'ai' && (
            <Badge variant="secondary" className="ml-2">
              {locale === 'fr' ? 'IA' : 'AI'}
            </Badge>
          )}
        </div>
        
        {userInterests.length > 0 && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {locale === 'fr' ? 'Basé sur vos intérêts:' : 'Based on your interests:'} {userInterests.slice(0, 3).join(', ')}
          </div>
        )}
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((rec) => (
          <Card key={rec.id} className="group hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <Badge className={getTypeColor(rec.type)}>
                  <span className="flex items-center gap-1">
                    {getTypeIcon(rec.type)}
                    {getTypeLabel(rec.type)}
                  </span>
                </Badge>
                {rec.readTime && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="h-3 w-3" />
                    {rec.readTime} min
                  </div>
                )}
              </div>
              <CardTitle className="text-base line-clamp-2 group-hover:text-blue-600 transition-colors">
                {rec.title}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-0">
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                {rec.excerpt}
              </p>
              
              {rec.reason && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mb-4 italic">
                  {rec.reason}
                </p>
              )}
              
              {rec.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {rec.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              
              <Link href={rec.url} onClick={() => trackInteraction(rec.id, 'click')}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors"
                >
                  {locale === 'fr' ? 'Découvrir' : 'Explore'}
                  <ArrowRight className="h-3 w-3 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Footer */}
      {recommendationType !== 'default' && (
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {locale === 'fr' 
              ? 'Recommandations basées sur votre activité et vos intérêts'
              : 'Recommendations based on your activity and interests'
            }
          </p>
        </div>
      )}
    </div>
  )
}
