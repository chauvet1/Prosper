"use client"

import * as React from "react"
import { useTranslations } from "@/hooks/use-translations"
import { BlogPost } from "@/lib/blog-data"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, ArrowLeft, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface BlogPostComponentProps {
  post: BlogPost
  onBack?: () => void
}

export function BlogPostComponent({ post, onBack }: BlogPostComponentProps) {
  const { t, locale } = useTranslations()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {onBack && (
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Button>
      )}
      
      <Card>
        <CardHeader className="space-y-4">
          <div className="space-y-2">
            <CardTitle className="text-3xl">{post.title[locale]}</CardTitle>
            <CardDescription className="text-lg">{post.excerpt[locale]}</CardDescription>
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(post.publishedAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{post.readTime} min read</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <Badge key={index} variant="secondary">{tag}</Badge>
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Featured Images */}
          {post.images && post.images.length > 0 && (
            <div className="space-y-4">
              {post.images.map((image, index) => (
                <div key={image.id} className="space-y-2">
                  <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={image.url}
                      alt={image.altText[locale]}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                      priority={index === 0}
                    />
                  </div>
                  {image.caption[locale] && (
                    <p className="text-sm text-muted-foreground text-center italic">
                      {image.caption[locale]}
                    </p>
                  )}
                  {image.model && (
                    <div className="flex justify-center">
                      <Badge variant="outline" className="text-xs">
                        <ImageIcon className="mr-1 h-3 w-3" />
                        Generated with {image.model}
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Blog Content */}
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: post.content[locale].replace(/\n/g, '<br />') }} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
