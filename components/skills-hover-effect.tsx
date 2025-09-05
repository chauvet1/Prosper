"use client"

import { HoverEffect } from "@/components/ui/card-hover-effect";
import { portfolioData } from "@/lib/portfolio-data";
import { useTranslations } from "@/hooks/use-translations";

export function SkillsHoverEffect() {
  const { t } = useTranslations();

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

  return (
    <div className="w-full">
      <HoverEffect
        items={skillsData}
        className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-0"
      />
    </div>
  );
}
