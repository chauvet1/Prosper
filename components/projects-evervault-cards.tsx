"use client";

import React from "react";
import { EvervaultCard, Icon } from "@/components/ui/evervault-card";
import { portfolioData } from "@/lib/portfolio-data";
import { useTranslations } from "@/hooks/use-translations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export function ProjectsEvervaultCards() {
  const { t, locale } = useTranslations();

  const getProjectLink = (projectName: string) => {
    switch (projectName) {
      case "Prellia.com":
        return "https://prellia.com";
      case "Pepis Dev":
        return "https://pepis.pro";
      default:
        return "#";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto w-full px-4">
      {portfolioData.projects.map((project, index) => (
        <div
          key={index}
          className="flex flex-col items-start w-full max-w-sm mx-auto p-4 md:p-6 relative h-[32rem] md:h-[35rem] bg-card/95 backdrop-blur-sm text-card-foreground rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {/* Corner Icons */}
          <Icon className="absolute h-6 w-6 -top-3 -left-3 text-foreground" />
          <Icon className="absolute h-6 w-6 -bottom-3 -left-3 text-foreground" />
          <Icon className="absolute h-6 w-6 -top-3 -right-3 text-foreground" />
          <Icon className="absolute h-6 w-6 -bottom-3 -right-3 text-foreground" />

          {/* Evervault Card Effect */}
          <div className="h-48 w-full mb-4">
            <EvervaultCard text={project.name.split(' ')[0]} />
          </div>

          {/* Project Content */}
          <div className="flex-1 flex flex-col justify-between w-full bg-card/90 backdrop-blur-sm rounded-lg p-4">
            <div>
              <h2 className="text-foreground text-xl font-bold mb-2">
                {project.name}
              </h2>

              <p className="text-foreground/80 text-sm font-medium mb-4 leading-relaxed">
                {project.description[locale]}
              </p>

              {/* Technologies */}
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tech.slice(0, 3).map((tech, techIndex) => (
                  <Badge
                    key={techIndex}
                    variant="secondary"
                    className="text-xs bg-primary/20 text-primary border-primary/30"
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Bottom Section */}
            <div className="space-y-3">
              {/* Status */}
              <div className="flex items-center justify-between">
                <Badge
                  variant={project.status === "Completed" ? "default" : "outline"}
                  className={project.status === "Completed"
                    ? "bg-green-600/90 text-white border-green-500"
                    : "border-yellow-500 text-yellow-600 bg-yellow-50/90"
                  }
                >
                  {project.status}
                </Badge>
              </div>

              {/* Action Button */}
              <Button
                size="sm"
                variant="outline"
                className="w-full hover:bg-primary hover:text-primary-foreground transition-colors border-primary/50 hover:border-primary bg-background/80"
                onClick={() => {
                  const link = getProjectLink(project.name);
                  if (link !== "#") {
                    window.open(link, "_blank");
                  }
                }}
              >
                <ExternalLink className="mr-2 h-3 w-3" />
                {t.projects.viewProject}
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
