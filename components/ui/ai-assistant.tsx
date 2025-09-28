"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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

// Helper function to safely format timestamps
const formatTimestamp = (timestamp: Date | string | number): string => {
  try {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
};

// Helper function to generate unique IDs with fallback for older browsers
const generateUniqueId = (): string => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  // Fallback for older browsers
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

// Custom hook for debounced localStorage writes
const useDebouncedLocalStorage = (key: string, value: Message[] | null, delay: number = 500) => {
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && value !== null && value !== undefined) {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        try {
          localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
          console.error('Failed to save to localStorage:', error);
        }
      }, delay);
    }

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [key, value, delay]);
};

const AIAssistant = ({ locale, context }: AIAssistantProps) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentContext, setCurrentContext] = useState<PageContext>('home');
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`);
  const [showEstimator, setShowEstimator] = useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const messagesContainerRef = React.useRef<HTMLDivElement>(null);

  // Use debounced localStorage for conversation history
  useDebouncedLocalStorage(`ai_conversation_${currentContext}`, messages.length > 0 ? messages : null);

  // Load conversation history from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMessages = localStorage.getItem(`ai_conversation_${currentContext}`);
      if (savedMessages) {
        try {
          const parsedMessages = JSON.parse(savedMessages);
          // Ensure timestamps are Date objects
          const messagesWithDates = parsedMessages.map((msg: Message & { timestamp: string | Date }) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          setMessages(messagesWithDates);
        } catch (error) {
          console.error('Failed to load conversation history:', error);
        }
      }
    }
  }, [currentContext]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
    }
  }, [input]);

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-scroll when loading state changes (for immediate feedback)
  useEffect(() => {
    if (isLoading) {
      scrollToBottom();
    }
  }, [isLoading]);

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
        greeting: "Welcome! I&apos;m your AI assistant. I can help you learn about my services, view projects, or answer any questions about web development and AI solutions.",
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
        greeting: "Hi! I&apos;m here to help you understand my services. I offer full-stack development, AI solutions, mobile apps, and consulting. What would you like to know?",
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
        greeting: "I&apos;m here to help explain our privacy policy and data handling practices. Feel free to ask about how your information is protected.",
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
      id: generateUniqueId(),
      text: input,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Scroll to bottom immediately after adding user message
    setTimeout(scrollToBottom, 100);

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
        console.error('API response not ok:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      const aiMessage: Message = {
        id: generateUniqueId(),
        text: data.response,
        isUser: false,
        timestamp: new Date()
      };

      // Add only the AI response since user message was already added
      setMessages(prev => [...prev, aiMessage]);

      // Lead qualification tracking
      if (data.leadData) {
        const leadTracker = LeadTracker.getInstance();
        // Create updated messages array for lead tracking (current messages + new AI message)
        const messagesForTracking = [...messages, userMessage, aiMessage];
        const lead = leadTracker.analyzeConversation(
          sessionId,
          messagesForTracking,
          currentContext
        );

        if (lead) {
          console.log('Qualified lead detected:', lead);
          // Could trigger notifications or analytics here
        }
      }
    } catch (error) {
      console.error('AI Assistant Error:', error);
      const errorMessage: Message = {
        id: generateUniqueId(),
        text: t[locale].error,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      // Scroll to bottom after response is complete
      setTimeout(scrollToBottom, 100);
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
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50">
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
          className="rounded-full h-14 w-14 md:h-16 md:w-16 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground border-2 border-primary/20 hover:from-primary/90 hover:to-primary shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 backdrop-blur-sm"
        >
          <MessageSquare className="h-6 w-6 md:h-7 md:w-7" />
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Mobile backdrop */}
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden" onClick={() => setIsOpen(false)} />

      {/* Chat container - responsive positioning */}
      <div className="fixed z-50
        /* Mobile: Full screen with safe areas */
        inset-4 md:inset-auto
        /* Tablet: Larger floating window */
        md:bottom-6 md:right-6 md:w-[420px] md:max-h-[600px] md:min-h-[500px]
        /* Desktop: Optimized positioning */
        lg:w-[440px] lg:max-h-[650px]
        /* Ensure proper mobile height */
        max-h-[calc(100vh-2rem)] md:max-h-[600px]">
        <Card className="h-full flex flex-col shadow-2xl bg-background/98 backdrop-blur-md border border-border/30 rounded-2xl md:rounded-2xl overflow-hidden">
        <CardHeader className="pb-3 pt-4 px-4 md:pb-4 md:pt-6 md:px-6 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg md:text-xl font-semibold flex items-center gap-2 md:gap-3">
              <div className="p-2 md:p-2.5 rounded-xl bg-primary/15 text-primary">
                <Sparkles className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <span className="truncate">{t[locale].title}</span>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 md:h-9 md:w-9 p-0 hover:bg-background/80 rounded-xl shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0 min-h-0">
          {/* Messages */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto px-4 py-3 md:px-6 md:py-4 space-y-4 md:space-y-6 min-h-0"
          >
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center py-6 md:py-8">
                <div className="p-3 md:p-4 rounded-full bg-primary/10 text-primary mb-3 md:mb-4">
                  <Sparkles className="h-6 w-6 md:h-8 md:w-8" />
                </div>
                <h3 className="text-base md:text-lg font-medium text-foreground mb-2">Welcome!</h3>
                <p className="text-sm text-muted-foreground max-w-[280px] px-4">
                  I&apos;m here to help you with questions about our services, projects, and expertise. How can I assist you today?
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className="group">
                <div className={`flex gap-2 md:gap-3 ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    message.isUser
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {message.isUser ? 'U' : 'AI'}
                  </div>

                  {/* Message Content */}
                  <div className={`flex-1 ${message.isUser ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block max-w-[90%] md:max-w-[85%] p-3 md:p-4 rounded-2xl text-sm leading-relaxed ${
                      message.isUser
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted/60 text-foreground rounded-bl-md'
                    }`}>
                      <div className="whitespace-pre-wrap break-words">{message.text}</div>
                    </div>
                    <div className={`text-xs text-muted-foreground mt-1 ${message.isUser ? 'text-right' : 'text-left'}`}>
                      {formatTimestamp(message.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="group">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-medium">
                    AI
                  </div>
                  <div className="flex-1">
                    <div className="inline-block bg-muted/60 p-4 rounded-2xl rounded-bl-md">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Invisible scroll target */}
            <div ref={messagesEndRef} className="h-0" />
          </div>



          {/* Quick Actions */}
          {(currentContext === 'services' || currentContext === 'contact') && (
            <div className="px-4 pb-3 md:px-6 md:pb-4">
              <Button
                onClick={() => setShowEstimator(true)}
                variant="outline"
                size="sm"
                className="w-full rounded-xl border-border/50 hover:bg-muted/50 text-sm"
              >
                <Calculator className="h-4 w-4 mr-2" />
                <span className="truncate">{locale === 'fr' ? 'Estimateur de Projet IA' : 'AI Project Estimator'}</span>
              </Button>
            </div>
          )}

          {/* Input */}
          <div className="px-4 pb-4 pt-3 md:px-6 md:pb-6 md:pt-4 border-t border-border/20 bg-background/50">
            <div className="flex gap-2 md:gap-3 items-end">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={t[locale].placeholder}
                  disabled={isLoading}
                  className="flex-1 min-h-[40px] md:min-h-[44px] max-h-[100px] md:max-h-[120px] resize-none border-border/30 focus:border-primary/50 transition-all duration-200 rounded-xl px-3 py-2 md:px-4 md:py-3 text-sm bg-background/80 backdrop-blur-sm"
                  rows={1}
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                size="sm"
                className="bg-primary hover:bg-primary/90 h-10 w-10 md:h-11 md:w-11 p-0 shrink-0 rounded-xl transition-all duration-200 hover:scale-105"
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" />
              ) : (
                <Send className="h-3 w-3 md:h-4 md:w-4" />
              )}
            </Button>
            </div>
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
    </>
  );
};

export { AIAssistant };
