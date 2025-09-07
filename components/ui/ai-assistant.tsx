"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Loader2, MessageSquare, X, Sparkles, Calculator } from "lucide-react";
import { AIProjectEstimator } from "./ai-project-estimator";
import { LeadTracker } from "@/lib/lead-tracker";

type PageContext = 'home' | 'services' | 'projects' | 'contact' | 'blog' | 'privacy' | 'terms' | 'dashboard';

interface AIAssistantProps {
  locale: 'en' | 'fr';
  context?: PageContext;
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const AIAssistant = ({ locale, context }: AIAssistantProps) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentContext, setCurrentContext] = useState<PageContext>('home');
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`);
  const [showEstimator, setShowEstimator] = useState(false);

  // Load conversation history from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem(`ai_conversation_${currentContext}`);
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
      } catch (error) {
        console.error('Failed to load conversation history:', error);
      }
    }
  }, [currentContext]);

  // Save conversation history to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`ai_conversation_${currentContext}`, JSON.stringify(messages));
    }
  }, [messages, currentContext]);

  // Detect page context from pathname or prop
  useEffect(() => {
    if (context) {
      setCurrentContext(context);
    } else {
      const path = pathname.split('/')[1] || 'home';
      const detectedContext = (['home', 'services', 'projects', 'contact', 'blog', 'privacy', 'terms', 'dashboard'].includes(path)
        ? path
        : 'home') as PageContext;
      setCurrentContext(detectedContext);
    }
  }, [pathname, context]);

  // Context-specific content
  const contextContent = {
    home: {
      en: {
        greeting: "Welcome! I'm your AI assistant. I can help you learn about my services, view projects, or answer any questions about web development and AI solutions.",
        placeholder: "Ask about services, projects, or how I can help you...",
        suggestions: ["What services do you offer?", "Show me your recent projects", "How can you help my business?"]
      },
      fr: {
        greeting: "Bienvenue ! Je suis votre assistant IA. Je peux vous aider à découvrir mes services, voir mes projets, ou répondre à vos questions sur le développement web et les solutions IA.",
        placeholder: "Posez des questions sur les services, projets, ou comment je peux vous aider...",
        suggestions: ["Quels services offrez-vous ?", "Montrez-moi vos projets récents", "Comment pouvez-vous aider mon entreprise ?"]
      }
    },
    services: {
      en: {
        greeting: "Hi! I'm here to help you understand my services. I offer full-stack development, AI solutions, mobile apps, and consulting. What would you like to know?",
        placeholder: "Ask about specific services, pricing, or capabilities...",
        suggestions: ["What's included in web development?", "Do you offer AI integration?", "What are your rates?"]
      },
      fr: {
        greeting: "Salut ! Je suis là pour vous aider à comprendre mes services. J'offre du développement full-stack, des solutions IA, des applications mobiles et du conseil. Que voulez-vous savoir ?",
        placeholder: "Posez des questions sur les services, tarifs, ou capacités...",
        suggestions: ["Qu'est-ce qui est inclus dans le développement web ?", "Offrez-vous l'intégration IA ?", "Quels sont vos tarifs ?"]
      }
    },
    projects: {
      en: {
        greeting: "Explore my portfolio! I can tell you about specific projects, technologies used, or how similar solutions could benefit your business.",
        placeholder: "Ask about projects, technologies, or case studies...",
        suggestions: ["Tell me about your AI projects", "What technologies do you use?", "Can you build something similar for me?"]
      },
      fr: {
        greeting: "Explorez mon portfolio ! Je peux vous parler de projets spécifiques, des technologies utilisées, ou comment des solutions similaires pourraient bénéficier à votre entreprise.",
        placeholder: "Posez des questions sur les projets, technologies, ou études de cas...",
        suggestions: ["Parlez-moi de vos projets IA", "Quelles technologies utilisez-vous ?", "Pouvez-vous construire quelque chose de similaire pour moi ?"]
      }
    },
    contact: {
      en: {
        greeting: "Ready to start your project? I can help you understand the process, discuss requirements, or schedule a consultation. Let's get started!",
        placeholder: "Ask about project process, requirements, or scheduling...",
        suggestions: ["How do we start a project?", "What information do you need?", "Can we schedule a call?"]
      },
      fr: {
        greeting: "Prêt à commencer votre projet ? Je peux vous aider à comprendre le processus, discuter des exigences, ou planifier une consultation. Commençons !",
        placeholder: "Posez des questions sur le processus, exigences, ou planification...",
        suggestions: ["Comment commençons-nous un projet ?", "Quelles informations avez-vous besoin ?", "Pouvons-nous planifier un appel ?"]
      }
    },
    blog: {
      en: {
        greeting: "Welcome to my blog! I can help you find articles on specific topics, explain technical concepts, or recommend content based on your interests.",
        placeholder: "Ask about blog topics, technical concepts, or recommendations...",
        suggestions: ["Find articles about React", "Explain AI in web development", "What's new in tech?"]
      },
      fr: {
        greeting: "Bienvenue sur mon blog ! Je peux vous aider à trouver des articles sur des sujets spécifiques, expliquer des concepts techniques, ou recommander du contenu basé sur vos intérêts.",
        placeholder: "Posez des questions sur les sujets du blog, concepts techniques, ou recommandations...",
        suggestions: ["Trouvez des articles sur React", "Expliquez l'IA dans le développement web", "Quoi de neuf en tech ?"]
      }
    },
    privacy: {
      en: {
        greeting: "I'm here to help explain our privacy policy and data handling practices. Feel free to ask about how your information is protected.",
        placeholder: "Ask about privacy, data protection, or security...",
        suggestions: ["How is my data protected?", "What information do you collect?", "Can I delete my data?"]
      },
      fr: {
        greeting: "Je suis là pour vous aider à expliquer notre politique de confidentialité et nos pratiques de traitement des données. N'hésitez pas à demander comment vos informations sont protégées.",
        placeholder: "Posez des questions sur la confidentialité, protection des données, ou sécurité...",
        suggestions: ["Comment mes données sont-elles protégées ?", "Quelles informations collectez-vous ?", "Puis-je supprimer mes données ?"]
      }
    },
    terms: {
      en: {
        greeting: "I can help clarify our terms of service and answer questions about our policies and agreements.",
        placeholder: "Ask about terms, policies, or service agreements...",
        suggestions: ["What are your payment terms?", "What's your refund policy?", "How do contracts work?"]
      },
      fr: {
        greeting: "Je peux aider à clarifier nos conditions de service et répondre aux questions sur nos politiques et accords.",
        placeholder: "Posez des questions sur les conditions, politiques, ou accords de service...",
        suggestions: ["Quelles sont vos conditions de paiement ?", "Quelle est votre politique de remboursement ?", "Comment fonctionnent les contrats ?"]
      }
    },
    dashboard: {
      en: {
        greeting: "Welcome to the dashboard! I can help you navigate the interface, understand analytics, or assist with administrative tasks.",
        placeholder: "Ask about dashboard features, analytics, or admin tasks...",
        suggestions: ["How do I use this dashboard?", "Explain the analytics", "Help with settings"]
      },
      fr: {
        greeting: "Bienvenue au tableau de bord ! Je peux vous aider à naviguer dans l'interface, comprendre les analyses, ou assister avec les tâches administratives.",
        placeholder: "Posez des questions sur les fonctionnalités, analyses, ou tâches admin...",
        suggestions: ["Comment utiliser ce tableau de bord ?", "Expliquez les analyses", "Aide avec les paramètres"]
      }
    }
  };

  const t = {
    en: {
      title: "AI Assistant",
      send: "Send",
      error: "Sorry, I couldn't process your request. Please try again.",
      ...contextContent[currentContext].en
    },
    fr: {
      title: "Assistant IA",
      send: "Envoyer",
      error: "Désolé, je n'ai pas pu traiter votre demande. Veuillez réessayer.",
      ...contextContent[currentContext].fr
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          locale,
          context: currentContext,
          pageContext: currentContext,
          sessionId,
          conversationHistory: messages.slice(-6) // Send last 6 messages for context
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        isUser: false,
        timestamp: new Date()
      };

      const updatedMessages = [...messages, userMessage, aiMessage];
      setMessages(updatedMessages);

      // Lead qualification tracking
      if (data.leadData) {
        const leadTracker = LeadTracker.getInstance();
        const lead = leadTracker.analyzeConversation(
          sessionId,
          updatedMessages,
          currentContext
        );

        if (lead) {
          console.log('Qualified lead detected:', lead);
          // Could trigger notifications or analytics here
        }
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: t[locale].error,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => {
            setIsOpen(true);
            if (messages.length === 0) {
              const greeting: Message = {
                id: 'greeting',
                text: t[locale].greeting,
                isUser: false,
                timestamp: new Date()
              };
              setMessages([greeting]);
            }
          }}
          size="lg"
          className="rounded-full h-12 w-12 bg-background border-2 border-border hover:bg-accent hover:text-accent-foreground shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 h-96">
      <Card className="h-full flex flex-col shadow-2xl bg-background/95 backdrop-blur-sm border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              {t[locale].title}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-4 pt-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 mb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg text-sm ${
                    message.isUser
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted p-3 rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>



          {/* Quick Actions */}
          {(currentContext === 'services' || currentContext === 'contact') && (
            <div className="mb-4">
              <Button
                onClick={() => setShowEstimator(true)}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Calculator className="h-4 w-4 mr-2" />
                {locale === 'fr' ? 'Estimateur de Projet IA' : 'AI Project Estimator'}
              </Button>
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={t[locale].placeholder}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Project Estimator */}
      <AIProjectEstimator
        locale={locale}
        isOpen={showEstimator}
        onClose={() => setShowEstimator(false)}
      />
    </div>
  );
};

export { AIAssistant };
