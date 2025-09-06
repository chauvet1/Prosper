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
      'React': 'bg-blue-100 text-blue-700',
      'JavaScript': 'bg-yellow-100 text-yellow-700',
      'TypeScript': 'bg-blue-100 text-blue-700',
      'AI': 'bg-purple-100 text-purple-700',
      'DALL-E': 'bg-pink-100 text-pink-700',
      'Tutorial': 'bg-green-100 text-green-700',
      'Performance': 'bg-orange-100 text-orange-700',
      'Frontend': 'bg-cyan-100 text-cyan-700',
      'Backend': 'bg-emerald-100 text-emerald-700',
      'Testing': 'bg-rose-100 text-rose-700',
      'Images': 'bg-indigo-100 text-indigo-700'
    };
    return colors[tag as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="group bg-white dark:bg-gray-900 rounded-xl shadow-2xl/10 border-0 overflow-hidden transition-all duration-300 hover:-translate-y-1">
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
            className="w-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-md flex items-center justify-center"
            style={{ height: `${imageHeight}px` }}
          >
            <div className="text-center text-gray-500 dark:text-gray-400">
              <svg className="h-12 w-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">{post.title[locale].substring(0, 20)}...</p>
            </div>
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {post.title[locale]}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
          {post.excerpt[locale]}
        </p>
        <div className="mt-3 flex items-center text-xs text-gray-400 dark:text-gray-500">
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
