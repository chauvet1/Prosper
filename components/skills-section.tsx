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
    },
    {
      title: t.skills.cloud,
      description: portfolioData.skills.cloud.join(" • "),
    },
    {
      title: t.skills.tools,
      description: portfolioData.skills.tools.join(" • "),
    },
    {
      title: t.skills.networking,
      description: portfolioData.skills.networking.join(" • "),
    },
    {
      title: t.skills.methodologies,
      description: portfolioData.skills.methodologies.join(" • "),
    },
    {
      title: t.skills.soft,
      description: portfolioData.skills.soft.join(" • "),
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
