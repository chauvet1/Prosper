"use client";

import React from "react";
import { EvervaultCard, Icon } from "@/components/ui/evervault-card";
import { portfolioData } from "@/lib/portfolio-data";
import { useTranslations } from "@/hooks/use-translations";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";

export function ExperienceEvervaultCards() {
  const { t, locale } = useTranslations();

  const getCompanyIcon = (company: string) => {
    // Return first letter of company name for the Evervault card
    return company.charAt(0);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto w-full px-4">
      {portfolioData.experience.map((exp, index) => (
        <div
          key={index}
          className="border border-border/50 flex flex-col items-start w-full max-w-sm mx-auto p-4 md:p-6 relative h-[32rem] md:h-[35rem] bg-card/95 backdrop-blur-sm text-card-foreground rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/30"
        >
          {/* Corner Icons */}
          <Icon className="absolute h-6 w-6 -top-3 -left-3 text-foreground" />
          <Icon className="absolute h-6 w-6 -bottom-3 -left-3 text-foreground" />
          <Icon className="absolute h-6 w-6 -top-3 -right-3 text-foreground" />
          <Icon className="absolute h-6 w-6 -bottom-3 -right-3 text-foreground" />

          {/* Evervault Card Effect */}
          <div className="h-48 w-full mb-4">
            <EvervaultCard text={getCompanyIcon(exp.company)} />
          </div>

          {/* Experience Content */}
          <div className="flex-1 flex flex-col justify-between w-full">
            <div>
              <h2 className="text-foreground text-xl font-bold mb-2">
                {exp.title}
              </h2>

              <div className="flex items-center gap-2 mb-3">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground text-sm font-medium">
                  {exp.company}
                </span>
              </div>

              <p className="text-muted-foreground text-sm font-light mb-4 leading-relaxed">
                {exp.description[locale]}
              </p>
            </div>

            {/* Bottom Section */}
            <div className="space-y-3">
              {/* Period */}
              <div className="flex items-center justify-center">
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/30"
                >
                  {exp.period}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
