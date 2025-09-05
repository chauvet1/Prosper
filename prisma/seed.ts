import { PrismaClient, PostStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create blog categories
  const categories = await Promise.all([
    prisma.blogCategory.upsert({
      where: { slug: 'web-development' },
      update: {},
      create: {
        name: 'Web Development',
        slug: 'web-development',
        descriptionEn: 'Modern web development techniques and frameworks',
        descriptionFr: 'Techniques et frameworks de développement web modernes',
        color: '#3B82F6',
        icon: 'Code',
        sortOrder: 1,
      },
    }),
    prisma.blogCategory.upsert({
      where: { slug: 'javascript' },
      update: {},
      create: {
        name: 'JavaScript',
        slug: 'javascript',
        descriptionEn: 'JavaScript tutorials and best practices',
        descriptionFr: 'Tutoriels JavaScript et meilleures pratiques',
        color: '#F59E0B',
        icon: 'FileText',
        sortOrder: 2,
      },
    }),
    prisma.blogCategory.upsert({
      where: { slug: 'react-nextjs' },
      update: {},
      create: {
        name: 'React & Next.js',
        slug: 'react-nextjs',
        descriptionEn: 'React and Next.js development guides',
        descriptionFr: 'Guides de développement React et Next.js',
        color: '#06B6D4',
        icon: 'Layers',
        sortOrder: 3,
      },
    }),
    prisma.blogCategory.upsert({
      where: { slug: 'ai-ml' },
      update: {},
      create: {
        name: 'AI & Machine Learning',
        slug: 'ai-ml',
        descriptionEn: 'Artificial Intelligence and ML integration',
        descriptionFr: 'Intelligence artificielle et intégration ML',
        color: '#8B5CF6',
        icon: 'Brain',
        sortOrder: 4,
      },
    }),
    prisma.blogCategory.upsert({
      where: { slug: 'devops-cloud' },
      update: {},
      create: {
        name: 'DevOps & Cloud',
        slug: 'devops-cloud',
        descriptionEn: 'DevOps practices and cloud deployment',
        descriptionFr: 'Pratiques DevOps et déploiement cloud',
        color: '#10B981',
        icon: 'Cloud',
        sortOrder: 5,
      },
    }),
  ])

  // Create blog tags
  const tags = await Promise.all([
    'React', 'Next.js', 'TypeScript', 'JavaScript', 'Node.js', 'AI', 'Machine Learning',
    'DevOps', 'Cloud', 'Performance', 'SEO', 'Best Practices', 'Tutorial', 'Guide', 'Tips'
  ].map(tagName => 
    prisma.blogTag.upsert({
      where: { slug: tagName.toLowerCase().replace(/[^a-z0-9]/g, '-') },
      update: {},
      create: {
        name: tagName,
        slug: tagName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        description: `Posts related to ${tagName}`,
      },
    })
  ))

  // Create sample blog posts
  const samplePosts = [
    {
      titleEn: 'Modern Web Development Trends in 2024',
      titleFr: 'Tendances du Développement Web Moderne en 2024',
      excerptEn: 'Exploring the latest trends in web development including AI integration, serverless architecture, and modern frameworks.',
      excerptFr: 'Explorer les dernières tendances du développement web incluant l\'intégration IA, l\'architecture serverless et les frameworks modernes.',
      contentEn: `# Modern Web Development Trends in 2024

The web development landscape continues to evolve rapidly. Here are the key trends shaping the industry:

## AI Integration
Artificial Intelligence is becoming integral to web development, from automated code generation to intelligent user experiences.

## Serverless Architecture
Serverless computing is revolutionizing how we build and deploy applications, offering better scalability and cost efficiency.

## Modern Frameworks
Next.js, React, and other modern frameworks continue to dominate the development ecosystem.`,
      contentFr: `# Tendances du Développement Web Moderne en 2024

Le paysage du développement web continue d'évoluer rapidement. Voici les tendances clés qui façonnent l'industrie :

## Intégration IA
L'Intelligence Artificielle devient intégrale au développement web, de la génération automatique de code aux expériences utilisateur intelligentes.

## Architecture Serverless
L'informatique serverless révolutionne la façon dont nous construisons et déployons les applications.

## Frameworks Modernes
Next.js, React et autres frameworks modernes continuent de dominer l'écosystème de développement.`,
      category: 'web-development',
      tags: ['Web Development', 'AI', 'Serverless', 'React', 'Next.js'],
      keywords: ['web development', '2024 trends', 'AI integration', 'serverless', 'React', 'Next.js'],
      featured: true,
    },
    {
      titleEn: 'Building Scalable Web Applications with Next.js',
      titleFr: 'Construire des Applications Web Évolutives avec Next.js',
      excerptEn: 'Learn best practices for building scalable web applications using Next.js, including performance optimization and deployment strategies.',
      excerptFr: 'Apprenez les meilleures pratiques pour construire des applications web évolutives avec Next.js, incluant l\'optimisation des performances et les stratégies de déploiement.',
      contentEn: `# Building Scalable Web Applications with Next.js

Next.js provides excellent tools for building scalable applications. Here's how to leverage them effectively.

## Performance Optimization
- Image optimization with next/image
- Code splitting and lazy loading
- Server-side rendering strategies

## Deployment Best Practices
- Vercel deployment optimization
- CDN configuration
- Environment management`,
      contentFr: `# Construire des Applications Web Évolutives avec Next.js

Next.js fournit d'excellents outils pour construire des applications évolutives. Voici comment les exploiter efficacement.

## Optimisation des Performances
- Optimisation d'images avec next/image
- Division de code et chargement paresseux
- Stratégies de rendu côté serveur

## Meilleures Pratiques de Déploiement
- Optimisation du déploiement Vercel
- Configuration CDN
- Gestion d'environnement`,
      category: 'react-nextjs',
      tags: ['Next.js', 'Scalability', 'Performance', 'Deployment'],
      keywords: ['Next.js', 'scalable applications', 'performance optimization', 'web development'],
      featured: false,
    },
  ]

  for (const postData of samplePosts) {
    const slug = postData.titleEn.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-')
    
    await prisma.blogPost.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        titleEn: postData.titleEn,
        titleFr: postData.titleFr,
        excerptEn: postData.excerptEn,
        excerptFr: postData.excerptFr,
        contentEn: postData.contentEn,
        contentFr: postData.contentFr,
        metaDescriptionEn: postData.excerptEn,
        metaDescriptionFr: postData.excerptFr,
        keywords: postData.keywords,
        tags: postData.tags,
        category: postData.category,
        contentType: 'article',
        technicalLevel: 'intermediate',
        targetAudience: 'developers',
        status: PostStatus.PUBLISHED,
        featured: postData.featured,
        publishedAt: new Date(),
        aiGenerated: false,
        readTime: 5,
        wordCount: postData.contentEn.split(' ').length,
        seoScore: 85,
      },
    })
  }

  // Schedule some automated blog generation
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(9, 0, 0, 0) // 9 AM tomorrow

  const topics = [
    'TypeScript Advanced Patterns for Better Code',
    'Building RESTful APIs with Node.js and Express',
    'React Performance Optimization Techniques',
    'AI-Powered Development Tools in 2024',
    'Database Design Best Practices',
  ]

  for (let i = 0; i < topics.length; i++) {
    const scheduledDate = new Date(tomorrow)
    scheduledDate.setDate(scheduledDate.getDate() + i)

    await prisma.generationQueue.create({
      data: {
        topic: topics[i],
        category: 'web-development',
        contentType: 'tutorial',
        targetAudience: 'developers',
        technicalLevel: 'intermediate',
        scheduledFor: scheduledDate,
        priority: 5,
        seoKeywords: [topics[i].toLowerCase().split(' ').slice(0, 3).join(' ')],
        generationConfig: {
          wordCount: 1500,
          includeCode: true,
          tone: 'professional',
        },
      },
    })
  }

  console.log('✅ Database seeded successfully!')
  console.log(`📝 Created ${categories.length} categories`)
  console.log(`🏷️ Created ${tags.length} tags`)
  console.log(`📄 Created ${samplePosts.length} sample posts`)
  console.log(`⏰ Scheduled ${topics.length} automated blog generations`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
