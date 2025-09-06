"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code, Palette, Zap, Bot, Globe, Smartphone } from "lucide-react";

interface ServiceAdCardProps {
  locale: 'en' | 'fr';
  serviceType: 'web-dev' | 'ai-solutions' | 'mobile-dev' | 'ui-design' | 'consulting' | 'automation';
}

const ServiceAdCard = ({ locale, serviceType }: ServiceAdCardProps) => {
  const services = {
    'web-dev': {
      icon: <Code className="h-8 w-8" />,
      title: {
        en: "Custom Web Development",
        fr: "Développement Web Sur Mesure"
      },
      description: {
        en: "Full-stack web applications with modern technologies like React, Next.js, and Node.js",
        fr: "Applications web full-stack avec des technologies modernes comme React, Next.js et Node.js"
      },
      cta: {
        en: "Get Quote",
        fr: "Obtenir un Devis"
      },
      gradient: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50/50 dark:bg-blue-950/10"
    },
    'ai-solutions': {
      icon: <Bot className="h-8 w-8" />,
      title: {
        en: "AI & Machine Learning",
        fr: "IA & Apprentissage Automatique"
      },
      description: {
        en: "Custom AI solutions, chatbots, and machine learning integrations for your business",
        fr: "Solutions IA personnalisées, chatbots et intégrations d'apprentissage automatique"
      },
      cta: {
        en: "Explore AI",
        fr: "Explorer l'IA"
      },
      gradient: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50/50 dark:bg-purple-950/10"
    },
    'mobile-dev': {
      icon: <Smartphone className="h-8 w-8" />,
      title: {
        en: "Mobile App Development",
        fr: "Développement d'Applications Mobiles"
      },
      description: {
        en: "Native and cross-platform mobile apps for iOS and Android using React Native",
        fr: "Applications mobiles natives et multiplateformes pour iOS et Android avec React Native"
      },
      cta: {
        en: "Start Project",
        fr: "Démarrer Projet"
      },
      gradient: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50/50 dark:bg-green-950/10"
    },
    'ui-design': {
      icon: <Palette className="h-8 w-8" />,
      title: {
        en: "UI/UX Design",
        fr: "Design UI/UX"
      },
      description: {
        en: "Beautiful, user-friendly interfaces designed with modern design principles and accessibility",
        fr: "Interfaces belles et conviviales conçues avec des principes de design modernes et l'accessibilité"
      },
      cta: {
        en: "View Portfolio",
        fr: "Voir Portfolio"
      },
      gradient: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50/50 dark:bg-orange-950/10"
    },
    'consulting': {
      icon: <Globe className="h-8 w-8" />,
      title: {
        en: "Tech Consulting",
        fr: "Conseil Technologique"
      },
      description: {
        en: "Strategic technology consulting to help scale your business and optimize workflows",
        fr: "Conseil technologique stratégique pour faire évoluer votre entreprise et optimiser les flux"
      },
      cta: {
        en: "Book Call",
        fr: "Réserver Appel"
      },
      gradient: "from-indigo-500 to-blue-500",
      bgColor: "bg-indigo-50/50 dark:bg-indigo-950/10"
    },
    'automation': {
      icon: <Zap className="h-8 w-8" />,
      title: {
        en: "Process Automation",
        fr: "Automatisation des Processus"
      },
      description: {
        en: "Automate repetitive tasks and workflows to increase efficiency and reduce costs",
        fr: "Automatiser les tâches répétitives et les flux de travail pour augmenter l'efficacité"
      },
      cta: {
        en: "Automate Now",
        fr: "Automatiser"
      },
      gradient: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-50/50 dark:bg-yellow-950/10"
    }
  };

  const service = services[serviceType];
  const heights = [280, 320, 300, 350, 290, 330];
  const heightIndex = serviceType.charCodeAt(0) % heights.length;
  const cardHeight = heights[heightIndex];

  return (
    <div
      className={`group ${service.bgColor} rounded-xl shadow-sm border border-border/50 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md relative`}
      style={{ minHeight: `${cardHeight}px` }}
    >
      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
      
      <div className="relative p-6 h-full flex flex-col">
        {/* Icon */}
        <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${service.gradient} text-white mb-4 w-fit`}>
          {service.icon}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="font-semibold text-foreground text-lg mb-3 group-hover:text-primary transition-colors">
            {service.title[locale]}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            {service.description[locale]}
          </p>
        </div>

        {/* CTA */}
        <div className="mt-auto">
          <Button 
            size="sm" 
            className={`bg-gradient-to-r ${service.gradient} hover:opacity-90 text-white border-0 group-hover:shadow-lg transition-all`}
            onClick={() => {
              // You can customize these URLs based on your actual contact/service pages
              window.open('mailto:contact@yourname.com?subject=' + encodeURIComponent(service.title[locale]), '_blank');
            }}
          >
            {service.cta[locale]}
            <ArrowRight className="ml-2 h-3 w-3" />
          </Button>
        </div>

        {/* Service badge */}
        <div className="absolute top-4 right-4">
          <span className="bg-background/80 backdrop-blur-sm text-xs px-2 py-1 rounded-full text-muted-foreground font-medium border border-border/50">
            {locale === 'fr' ? 'Service' : 'Service'}
          </span>
        </div>
      </div>
    </div>
  );
};

export { ServiceAdCard };
