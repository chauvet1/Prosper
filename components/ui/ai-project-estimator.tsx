"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calculator, Clock, DollarSign, Loader2, X, Sparkles } from "lucide-react";

interface ProjectEstimatorProps {
  locale: 'en' | 'fr';
  isOpen: boolean;
  onClose: () => void;
}

interface ProjectRequirements {
  projectType: string;
  description: string;
  features: string[];
  timeline: string;
  budget: string;
  complexity: string;
  platforms: string[];
  integrations: string[];
  designNeeds: string;
  maintenanceNeeds: string;
}

interface ProjectEstimate {
  estimatedCost: {
    min: number;
    max: number;
  };
  estimatedTimeline: {
    min: number;
    max: number;
  };
  recommendedTech: string[];
  projectPhases: Array<{
    phase: string;
    duration: string;
    description: string;
  }>;
  considerations: string[];
  nextSteps: string[];
}

const AIProjectEstimator = ({ locale, isOpen, onClose }: ProjectEstimatorProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [requirements, setRequirements] = useState<ProjectRequirements>({
    projectType: '',
    description: '',
    features: [],
    timeline: '',
    budget: '',
    complexity: '',
    platforms: [],
    integrations: [],
    designNeeds: '',
    maintenanceNeeds: ''
  });
  const [estimate, setEstimate] = useState<ProjectEstimate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [leadData, setLeadData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });

  const t = {
    en: {
      title: "AI Project Estimator",
      subtitle: "Get an instant estimate for your project",
      step: "Step",
      of: "of",
      next: "Next",
      previous: "Previous",
      getEstimate: "Get AI Estimate",
      newEstimate: "New Estimate",
      projectType: "Project Type",
      description: "Project Description",
      features: "Required Features",
      timeline: "Desired Timeline",
      budget: "Budget Range",
      complexity: "Project Complexity",
      platforms: "Target Platforms",
      integrations: "Required Integrations",
      designNeeds: "Design Requirements",
      maintenanceNeeds: "Maintenance Needs",
      estimatedCost: "Estimated Cost",
      estimatedTimeline: "Estimated Timeline",
      recommendedTech: "Recommended Technologies",
      projectPhases: "Project Phases",
      considerations: "Important Considerations",
      nextSteps: "Next Steps",
      weeks: "weeks",
      months: "months",
      loading: "Generating estimate..."
    },
    fr: {
      title: "Estimateur de Projet IA",
      subtitle: "Obtenez une estimation instantanée pour votre projet",
      step: "Étape",
      of: "de",
      next: "Suivant",
      previous: "Précédent",
      getEstimate: "Obtenir l'Estimation IA",
      newEstimate: "Nouvelle Estimation",
      projectType: "Type de Projet",
      description: "Description du Projet",
      features: "Fonctionnalités Requises",
      timeline: "Délai Souhaité",
      budget: "Gamme de Budget",
      complexity: "Complexité du Projet",
      platforms: "Plateformes Cibles",
      integrations: "Intégrations Requises",
      designNeeds: "Exigences de Design",
      maintenanceNeeds: "Besoins de Maintenance",
      estimatedCost: "Coût Estimé",
      estimatedTimeline: "Délai Estimé",
      recommendedTech: "Technologies Recommandées",
      projectPhases: "Phases du Projet",
      considerations: "Considérations Importantes",
      nextSteps: "Prochaines Étapes",
      weeks: "semaines",
      months: "mois",
      loading: "Génération de l'estimation..."
    }
  };

  const projectTypes = {
    en: [
      { value: "web-app", label: "Web Application" },
      { value: "mobile-app", label: "Mobile Application" },
      { value: "e-commerce", label: "E-commerce Platform" },
      { value: "ai-solution", label: "AI/ML Solution" },
      { value: "api-backend", label: "API/Backend System" },
      { value: "cms", label: "Content Management System" },
      { value: "other", label: "Other" }
    ],
    fr: [
      { value: "web-app", label: "Application Web" },
      { value: "mobile-app", label: "Application Mobile" },
      { value: "e-commerce", label: "Plateforme E-commerce" },
      { value: "ai-solution", label: "Solution IA/ML" },
      { value: "api-backend", label: "Système API/Backend" },
      { value: "cms", label: "Système de Gestion de Contenu" },
      { value: "other", label: "Autre" }
    ]
  };

  const featureOptions = {
    en: [
      "User Authentication", "Payment Processing", "Real-time Features", "Admin Dashboard",
      "API Integration", "Search Functionality", "File Upload", "Notifications",
      "Analytics", "Multi-language Support", "Mobile Responsive", "SEO Optimization"
    ],
    fr: [
      "Authentification Utilisateur", "Traitement des Paiements", "Fonctionnalités Temps Réel", "Tableau de Bord Admin",
      "Intégration API", "Fonctionnalité de Recherche", "Téléchargement de Fichiers", "Notifications",
      "Analytiques", "Support Multi-langues", "Responsive Mobile", "Optimisation SEO"
    ]
  };

  const generateEstimate = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ai-project-estimator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requirements,
          locale
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate estimate');
      }

      const data = await response.json();
      setEstimate(data.estimate);
      setCurrentStep(4); // Move to results step
    } catch (error) {
      console.error('Error generating estimate:', error);
      setError('Failed to generate estimate. Please try again.');
      // Fallback estimate for demo purposes
      setEstimate({
        estimatedCost: { min: 5000, max: 15000 },
        estimatedTimeline: { min: 8, max: 16 },
        recommendedTech: ["React", "Node.js", "PostgreSQL", "TypeScript"],
        projectPhases: [
          { phase: "Planning & Design", duration: "2-3 weeks", description: "Requirements analysis and UI/UX design" },
          { phase: "Development", duration: "6-10 weeks", description: "Core development and feature implementation" },
          { phase: "Testing & Deployment", duration: "1-2 weeks", description: "Quality assurance and production deployment" }
        ],
        considerations: [
          "Timeline may vary based on feedback cycles",
          "Additional features may increase cost",
          "Third-party integrations may require additional time"
        ],
        nextSteps: [
          "Schedule a detailed consultation",
          "Finalize project requirements",
          "Create detailed project timeline",
          "Begin development process"
        ]
      });
      setCurrentStep(4);
    } finally {
      setLoading(false);
    }
  };

  const handleLeadCapture = async () => {
    try {
      setLoading(true);

      // Save lead data to database or send to CRM
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...leadData,
          projectRequirements: requirements,
          estimate: estimate,
          source: 'project_estimator',
          locale
        }),
      });

      if (response.ok) {
        // Show success message and close estimator
        alert(locale === 'fr'
          ? 'Merci! Nous vous contacterons bientôt.'
          : 'Thank you! We will contact you soon.'
        );
        onClose();
      } else {
        throw new Error('Failed to submit lead');
      }
    } catch (error) {
      console.error('Error submitting lead:', error);
      setError(locale === 'fr'
        ? 'Erreur lors de l\'envoi. Veuillez réessayer.'
        : 'Error submitting. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFeatureToggle = (feature: string) => {
    setRequirements(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handlePlatformToggle = (platform: string) => {
    setRequirements(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Calculator className="h-5 w-5" />
                </div>
                {t[locale].title}
              </CardTitle>
              <p className="text-muted-foreground mt-1">{t[locale].subtitle}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {currentStep < 4 && (
            <div className="flex items-center gap-2 mt-4">
              <span className="text-sm text-muted-foreground">
                {t[locale].step} {currentStep} {t[locale].of} 3
              </span>
              <div className="flex-1 bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                />
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Project Type and Description */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="projectType">{t[locale].projectType}</Label>
                <Select value={requirements.projectType} onValueChange={(value) => 
                  setRequirements(prev => ({ ...prev, projectType: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${t[locale].projectType.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {projectTypes[locale].map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">{t[locale].description}</Label>
                <Textarea
                  id="description"
                  placeholder={`Describe your project in detail...`}
                  value={requirements.description}
                  onChange={(e) => setRequirements(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                />
              </div>

              <div>
                <Label>{t[locale].features}</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {featureOptions[locale].map((feature) => (
                    <div key={feature} className="flex items-center space-x-2">
                      <Checkbox
                        id={feature}
                        checked={requirements.features.includes(feature)}
                        onCheckedChange={() => handleFeatureToggle(feature)}
                      />
                      <Label htmlFor={feature} className="text-sm">{feature}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Timeline and Budget */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="timeline">{t[locale].timeline}</Label>
                <Select value={requirements.timeline} onValueChange={(value) =>
                  setRequirements(prev => ({ ...prev, timeline: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asap">ASAP (Rush job)</SelectItem>
                    <SelectItem value="1-2months">1-2 months</SelectItem>
                    <SelectItem value="3-4months">3-4 months</SelectItem>
                    <SelectItem value="6months+">6+ months</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="budget">{t[locale].budget}</Label>
                <Select value={requirements.budget} onValueChange={(value) =>
                  setRequirements(prev => ({ ...prev, budget: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-5k">Under $5,000</SelectItem>
                    <SelectItem value="5k-15k">$5,000 - $15,000</SelectItem>
                    <SelectItem value="15k-30k">$15,000 - $30,000</SelectItem>
                    <SelectItem value="30k-50k">$30,000 - $50,000</SelectItem>
                    <SelectItem value="50k+">$50,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="complexity">{t[locale].complexity}</Label>
                <Select value={requirements.complexity} onValueChange={(value) =>
                  setRequirements(prev => ({ ...prev, complexity: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select complexity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple">Simple (Basic functionality)</SelectItem>
                    <SelectItem value="moderate">Moderate (Standard features)</SelectItem>
                    <SelectItem value="complex">Complex (Advanced features)</SelectItem>
                    <SelectItem value="enterprise">Enterprise (Custom solutions)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 3: Technical Requirements */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <Label>{t[locale].platforms}</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {["Web", "iOS", "Android", "Desktop", "API Only"].map((platform) => (
                    <div key={platform} className="flex items-center space-x-2">
                      <Checkbox
                        id={platform}
                        checked={requirements.platforms.includes(platform)}
                        onCheckedChange={() => handlePlatformToggle(platform)}
                      />
                      <Label htmlFor={platform} className="text-sm">{platform}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="designNeeds">{t[locale].designNeeds}</Label>
                <Select value={requirements.designNeeds} onValueChange={(value) =>
                  setRequirements(prev => ({ ...prev, designNeeds: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select design requirements" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic styling</SelectItem>
                    <SelectItem value="custom">Custom design</SelectItem>
                    <SelectItem value="premium">Premium UI/UX</SelectItem>
                    <SelectItem value="existing">Use existing design</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="maintenanceNeeds">{t[locale].maintenanceNeeds}</Label>
                <Select value={requirements.maintenanceNeeds} onValueChange={(value) =>
                  setRequirements(prev => ({ ...prev, maintenanceNeeds: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select maintenance needs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No ongoing maintenance</SelectItem>
                    <SelectItem value="basic">Basic maintenance</SelectItem>
                    <SelectItem value="full">Full support & maintenance</SelectItem>
                    <SelectItem value="discuss">Discuss later</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 4: Results */}
          {currentStep === 4 && estimate && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      {t[locale].estimatedCost}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${estimate.estimatedCost.min.toLocaleString()} - ${estimate.estimatedCost.max.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      {t[locale].estimatedTimeline}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {estimate.estimatedTimeline.min} - {estimate.estimatedTimeline.max} {t[locale].weeks}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">{t[locale].recommendedTech}</h3>
                <div className="flex flex-wrap gap-2">
                  {estimate.recommendedTech.map((tech) => (
                    <span key={tech} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">{t[locale].projectPhases}</h3>
                <div className="space-y-3">
                  {estimate.projectPhases.map((phase, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{phase.phase}</h4>
                        <span className="text-sm text-muted-foreground">{phase.duration}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{phase.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={() => { setCurrentStep(1); setEstimate(null); }} variant="outline">
                  {t[locale].newEstimate}
                </Button>
                <Button onClick={() => setShowLeadCapture(true)}>
                  {locale === 'fr' ? 'Obtenir un Devis' : 'Get Quote'}
                </Button>
              </div>
            </div>
          )}

          {/* Lead Capture Form */}
          {showLeadCapture && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">
                  {locale === 'fr' ? 'Obtenez votre devis personnalisé' : 'Get Your Custom Quote'}
                </h3>
                <p className="text-muted-foreground">
                  {locale === 'fr'
                    ? 'Partagez vos coordonnées pour recevoir un devis détaillé et personnalisé.'
                    : 'Share your contact details to receive a detailed, personalized quote.'
                  }
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {locale === 'fr' ? 'Nom complet' : 'Full Name'} *
                  </label>
                  <Input
                    value={leadData.name}
                    onChange={(e) => setLeadData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={locale === 'fr' ? 'Votre nom' : 'Your name'}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {locale === 'fr' ? 'Email' : 'Email'} *
                  </label>
                  <Input
                    type="email"
                    value={leadData.email}
                    onChange={(e) => setLeadData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder={locale === 'fr' ? 'votre@email.com' : 'your@email.com'}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {locale === 'fr' ? 'Téléphone' : 'Phone'}
                  </label>
                  <Input
                    type="tel"
                    value={leadData.phone}
                    onChange={(e) => setLeadData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder={locale === 'fr' ? '+33 1 23 45 67 89' : '+1 (555) 123-4567'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {locale === 'fr' ? 'Entreprise' : 'Company'}
                  </label>
                  <Input
                    value={leadData.company}
                    onChange={(e) => setLeadData(prev => ({ ...prev, company: e.target.value }))}
                    placeholder={locale === 'fr' ? 'Nom de votre entreprise' : 'Your company name'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {locale === 'fr' ? 'Message additionnel' : 'Additional Message'}
                </label>
                <textarea
                  className="w-full p-3 border rounded-md resize-none"
                  rows={4}
                  value={leadData.message}
                  onChange={(e) => setLeadData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder={locale === 'fr'
                    ? 'Détails supplémentaires sur votre projet...'
                    : 'Additional details about your project...'
                  }
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm text-center">
                  {error}
                </div>
              )}

              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => setShowLeadCapture(false)}
                  disabled={loading}
                >
                  {locale === 'fr' ? 'Retour' : 'Back'}
                </Button>
                <Button
                  onClick={handleLeadCapture}
                  disabled={loading || !leadData.name || !leadData.email}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {locale === 'fr' ? 'Envoi...' : 'Sending...'}
                    </>
                  ) : (
                    locale === 'fr' ? 'Envoyer la demande' : 'Send Request'
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            {currentStep > 1 && currentStep < 4 && (
              <Button variant="outline" onClick={() => setCurrentStep(prev => prev - 1)}>
                {t[locale].previous}
              </Button>
            )}
            {currentStep < 3 && (
              <Button 
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={currentStep === 1 && (!requirements.projectType || !requirements.description)}
                className="ml-auto"
              >
                {t[locale].next}
              </Button>
            )}
            {currentStep === 3 && (
              <Button 
                onClick={generateEstimate}
                disabled={isLoading}
                className="ml-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {t[locale].loading}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    {t[locale].getEstimate}
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { AIProjectEstimator };
