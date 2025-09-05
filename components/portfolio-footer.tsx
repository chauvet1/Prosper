"use client";

import { CardSpotlight } from "@/components/ui/card-spotlight";
import Footer from "@/components/ui/animated-footer";
import { portfolioData } from "@/lib/portfolio-data";
import { useTranslations } from "@/hooks/use-translations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Phone,
  Globe,
  Heart,
  Code,
  Coffee,
  User
} from "lucide-react";

export function PortfolioFooter() {
  const { t } = useTranslations();

  const socialLinks = [
    {
      href: portfolioData.personal.linkedin,
      label: "LinkedIn",
      icon: User,
    },
    {
      href: portfolioData.personal.website,
      label: "Website",
      icon: Globe,
    },
    {
      href: `mailto:${portfolioData.personal.email}`,
      label: "Email",
      icon: Mail,
    },
    {
      href: `tel:${portfolioData.personal.phone}`,
      label: "Phone",
      icon: Phone,
    },
  ];

  const quickLinks = [
    { href: "#about", label: t.nav.about },
    { href: "#experience", label: t.nav.experience },
    { href: "#skills", label: t.nav.skills },
    { href: "#projects", label: t.nav.projects },
    { href: "#blog", label: t.nav.blog },
    { href: "#contact", label: t.nav.contact },
  ];

  const projectLinks = portfolioData.projects.map(project => ({
    href: project.name === "Prellia.com" ? "https://prellia.com" :
          project.name === "Pepis Dev" ? "https://pepis.pro" : "#",
    label: project.name,
  }));

  // Footer links for the animated footer
  const leftLinks = [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
  ];

  const rightLinks = [
    ...socialLinks.map(link => ({ href: link.href, label: link.label })),
    ...projectLinks,
  ];

  return (
    <div className="space-y-0">
      {/* Contact CTA Section with Spotlight Cards */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              {t.footer.workTogether}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t.footer.workTogetherDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Contact Card */}
            <CardSpotlight className="h-auto min-h-[400px]">
              <div className="relative z-20 space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Mail className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {t.footer.contactCard.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {t.footer.contactCard.subtitle}
                  </p>
                </div>

                <div className="space-y-3">
                  {socialLinks.slice(0, 4).map((link, index) => (
                    <a
                      key={index}
                      href={link.href}
                      className="flex items-center gap-3 p-3 rounded-lg bg-background/50 backdrop-blur-sm border border-border/30 hover:border-primary/50 transition-all group"
                      target={link.href.startsWith('http') ? '_blank' : undefined}
                      rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <link.icon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                        {link.label}
                      </span>
                    </a>
                  ))}
                </div>

                <Button className="w-full" size="lg">
                  <Mail className="h-4 w-4 mr-2" />
                  {t.hero.cta}
                </Button>
              </div>
            </CardSpotlight>

            {/* Quick Links Card */}
            <CardSpotlight className="h-auto min-h-[400px]">
              <div className="relative z-20 space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Code className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {t.footer.navigationCard.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {t.footer.navigationCard.subtitle}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {quickLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.href}
                      className="p-3 rounded-lg bg-background/50 backdrop-blur-sm border border-border/30 hover:border-primary/50 transition-all text-center group"
                    >
                      <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                        {link.label}
                      </span>
                    </a>
                  ))}
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground">
                    {t.footer.navigationCard.techStack}
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {portfolioData.skills.languages.slice(0, 6).map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardSpotlight>

            {/* About Card */}
            <CardSpotlight className="h-auto min-h-[400px]">
              <div className="relative z-20 space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Coffee className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {portfolioData.personal.name.split(' ')[0]}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {portfolioData.personal.title}
                  </p>
                </div>

                <div className="space-y-4">
                  <p className="text-foreground/90 text-sm leading-relaxed text-center">
                    {t.footer.aboutCard.subtitle}
                  </p>

                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground">
                      {t.footer.aboutCard.currentFocus}
                    </h4>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-xs text-foreground">Pepis Pro - SaaS Startup</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-xs text-foreground">AI Integration Projects</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        <span className="text-xs text-foreground">Mentoring & Learning</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center pt-4">
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                      {t.footer.aboutCard.madeWith}
                      <Heart className="h-3 w-3 text-red-500 fill-current" />
                      {t.footer.aboutCard.inLocation}
                    </p>
                  </div>
                </div>
              </div>
            </CardSpotlight>
          </div>
        </div>
      </section>

      {/* Animated Footer */}
      <Footer
        leftLinks={leftLinks}
        rightLinks={rightLinks}
        copyrightText={`© 2025 ${portfolioData.personal.name}. ${t.footer.rights}`}
        barCount={25}
      />
    </div>
  );
}
