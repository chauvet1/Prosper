"use client";

import { CardSpotlight } from "@/components/ui/card-spotlight";
import { portfolioData } from "@/lib/portfolio-data";
import { useTranslations } from "@/hooks/use-translations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Globe, Download, CheckCircle, ExternalLink } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export function AboutMeSpotlight() {
  const { t, locale } = useTranslations();

  const personalInfo = [
    {
      icon: Mail,
      label: "Email",
      value: portfolioData.personal.email,
      href: `mailto:${portfolioData.personal.email}`,
    },
    {
      icon: Phone,
      label: "Phone",
      value: portfolioData.personal.phone,
      href: `tel:${portfolioData.personal.phone}`,
    },
    {
      icon: MapPin,
      label: "Location",
      value: portfolioData.personal.address,
    },
    {
      icon: Globe,
      label: "Website",
      value: "pepis.pro",
      href: portfolioData.personal.website,
    },
  ];

  const highlights = [
    {
      title: "4+ Years Experience",
      description: "Full-stack development expertise",
    },
    {
      title: "SaaS Founder",
      description: "Leading Pepis Pro startup",
    },
    {
      title: "AI Integration",
      description: "Exploring AI in backend systems",
    },
    {
      title: "Bilingual",
      description: "English & French fluency",
    },
  ];

  return (
    <section id="about" className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold">{t.nav.about}</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {locale === 'en'
            ? "AWS | Spring Boot | Angular | React | Node.js | Docker | GCP | CI/CD | REST | PostgreSQL | SaaS"
            : "Apprenez à me connaître grâce à des cartes spotlight interactives avec des effets dynamiques"
          }
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 max-w-7xl mx-auto w-full px-4">
        {/* Main About Card */}
        <CardSpotlight className="h-auto min-h-[500px] lg:min-h-[600px]">
          <div className="relative z-20 space-y-6">
            <div className="text-center space-y-4">
              <Avatar className="w-24 h-24 mx-auto">
                <AvatarImage src={portfolioData.personal.avatar} alt={portfolioData.personal.name} />
                <AvatarFallback className="text-2xl font-bold">
                  {portfolioData.personal.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {portfolioData.personal.name}
                </h3>
                <p className="text-lg text-primary font-semibold">
                  {portfolioData.personal.title}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-foreground/90 leading-relaxed text-center">
                {portfolioData.about[locale]}
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-foreground">Quick Highlights</h4>
              <div className="grid grid-cols-2 gap-3">
                {highlights.map((highlight, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-1 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{highlight.title}</p>
                      <p className="text-xs text-muted-foreground">{highlight.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button className="flex-1" size="sm">
                <Mail className="h-4 w-4 mr-2" />
                {t.hero.cta}
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download CV
              </Button>
            </div>
          </div>
        </CardSpotlight>

        {/* Contact & Info Card */}
        <CardSpotlight className="h-auto min-h-[500px] lg:min-h-[600px]">
          <div className="relative z-20 space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-foreground mb-2">
                Contact Information
              </h3>
              <p className="text-muted-foreground text-sm">
                Let's connect and discuss opportunities
              </p>
            </div>

            <div className="space-y-4">
              {personalInfo.map((info, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-background/50 backdrop-blur-sm border border-border/30">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <info.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground font-medium">{info.label}</p>
                    {info.href ? (
                      <a 
                        href={info.href}
                        className="text-sm text-foreground hover:text-primary transition-colors truncate block"
                        target={info.href.startsWith('http') ? '_blank' : undefined}
                        rel={info.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      >
                        {info.value}
                      </a>
                    ) : (
                      <p className="text-sm text-foreground truncate">{info.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-foreground">Education</h4>
              <div className="p-4 rounded-lg bg-background/50 backdrop-blur-sm border border-border/30">
                <p className="font-medium text-foreground text-sm mb-1">
                  {portfolioData.education.degree}
                </p>
                <p className="text-xs text-muted-foreground mb-2">
                  {portfolioData.education.school}
                </p>
                <Badge variant="secondary" className="text-xs">
                  {portfolioData.education.period}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-foreground">Languages</h4>
              <div className="flex flex-wrap gap-2">
                {portfolioData.languages.map((language, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {language}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-foreground">Certificates</h4>
              <div className="space-y-2">
                {portfolioData.certificates.map((cert, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-primary shrink-0" />
                    <p className="text-xs text-foreground">{cert}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <Button 
                variant="outline" 
                className="w-full" 
                size="sm"
                onClick={() => window.open(portfolioData.personal.linkedin, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Connect on LinkedIn
              </Button>
            </div>
          </div>
        </CardSpotlight>
      </div>
    </section>
  );
}
