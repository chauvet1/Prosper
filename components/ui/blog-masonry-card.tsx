"use client";

import React from "react";
import Image from "next/image";
import { BlogPost } from "@/lib/blog-data";

interface BlogMasonryCardProps {
  post: BlogPost;
  locale: 'en' | 'fr';
  onReadMore: (postId: string) => void;
}

const BlogMasonryCard = ({ post, locale, onReadMore }: BlogMasonryCardProps) => {
  // Generate consistent height based on post ID for masonry effect
  const heights = [300, 400, 350, 280, 320, 360, 250, 380];
  const heightIndex = post.id.charCodeAt(0) % heights.length;
  const imageHeight = heights[heightIndex];

  // Get primary image if available
  const primaryImage = post.images?.find(img => img.isPrimary) || post.images?.[0];

  // Generate tag colors based on post category/tags
  const getTagColor = (tag: string) => {
    const colors = {
      'React': 'bg-blue-50/50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400',
      'JavaScript': 'bg-yellow-50/50 text-yellow-600 dark:bg-yellow-950/20 dark:text-yellow-400',
      'TypeScript': 'bg-blue-50/50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400',
      'AI': 'bg-purple-50/50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400',
      'DALL-E': 'bg-pink-50/50 text-pink-600 dark:bg-pink-950/20 dark:text-pink-400',
      'Tutorial': 'bg-green-50/50 text-green-600 dark:bg-green-950/20 dark:text-green-400',
      'Performance': 'bg-orange-50/50 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400',
      'Frontend': 'bg-cyan-50/50 text-cyan-600 dark:bg-cyan-950/20 dark:text-cyan-400',
      'Backend': 'bg-emerald-50/50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400',
      'Testing': 'bg-rose-50/50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400',
      'Images': 'bg-indigo-50/50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400'
    };
    return colors[tag as keyof typeof colors] || 'bg-muted/50 text-muted-foreground';
  };

  return (
    <div className="group bg-card rounded-xl shadow-sm border border-border/50 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className="relative overflow-hidden p-4">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.altText[locale]}
            width={400}
            height={imageHeight}
            className="w-full object-cover rounded-md transition-transform duration-300 group-hover:scale-105"
            style={{ height: `${imageHeight}px` }}
          />
        ) : (
          <div
            className="w-full bg-gradient-to-br from-muted/30 to-muted/50 rounded-md flex items-center justify-center"
            style={{ height: `${imageHeight}px` }}
          >
            <div className="text-center text-muted-foreground">
              <svg className="h-12 w-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">{post.title[locale].substring(0, 20)}...</p>
            </div>
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-card-foreground text-lg mb-2 group-hover:text-primary transition-colors">
          {post.title[locale]}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {post.excerpt[locale]}
        </p>
        <div className="mt-3 flex items-center text-xs">
          {post.tags.slice(0, 1).map((tag) => (
            <span key={tag} className={`px-2 py-1 rounded-full ${getTagColor(tag)}`}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export { BlogMasonryCard };
