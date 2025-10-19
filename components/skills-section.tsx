"use client"

import { HoverEffect } from "@/components/ui/card-hover-effect";
import { portfolioData } from "@/lib/portfolio-data";
import { useTranslations } from "@/hooks/use-translations";


interface SkillsSectionProps {
  title?: string;
  description?: string;
  showTitle?: boolean;
  className?: string;
  compact?: boolean;
}

export function SkillsSection({ 
  title, 
  description, 
  showTitle = true, 
  className = "",
  compact = false 
}: SkillsSectionProps) {
  const { t, locale } = useTranslations();

  const skillsData = [
    {
      title: t.skills.languages,
      description: portfolioData.skills.languages.join(" • "),
      seoDescription: "Expert in Java, TypeScript, JavaScript, Python, and PHP programming languages for enterprise-grade software development and web applications."
    },
    {
      title: "Frameworks",
      description: portfolioData.skills.frameworks.join(" • "),
      seoDescription: "Proficient in Spring Boot, Hibernate, Angular, React, Next.js, Node.js, and Laravel for building scalable full-stack applications."
    },
    {
      title: t.skills.cloud,
      description: portfolioData.skills.cloud.join(" • "),
      seoDescription: "Cloud architecture expertise in AWS, GCP, Docker, Vercel, Coolify, GitHub Actions, and Terraform for DevOps and infrastructure management."
    },
    {
      title: "Databases",
      description: portfolioData.skills.databases.join(" • "),
      seoDescription: "Database design and optimization with PostgreSQL, MySQL, MongoDB, and Supabase for high-performance data management and analytics."
    },
    {
      title: "Protocols",
      description: portfolioData.skills.protocols.join(" • "),
      seoDescription: "API development and integration using REST, JSON, JWT, OAuth2, WebSocket, gRPC, and GraphQL for modern web services."
    },
    {
      title: "Security",
      description: portfolioData.skills.security.join(" • "),
      seoDescription: "Cybersecurity implementation following OWASP Top-10, SSL/TLS, network hardening, and anti-fraud ML for secure applications."
    },
    {
      title: t.skills.methodologies,
      description: portfolioData.skills.methodologies.join(" • "),
      seoDescription: "Agile development practices, Scrum methodology, and CI/CD pipeline implementation for efficient software delivery."
    },
    {
      title: "AI & Machine Learning",
      description: portfolioData.skills.ai.join(" • "),
      seoDescription: "AI integration expertise with OpenAI API, Deepseek, Mistral AI, machine learning, and automation for intelligent applications."
    },
    {
      title: t.skills.soft,
      description: portfolioData.skills.soft.join(" • "),
      seoDescription: "Strategic thinking, analytical problem-solving, team collaboration, and bilingual communication for effective project leadership."
    },
  ];

  const defaultTitle = title || t.skills.title;
  const defaultDescription = description || (locale === 'en'
    ? "Explore my technical expertise and professional skills through interactive cards"
    : "Explorez mon expertise technique et mes compétences professionnelles à travers des cartes interactives");

  return (
    <section id="skills" className={`space-y-8 ${className}`}>
      {showTitle && (
        <div className="text-center space-y-2">
          <h2 className={`font-bold ${compact ? 'text-xl md:text-2xl' : 'text-2xl md:text-3xl'}`}>
            {defaultTitle}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {defaultDescription}
          </p>
        </div>
      )}
      <div className="w-full">
        <HoverEffect
          items={skillsData}
          className={`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-0 ${compact ? 'gap-3' : 'gap-4'}`}
        />
      </div>
    </section>
  );
}
