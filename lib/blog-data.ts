export interface BlogImage {
  id: string
  url: string
  filename: string
  altText: {
    en: string
    fr: string
  }
  caption: {
    en: string
    fr: string
  }
  style: string
  aspectRatio: string
  model: string
  isPrimary: boolean
  generatedAt: string
}

export interface BlogPost {
  id: string
  title: {
    en: string
    fr: string
  }
  excerpt: {
    en: string
    fr: string
  }
  content: {
    en: string
    fr: string
  }
  publishedAt: string
  tags: string[]
  readTime: number
  featured: boolean
  seo: {
    metaDescription: {
      en: string
      fr: string
    }
    keywords: string[]
  }
  images?: BlogImage[]
}

// All blog posts now come from the database via BlogService
// No more mock data - everything is real AI-generated content
export const blogPosts: BlogPost[] = [
  // This array is kept for type compatibility but is no longer used
  // All data comes from the database via BlogService
  {
    id: "modern-web-development-2024",
    title: {
      en: "Modern Web Development Trends in 2024",
      fr: "Tendances du Développement Web Moderne en 2024"
    },
    excerpt: {
      en: "Exploring the latest trends in web development including AI integration, serverless architecture, and modern frameworks.",
      fr: "Explorer les dernières tendances du développement web incluant l'intégration IA, l'architecture serverless et les frameworks modernes."
    },
    content: {
      en: `# Modern Web Development Trends in 2024

The web development landscape continues to evolve rapidly. Here are the key trends shaping the industry:

## AI Integration
Artificial Intelligence is becoming integral to web development, from code generation to user experience optimization.

## Serverless Architecture
Serverless computing offers scalability and cost-effectiveness for modern applications.

## Modern Frameworks
Next.js, React, and other modern frameworks continue to dominate the development ecosystem.`,
      fr: `# Tendances du Développement Web Moderne en 2024

Le paysage du développement web continue d'évoluer rapidement. Voici les tendances clés qui façonnent l'industrie :

## Intégration IA
L'Intelligence Artificielle devient intégrale au développement web, de la génération de code à l'optimisation de l'expérience utilisateur.

## Architecture Serverless
L'informatique serverless offre évolutivité et rentabilité pour les applications modernes.

## Frameworks Modernes
Next.js, React et autres frameworks modernes continuent de dominer l'écosystème de développement.`
    },
    publishedAt: "2024-01-15",
    tags: ["Web Development", "AI", "Serverless", "React", "Next.js"],
    readTime: 5,
    featured: true,
    seo: {
      metaDescription: {
        en: "Discover the latest web development trends for 2024 including AI integration, serverless architecture, and modern frameworks.",
        fr: "Découvrez les dernières tendances du développement web pour 2024 incluant l'intégration IA, l'architecture serverless et les frameworks modernes."
      },
      keywords: ["web development", "2024 trends", "AI integration", "serverless", "React", "Next.js"]
    }
  },
  {
    id: "building-scalable-applications",
    title: {
      en: "Building Scalable Web Applications with Next.js",
      fr: "Construire des Applications Web Évolutives avec Next.js"
    },
    excerpt: {
      en: "Learn best practices for building scalable web applications using Next.js, including performance optimization and deployment strategies.",
      fr: "Apprenez les meilleures pratiques pour construire des applications web évolutives avec Next.js, incluant l'optimisation des performances et les stratégies de déploiement."
    },
    content: {
      en: `# Building Scalable Web Applications with Next.js

Next.js provides excellent tools for building scalable applications. Here's how to leverage them effectively.

## Performance Optimization
- Image optimization with next/image
- Code splitting and lazy loading
- Server-side rendering strategies

## Deployment Best Practices
- Vercel deployment optimization
- CDN configuration
- Environment management`,
      fr: `# Construire des Applications Web Évolutives avec Next.js

Next.js fournit d'excellents outils pour construire des applications évolutives. Voici comment les exploiter efficacement.

## Optimisation des Performances
- Optimisation d'images avec next/image
- Division de code et chargement paresseux
- Stratégies de rendu côté serveur

## Meilleures Pratiques de Déploiement
- Optimisation du déploiement Vercel
- Configuration CDN
- Gestion d'environnement`
    },
    publishedAt: "2024-01-10",
    tags: ["Next.js", "Scalability", "Performance", "Deployment"],
    readTime: 8,
    featured: false,
    seo: {
      metaDescription: {
        en: "Learn how to build scalable web applications with Next.js including performance optimization and deployment best practices.",
        fr: "Apprenez à construire des applications web évolutives avec Next.js incluant l'optimisation des performances et les meilleures pratiques de déploiement."
      },
      keywords: ["Next.js", "scalable applications", "performance optimization", "web development"]
    }
  },
  {
    id: "ai-powered-development-tools",
    title: {
      en: "AI-Powered Development Tools: The Future is Here",
      fr: "Outils de Développement Alimentés par l'IA : L'Avenir est Là"
    },
    excerpt: {
      en: "Discover how AI-powered tools are revolutionizing software development and how to integrate them into your workflow.",
      fr: "Découvrez comment les outils alimentés par l'IA révolutionnent le développement logiciel et comment les intégrer dans votre flux de travail."
    },
    content: {
      en: `# AI-Powered Development Tools: The Future is Here

AI is transforming how we write code. Here are the tools leading this revolution.

## Code Generation
- GitHub Copilot
- ChatGPT for coding
- Custom AI assistants

## Testing and Debugging
- AI-powered test generation
- Automated bug detection
- Performance optimization suggestions`,
      fr: `# Outils de Développement Alimentés par l'IA : L'Avenir est Là

L'IA transforme notre façon d'écrire du code. Voici les outils qui mènent cette révolution.

## Génération de Code
- GitHub Copilot
- ChatGPT pour le codage
- Assistants IA personnalisés

## Tests et Débogage
- Génération de tests alimentée par l'IA
- Détection automatisée de bugs
- Suggestions d'optimisation des performances`
    },
    publishedAt: "2024-01-05",
    tags: ["AI", "Development Tools", "Automation", "Productivity"],
    readTime: 6,
    featured: true,
    seo: {
      metaDescription: {
        en: "Explore AI-powered development tools that are revolutionizing software development and learn how to integrate them into your workflow.",
        fr: "Explorez les outils de développement alimentés par l'IA qui révolutionnent le développement logiciel et apprenez à les intégrer dans votre flux de travail."
      },
      keywords: ["AI tools", "development automation", "GitHub Copilot", "AI coding", "productivity"]
    }
  }
]

// These functions are now moved to API routes to avoid client-side Prisma imports
// Use API routes instead: /api/blog/posts, /api/blog/featured, etc.

// Client-side functions should use fetch to call API routes
export async function getFeaturedPosts(): Promise<BlogPost[]> {
  // This function should not be called client-side
  // Use API route: GET /api/blog/featured
  throw new Error('Use API route /api/blog/featured instead of direct database access')
}

export async function getRecentPosts(limit: number = 3): Promise<BlogPost[]> {
  // This function should not be called client-side
  // Use API route: GET /api/blog/posts?limit=${limit}
  throw new Error('Use API route /api/blog/posts instead of direct database access')
}

export async function getPostById(id: string): Promise<BlogPost | null> {
  // This function should not be called client-side
  // Use API route: GET /api/blog/posts/${id}
  throw new Error('Use API route /api/blog/posts/${id} instead of direct database access')
}
