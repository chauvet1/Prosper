interface Lead {
  id: string;
  sessionId: string;
  timestamp: Date;
  context: string;
  messages: Array<{
    text: string;
    isUser: boolean;
    timestamp: Date;
  }>;
  qualificationScore: number;
  qualificationFactors: {
    hasProjectNeed: boolean;
    hasBudget: boolean;
    hasTimeline: boolean;
    hasAuthority: boolean;
    hasUrgency: boolean;
    providedContact: boolean;
  };
  status: 'new' | 'qualified' | 'contacted' | 'converted' | 'lost';
  estimatedValue: number;
  nextAction: string;
}

class LeadTracker {
  private static instance: LeadTracker;
  private leads: Map<string, Lead> = new Map();

  private constructor() {
    // Load leads from localStorage if available
    if (typeof window !== 'undefined') {
      const savedLeads = localStorage.getItem('ai_leads');
      if (savedLeads) {
        try {
          const leadsArray = JSON.parse(savedLeads);
          leadsArray.forEach((lead: Lead) => {
            this.leads.set(lead.id, lead);
          });
        } catch (error) {
          console.error('Failed to load leads from localStorage:', error);
        }
      }
    }
  }

  static getInstance(): LeadTracker {
    if (!LeadTracker.instance) {
      LeadTracker.instance = new LeadTracker();
    }
    return LeadTracker.instance;
  }

  private saveToStorage() {
    if (typeof window !== 'undefined') {
      const leadsArray = Array.from(this.leads.values());
      localStorage.setItem('ai_leads', JSON.stringify(leadsArray));
    }
  }

  analyzeConversation(sessionId: string, messages: any[], context: string): Lead | null {
    const qualificationFactors = this.extractQualificationFactors(messages);
    const qualificationScore = this.calculateQualificationScore(qualificationFactors);

    // Only create lead if qualification score is above threshold
    if (qualificationScore >= 3) {
      const leadId = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      
      const lead: Lead = {
        id: leadId,
        sessionId,
        timestamp: new Date(),
        context,
        messages: messages.map(msg => ({
          text: msg.text,
          isUser: msg.isUser,
          timestamp: new Date(msg.timestamp)
        })),
        qualificationScore,
        qualificationFactors,
        status: 'new',
        estimatedValue: this.estimateLeadValue(qualificationFactors, context),
        nextAction: this.determineNextAction(qualificationFactors, qualificationScore)
      };

      this.leads.set(leadId, lead);
      this.saveToStorage();
      
      return lead;
    }

    return null;
  }

  private extractQualificationFactors(messages: any[]) {
    const conversationText = messages
      .filter(msg => msg.isUser)
      .map(msg => msg.text.toLowerCase())
      .join(' ');

    return {
      hasProjectNeed: this.detectProjectNeed(conversationText),
      hasBudget: this.detectBudgetMention(conversationText),
      hasTimeline: this.detectTimelineMention(conversationText),
      hasAuthority: this.detectDecisionAuthority(conversationText),
      hasUrgency: this.detectUrgency(conversationText),
      providedContact: this.detectContactInfo(conversationText)
    };
  }

  private detectProjectNeed(text: string): boolean {
    const projectKeywords = [
      'project', 'build', 'develop', 'create', 'need', 'want', 'looking for',
      'website', 'app', 'application', 'system', 'platform', 'solution'
    ];
    return projectKeywords.some(keyword => text.includes(keyword));
  }

  private detectBudgetMention(text: string): boolean {
    const budgetKeywords = [
      'budget', 'cost', 'price', 'expensive', 'affordable', 'investment',
      '$', 'dollar', 'thousand', 'million', 'funding', 'money'
    ];
    return budgetKeywords.some(keyword => text.includes(keyword));
  }

  private detectTimelineMention(text: string): boolean {
    const timelineKeywords = [
      'when', 'timeline', 'deadline', 'urgent', 'asap', 'soon', 'quickly',
      'month', 'week', 'year', 'launch', 'delivery', 'complete'
    ];
    return timelineKeywords.some(keyword => text.includes(keyword));
  }

  private detectDecisionAuthority(text: string): boolean {
    const authorityKeywords = [
      'i decide', 'my decision', 'i choose', 'i approve', 'my company',
      'ceo', 'founder', 'owner', 'manager', 'director', 'my team'
    ];
    return authorityKeywords.some(keyword => text.includes(keyword));
  }

  private detectUrgency(text: string): boolean {
    const urgencyKeywords = [
      'urgent', 'asap', 'immediately', 'rush', 'quickly', 'soon',
      'deadline', 'time sensitive', 'priority', 'critical'
    ];
    return urgencyKeywords.some(keyword => text.includes(keyword));
  }

  private detectContactInfo(text: string): boolean {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/;
    return emailRegex.test(text) || phoneRegex.test(text);
  }

  private calculateQualificationScore(factors: any): number {
    let score = 0;
    if (factors.hasProjectNeed) score += 2;
    if (factors.hasBudget) score += 2;
    if (factors.hasTimeline) score += 1;
    if (factors.hasAuthority) score += 2;
    if (factors.hasUrgency) score += 1;
    if (factors.providedContact) score += 2;
    return score;
  }

  private estimateLeadValue(factors: any, context: string): number {
    let baseValue = 5000;

    // Adjust based on context
    switch (context) {
      case 'services':
        baseValue = 8000;
        break;
      case 'contact':
        baseValue = 10000;
        break;
      case 'projects':
        baseValue = 7000;
        break;
    }

    // Adjust based on qualification factors
    if (factors.hasBudget) baseValue *= 1.5;
    if (factors.hasUrgency) baseValue *= 1.3;
    if (factors.hasAuthority) baseValue *= 1.4;

    return Math.round(baseValue);
  }

  private determineNextAction(factors: any, score: number): string {
    if (score >= 7) {
      return 'Schedule immediate consultation call';
    } else if (score >= 5) {
      return 'Send detailed proposal and follow up';
    } else if (score >= 3) {
      return 'Nurture with valuable content';
    } else {
      return 'Continue conversation to qualify further';
    }
  }

  getLeads(): Lead[] {
    return Array.from(this.leads.values()).sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  getQualifiedLeads(): Lead[] {
    return this.getLeads().filter(lead => lead.qualificationScore >= 5);
  }

  updateLeadStatus(leadId: string, status: Lead['status']) {
    const lead = this.leads.get(leadId);
    if (lead) {
      lead.status = status;
      this.saveToStorage();
    }
  }

  getLeadById(leadId: string): Lead | undefined {
    return this.leads.get(leadId);
  }

  // Analytics methods
  getConversionRate(): number {
    const totalLeads = this.leads.size;
    const convertedLeads = Array.from(this.leads.values()).filter(
      lead => lead.status === 'converted'
    ).length;
    
    return totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
  }

  getTotalEstimatedValue(): number {
    return Array.from(this.leads.values()).reduce(
      (total, lead) => total + lead.estimatedValue, 0
    );
  }

  getLeadsByContext(): { [context: string]: number } {
    const contextCounts: { [context: string]: number } = {};
    
    Array.from(this.leads.values()).forEach(lead => {
      contextCounts[lead.context] = (contextCounts[lead.context] || 0) + 1;
    });
    
    return contextCounts;
  }
}

export { LeadTracker, type Lead };
