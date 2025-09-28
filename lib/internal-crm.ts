// Internal CRM System
// Implements lead management, contact tracking, and sales pipeline management

import { ErrorLogger } from './error-handler'

export interface CRMConfig {
  enableLeadManagement: boolean
  enableContactTracking: boolean
  enableSalesPipeline: boolean
  enableTaskManagement: boolean
  enableCommunicationTracking: boolean
  enableDealManagement: boolean
  enableReporting: boolean
  enableAutomation: boolean
  enableIntegration: boolean
  enableNotifications: boolean
  enableDataValidation: boolean
  enableBackup: boolean
  enableAuditTrail: boolean
  maxLeadsPerUser: number
  maxContactsPerUser: number
  maxDealsPerUser: number
  autoBackupInterval: number
  notificationInterval: number
}

export interface Lead {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  title?: string
  source: 'website' | 'social_media' | 'referral' | 'advertising' | 'email' | 'phone' | 'other'
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  score: number
  tags: string[]
  notes: string
  assignedTo?: string
  createdAt: number
  updatedAt: number
  lastContactAt?: number
  nextFollowUpAt?: number
  expectedValue?: number
  probability: number
  customFields: Record<string, any>
  metadata: {
    ipAddress?: string
    userAgent?: string
    referrer?: string
    landingPage?: string
    utmSource?: string
    utmMedium?: string
    utmCampaign?: string
  }
}

export interface Contact {
  id: string
  leadId?: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  mobile?: string
  company?: string
  title?: string
  department?: string
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  socialMedia?: {
    linkedin?: string
    twitter?: string
    facebook?: string
    instagram?: string
  }
  preferences: {
    communicationMethod: 'email' | 'phone' | 'sms' | 'mail'
    timezone: string
    language: string
    frequency: 'daily' | 'weekly' | 'monthly' | 'never'
  }
  status: 'active' | 'inactive' | 'unsubscribed' | 'bounced'
  tags: string[]
  notes: string
  assignedTo?: string
  createdAt: number
  updatedAt: number
  lastContactAt?: number
  totalInteractions: number
  customFields: Record<string, any>
  metadata: {
    source: string
    originalLeadId?: string
    importDate?: number
  }
}

export interface Deal {
  id: string
  name: string
  description: string
  contactId: string
  leadId?: string
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  value: number
  currency: string
  probability: number
  expectedCloseDate: number
  actualCloseDate?: number
  source: string
  tags: string[]
  notes: string
  assignedTo?: string
  createdAt: number
  updatedAt: number
  lastActivityAt: number
  customFields: Record<string, any>
  metadata: {
    pipeline: string
    forecastCategory: 'commit' | 'best_case' | 'most_likely' | 'pipeline'
    competitor?: string
    decisionMaker?: string
    budget?: number
    timeline?: string
  }
}

export interface Task {
  id: string
  title: string
  description: string
  type: 'call' | 'email' | 'meeting' | 'follow_up' | 'proposal' | 'demo' | 'other'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  dueDate: number
  completedAt?: number
  assignedTo?: string
  relatedTo?: {
    type: 'lead' | 'contact' | 'deal'
    id: string
  }
  reminder?: {
    enabled: boolean
    time: number
    method: 'email' | 'sms' | 'push'
  }
  createdAt: number
  updatedAt: number
  customFields: Record<string, any>
}

export interface Communication {
  id: string
  type: 'email' | 'phone' | 'sms' | 'meeting' | 'note'
  direction: 'inbound' | 'outbound'
  subject?: string
  content: string
  relatedTo: {
    type: 'lead' | 'contact' | 'deal'
    id: string
  }
  from?: string
  to?: string
  cc?: string[]
  bcc?: string[]
  attachments?: Array<{
    name: string
    size: number
    type: string
    url: string
  }>
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'draft'
  sentAt?: number
  readAt?: number
  duration?: number
  outcome?: string
  nextAction?: string
  tags: string[]
  createdAt: number
  updatedAt: number
  customFields: Record<string, any>
}

export interface Pipeline {
  id: string
  name: string
  description: string
  stages: Array<{
    id: string
    name: string
    order: number
    probability: number
    color: string
    isActive: boolean
  }>
  isDefault: boolean
  isActive: boolean
  createdAt: number
  updatedAt: number
  metadata: {
    totalDeals: number
    totalValue: number
    averageDealSize: number
    averageSalesCycle: number
  }
}

export interface CRMReport {
  id: string
  type: 'leads' | 'contacts' | 'deals' | 'pipeline' | 'performance' | 'custom'
  title: string
  description: string
  period: {
    start: number
    end: number
  }
  filters: Record<string, any>
  metrics: {
    totalLeads: number
    newLeads: number
    convertedLeads: number
    conversionRate: number
    totalContacts: number
    activeContacts: number
    totalDeals: number
    wonDeals: number
    lostDeals: number
    totalValue: number
    wonValue: number
    averageDealSize: number
    averageSalesCycle: number
  }
  charts: Array<{
    type: 'line' | 'bar' | 'pie' | 'funnel'
    title: string
    data: any[]
    config: Record<string, any>
  }>
  insights: string[]
  recommendations: string[]
  createdAt: number
  updatedAt: number
}

export interface CRMAutomation {
  id: string
  name: string
  description: string
  trigger: {
    type: 'lead_created' | 'lead_updated' | 'contact_created' | 'deal_updated' | 'task_completed' | 'custom'
    conditions: Record<string, any>
  }
  actions: Array<{
    type: 'send_email' | 'create_task' | 'update_field' | 'assign_to' | 'create_deal' | 'send_notification'
    config: Record<string, any>
  }>
  isActive: boolean
  executionCount: number
  lastExecutedAt?: number
  createdAt: number
  updatedAt: number
}

class InternalCRM {
  private config: CRMConfig
  private leads: Map<string, Lead> = new Map()
  private contacts: Map<string, Contact> = new Map()
  private deals: Map<string, Deal> = new Map()
  private tasks: Map<string, Task> = new Map()
  private communications: Map<string, Communication> = new Map()
  private pipelines: Map<string, Pipeline> = new Map()
  private reports: Map<string, CRMReport> = new Map()
  private automations: Map<string, CRMAutomation> = new Map()
  private backupInterval?: NodeJS.Timeout
  private notificationInterval?: NodeJS.Timeout

  constructor(config: Partial<CRMConfig> = {}) {
    this.config = {
      enableLeadManagement: true,
      enableContactTracking: true,
      enableSalesPipeline: true,
      enableTaskManagement: true,
      enableCommunicationTracking: true,
      enableDealManagement: true,
      enableReporting: true,
      enableAutomation: true,
      enableIntegration: true,
      enableNotifications: true,
      enableDataValidation: true,
      enableBackup: true,
      enableAuditTrail: true,
      maxLeadsPerUser: 1000,
      maxContactsPerUser: 5000,
      maxDealsPerUser: 500,
      autoBackupInterval: 86400000, // 24 hours
      notificationInterval: 300000, // 5 minutes
      ...config
    }

    this.initializeDefaultPipeline()
    this.startCRMServices()
  }

  /**
   * Initialize default pipeline
   */
  private initializeDefaultPipeline(): void {
    const defaultPipeline: Pipeline = {
      id: 'default_pipeline',
      name: 'Default Sales Pipeline',
      description: 'Standard sales pipeline for all deals',
      stages: [
        { id: 'prospecting', name: 'Prospecting', order: 1, probability: 10, color: '#FF6B6B', isActive: true },
        { id: 'qualification', name: 'Qualification', order: 2, probability: 25, color: '#4ECDC4', isActive: true },
        { id: 'proposal', name: 'Proposal', order: 3, probability: 50, color: '#45B7D1', isActive: true },
        { id: 'negotiation', name: 'Negotiation', order: 4, probability: 75, color: '#96CEB4', isActive: true },
        { id: 'closed_won', name: 'Closed Won', order: 5, probability: 100, color: '#FFEAA7', isActive: true },
        { id: 'closed_lost', name: 'Closed Lost', order: 6, probability: 0, color: '#DDA0DD', isActive: true }
      ],
      isDefault: true,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      metadata: {
        totalDeals: 0,
        totalValue: 0,
        averageDealSize: 0,
        averageSalesCycle: 0
      }
    }

    this.pipelines.set(defaultPipeline.id, defaultPipeline)
  }

  /**
   * Start CRM services
   */
  private startCRMServices(): void {
    if (this.config.enableBackup) {
      this.backupInterval = setInterval(() => {
        this.performBackup()
      }, this.config.autoBackupInterval)
    }

    if (this.config.enableNotifications) {
      this.notificationInterval = setInterval(() => {
        this.processNotifications()
      }, this.config.notificationInterval)
    }
  }

  /**
   * Create lead
   */
  public async createLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead> {
    const lead: Lead = {
      id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...leadData
    }

    // Validate lead data
    if (this.config.enableDataValidation) {
      this.validateLeadData(lead)
    }

    this.leads.set(lead.id, lead)

    // Trigger automations
    if (this.config.enableAutomation) {
      await this.triggerAutomations('lead_created', lead)
    }

    ErrorLogger.logInfo('Lead created', {
      leadId: lead.id,
      email: lead.email,
      source: lead.source,
      status: lead.status
    })

    return lead
  }

  /**
   * Update lead
   */
  public async updateLead(leadId: string, updateData: Partial<Lead>): Promise<Lead> {
    const lead = this.leads.get(leadId)
    if (!lead) {
      throw new Error(`Lead not found: ${leadId}`)
    }

    const updatedLead: Lead = {
      ...lead,
      ...updateData,
      id: leadId,
      updatedAt: Date.now()
    }

    // Validate updated data
    if (this.config.enableDataValidation) {
      this.validateLeadData(updatedLead)
    }

    this.leads.set(leadId, updatedLead)

    // Trigger automations
    if (this.config.enableAutomation) {
      await this.triggerAutomations('lead_updated', updatedLead)
    }

    ErrorLogger.logInfo('Lead updated', {
      leadId,
      changes: Object.keys(updateData),
      status: updatedLead.status
    })

    return updatedLead
  }

  /**
   * Get lead
   */
  public getLead(leadId: string): Lead | null {
    return this.leads.get(leadId) || null
  }

  /**
   * Get leads
   */
  public getLeads(filters?: {
    status?: string
    source?: string
    assignedTo?: string
    tags?: string[]
    dateRange?: { start: number; end: number }
  }): Lead[] {
    let leads = Array.from(this.leads.values())

    if (filters) {
      if (filters.status) {
        leads = leads.filter(lead => lead.status === filters.status)
      }
      if (filters.source) {
        leads = leads.filter(lead => lead.source === filters.source)
      }
      if (filters.assignedTo) {
        leads = leads.filter(lead => lead.assignedTo === filters.assignedTo)
      }
      if (filters.tags && filters.tags.length > 0) {
        leads = leads.filter(lead => 
          filters.tags!.some(tag => lead.tags.includes(tag))
        )
      }
      if (filters.dateRange) {
        leads = leads.filter(lead => 
          lead.createdAt >= filters.dateRange!.start && 
          lead.createdAt <= filters.dateRange!.end
        )
      }
    }

    return leads.sort((a, b) => b.createdAt - a.createdAt)
  }

  /**
   * Create contact
   */
  public async createContact(contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt' | 'totalInteractions'>): Promise<Contact> {
    const contact: Contact = {
      id: `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      totalInteractions: 0,
      ...contactData
    }

    // Validate contact data
    if (this.config.enableDataValidation) {
      this.validateContactData(contact)
    }

    this.contacts.set(contact.id, contact)

    // Trigger automations
    if (this.config.enableAutomation) {
      await this.triggerAutomations('contact_created', contact)
    }

    ErrorLogger.logInfo('Contact created', {
      contactId: contact.id,
      email: contact.email,
      company: contact.company,
      status: contact.status
    })

    return contact
  }

  /**
   * Update contact
   */
  public async updateContact(contactId: string, updateData: Partial<Contact>): Promise<Contact> {
    const contact = this.contacts.get(contactId)
    if (!contact) {
      throw new Error(`Contact not found: ${contactId}`)
    }

    const updatedContact: Contact = {
      ...contact,
      ...updateData,
      id: contactId,
      updatedAt: Date.now()
    }

    // Validate updated data
    if (this.config.enableDataValidation) {
      this.validateContactData(updatedContact)
    }

    this.contacts.set(contactId, updatedContact)

    ErrorLogger.logInfo('Contact updated', {
      contactId,
      changes: Object.keys(updateData),
      status: updatedContact.status
    })

    return updatedContact
  }

  /**
   * Get contact
   */
  public getContact(contactId: string): Contact | null {
    return this.contacts.get(contactId) || null
  }

  /**
   * Get contacts
   */
  public getContacts(filters?: {
    status?: string
    company?: string
    assignedTo?: string
    tags?: string[]
    dateRange?: { start: number; end: number }
  }): Contact[] {
    let contacts = Array.from(this.contacts.values())

    if (filters) {
      if (filters.status) {
        contacts = contacts.filter(contact => contact.status === filters.status)
      }
      if (filters.company) {
        contacts = contacts.filter(contact => contact.company === filters.company)
      }
      if (filters.assignedTo) {
        contacts = contacts.filter(contact => contact.assignedTo === filters.assignedTo)
      }
      if (filters.tags && filters.tags.length > 0) {
        contacts = contacts.filter(contact => 
          filters.tags!.some(tag => contact.tags.includes(tag))
        )
      }
      if (filters.dateRange) {
        contacts = contacts.filter(contact => 
          contact.createdAt >= filters.dateRange!.start && 
          contact.createdAt <= filters.dateRange!.end
        )
      }
    }

    return contacts.sort((a, b) => b.createdAt - a.createdAt)
  }

  /**
   * Create deal
   */
  public async createDeal(dealData: Omit<Deal, 'id' | 'createdAt' | 'updatedAt' | 'lastActivityAt'>): Promise<Deal> {
    const deal: Deal = {
      id: `deal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastActivityAt: Date.now(),
      ...dealData
    }

    // Validate deal data
    if (this.config.enableDataValidation) {
      this.validateDealData(deal)
    }

    this.deals.set(deal.id, deal)

    // Update pipeline metadata
    this.updatePipelineMetadata(deal)

    // Trigger automations
    if (this.config.enableAutomation) {
      await this.triggerAutomations('deal_updated', deal)
    }

    ErrorLogger.logInfo('Deal created', {
      dealId: deal.id,
      name: deal.name,
      value: deal.value,
      stage: deal.stage
    })

    return deal
  }

  /**
   * Update deal
   */
  public async updateDeal(dealId: string, updateData: Partial<Deal>): Promise<Deal> {
    const deal = this.deals.get(dealId)
    if (!deal) {
      throw new Error(`Deal not found: ${dealId}`)
    }

    const updatedDeal: Deal = {
      ...deal,
      ...updateData,
      id: dealId,
      updatedAt: Date.now(),
      lastActivityAt: Date.now()
    }

    // Validate updated data
    if (this.config.enableDataValidation) {
      this.validateDealData(updatedDeal)
    }

    this.deals.set(dealId, updatedDeal)

    // Update pipeline metadata
    this.updatePipelineMetadata(updatedDeal)

    // Trigger automations
    if (this.config.enableAutomation) {
      await this.triggerAutomations('deal_updated', updatedDeal)
    }

    ErrorLogger.logInfo('Deal updated', {
      dealId,
      changes: Object.keys(updateData),
      stage: updatedDeal.stage,
      value: updatedDeal.value
    })

    return updatedDeal
  }

  /**
   * Get deal
   */
  public getDeal(dealId: string): Deal | null {
    return this.deals.get(dealId) || null
  }

  /**
   * Get deals
   */
  public getDeals(filters?: {
    stage?: string
    assignedTo?: string
    pipeline?: string
    dateRange?: { start: number; end: number }
    minValue?: number
    maxValue?: number
  }): Deal[] {
    let deals = Array.from(this.deals.values())

    if (filters) {
      if (filters.stage) {
        deals = deals.filter(deal => deal.stage === filters.stage)
      }
      if (filters.assignedTo) {
        deals = deals.filter(deal => deal.assignedTo === filters.assignedTo)
      }
      if (filters.pipeline) {
        deals = deals.filter(deal => deal.metadata.pipeline === filters.pipeline)
      }
      if (filters.dateRange) {
        deals = deals.filter(deal => 
          deal.createdAt >= filters.dateRange!.start && 
          deal.createdAt <= filters.dateRange!.end
        )
      }
      if (filters.minValue) {
        deals = deals.filter(deal => deal.value >= filters.minValue!)
      }
      if (filters.maxValue) {
        deals = deals.filter(deal => deal.value <= filters.maxValue!)
      }
    }

    return deals.sort((a, b) => b.createdAt - a.createdAt)
  }

  /**
   * Create task
   */
  public async createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const task: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...taskData
    }

    this.tasks.set(task.id, task)

    ErrorLogger.logInfo('Task created', {
      taskId: task.id,
      title: task.title,
      type: task.type,
      dueDate: task.dueDate
    })

    return task
  }

  /**
   * Update task
   */
  public async updateTask(taskId: string, updateData: Partial<Task>): Promise<Task> {
    const task = this.tasks.get(taskId)
    if (!task) {
      throw new Error(`Task not found: ${taskId}`)
    }

    const updatedTask: Task = {
      ...task,
      ...updateData,
      id: taskId,
      updatedAt: Date.now()
    }

    this.tasks.set(taskId, updatedTask)

    // Trigger automations
    if (this.config.enableAutomation && updateData.status === 'completed') {
      await this.triggerAutomations('task_completed', updatedTask)
    }

    ErrorLogger.logInfo('Task updated', {
      taskId,
      changes: Object.keys(updateData),
      status: updatedTask.status
    })

    return updatedTask
  }

  /**
   * Get task
   */
  public getTask(taskId: string): Task | null {
    return this.tasks.get(taskId) || null
  }

  /**
   * Get tasks
   */
  public getTasks(filters?: {
    status?: string
    type?: string
    assignedTo?: string
    dueDate?: { start: number; end: number }
    priority?: string
  }): Task[] {
    let tasks = Array.from(this.tasks.values())

    if (filters) {
      if (filters.status) {
        tasks = tasks.filter(task => task.status === filters.status)
      }
      if (filters.type) {
        tasks = tasks.filter(task => task.type === filters.type)
      }
      if (filters.assignedTo) {
        tasks = tasks.filter(task => task.assignedTo === filters.assignedTo)
      }
      if (filters.dueDate) {
        tasks = tasks.filter(task => 
          task.dueDate >= filters.dueDate!.start && 
          task.dueDate <= filters.dueDate!.end
        )
      }
      if (filters.priority) {
        tasks = tasks.filter(task => task.priority === filters.priority)
      }
    }

    return tasks.sort((a, b) => a.dueDate - b.dueDate)
  }

  /**
   * Create communication
   */
  public async createCommunication(communicationData: Omit<Communication, 'id' | 'createdAt' | 'updatedAt'>): Promise<Communication> {
    const communication: Communication = {
      id: `comm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...communicationData
    }

    this.communications.set(communication.id, communication)

    // Update related contact's interaction count
    if (communication.relatedTo.type === 'contact') {
      const contact = this.contacts.get(communication.relatedTo.id)
      if (contact) {
        contact.totalInteractions++
        contact.lastContactAt = Date.now()
        this.contacts.set(contact.id, contact)
      }
    }

    ErrorLogger.logInfo('Communication created', {
      communicationId: communication.id,
      type: communication.type,
      direction: communication.direction,
      relatedTo: communication.relatedTo
    })

    return communication
  }

  /**
   * Get communication
   */
  public getCommunication(communicationId: string): Communication | null {
    return this.communications.get(communicationId) || null
  }

  /**
   * Get communications
   */
  public getCommunications(filters?: {
    type?: string
    direction?: string
    relatedTo?: { type: string; id: string }
    dateRange?: { start: number; end: number }
  }): Communication[] {
    let communications = Array.from(this.communications.values())

    if (filters) {
      if (filters.type) {
        communications = communications.filter(comm => comm.type === filters.type)
      }
      if (filters.direction) {
        communications = communications.filter(comm => comm.direction === filters.direction)
      }
      if (filters.relatedTo) {
        communications = communications.filter(comm => 
          comm.relatedTo.type === filters.relatedTo!.type && 
          comm.relatedTo.id === filters.relatedTo!.id
        )
      }
      if (filters.dateRange) {
        communications = communications.filter(comm => 
          comm.createdAt >= filters.dateRange!.start && 
          comm.createdAt <= filters.dateRange!.end
        )
      }
    }

    return communications.sort((a, b) => b.createdAt - a.createdAt)
  }

  /**
   * Get pipeline
   */
  public getPipeline(pipelineId: string): Pipeline | null {
    return this.pipelines.get(pipelineId) || null
  }

  /**
   * Get pipelines
   */
  public getPipelines(): Pipeline[] {
    return Array.from(this.pipelines.values()).filter(pipeline => pipeline.isActive)
  }

  /**
   * Generate CRM report
   */
  public async generateReport(
    type: CRMReport['type'],
    period: { start: number; end: number },
    filters?: Record<string, any>
  ): Promise<CRMReport> {
    const report: CRMReport = {
      id: `report_${type}_${period.start}_${period.end}`,
      type,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
      description: `Report for ${type} from ${new Date(period.start).toISOString()} to ${new Date(period.end).toISOString()}`,
      period,
      filters: filters || {},
      metrics: await this.calculateReportMetrics(type, period, filters),
      charts: await this.generateReportCharts(type, period, filters),
      insights: await this.generateReportInsights(type, period, filters),
      recommendations: await this.generateReportRecommendations(type, period, filters),
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    this.reports.set(report.id, report)

    ErrorLogger.logInfo('CRM report generated', {
      reportId: report.id,
      type,
      period: `${new Date(period.start).toISOString()} to ${new Date(period.end).toISOString()}`,
      metrics: Object.keys(report.metrics).length
    })

    return report
  }

  /**
   * Calculate report metrics
   */
  private async calculateReportMetrics(
    type: CRMReport['type'],
    period: { start: number; end: number },
    filters?: Record<string, any>
  ): Promise<CRMReport['metrics']> {
    const leads = this.getLeads({ dateRange: period })
    const contacts = this.getContacts({ dateRange: period })
    const deals = this.getDeals({ dateRange: period })

    const totalLeads = leads.length
    const newLeads = leads.filter(lead => lead.status === 'new').length
    const convertedLeads = leads.filter(lead => lead.status === 'closed_won').length
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0

    const totalContacts = contacts.length
    const activeContacts = contacts.filter(contact => contact.status === 'active').length

    const totalDeals = deals.length
    const wonDeals = deals.filter(deal => deal.stage === 'closed_won').length
    const lostDeals = deals.filter(deal => deal.stage === 'closed_lost').length
    const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0)
    const wonValue = deals.filter(deal => deal.stage === 'closed_won').reduce((sum, deal) => sum + deal.value, 0)
    const averageDealSize = totalDeals > 0 ? totalValue / totalDeals : 0

    // Calculate average sales cycle
    const closedDeals = deals.filter(deal => deal.actualCloseDate)
    const averageSalesCycle = closedDeals.length > 0 
      ? closedDeals.reduce((sum, deal) => sum + (deal.actualCloseDate! - deal.createdAt), 0) / closedDeals.length
      : 0

    return {
      totalLeads,
      newLeads,
      convertedLeads,
      conversionRate,
      totalContacts,
      activeContacts,
      totalDeals,
      wonDeals,
      lostDeals,
      totalValue,
      wonValue,
      averageDealSize,
      averageSalesCycle
    }
  }

  /**
   * Generate report charts
   */
  private async generateReportCharts(
    type: CRMReport['type'],
    period: { start: number; end: number },
    filters?: Record<string, any>
  ): Promise<CRMReport['charts']> {
    const charts: CRMReport['charts'] = []

    if (type === 'leads' || type === 'custom') {
      // Lead source chart
      const leads = this.getLeads({ dateRange: period })
      const sourceData = leads.reduce((acc, lead) => {
        acc[lead.source] = (acc[lead.source] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      charts.push({
        type: 'pie',
        title: 'Leads by Source',
        data: Object.entries(sourceData).map(([source, count]) => ({ name: source, value: count })),
        config: { colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'] }
      })
    }

    if (type === 'deals' || type === 'pipeline' || type === 'custom') {
      // Pipeline funnel chart
      const deals = this.getDeals({ dateRange: period })
      const stageData = deals.reduce((acc, deal) => {
        acc[deal.stage] = (acc[deal.stage] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      charts.push({
        type: 'funnel',
        title: 'Sales Pipeline',
        data: Object.entries(stageData).map(([stage, count]) => ({ name: stage, value: count })),
        config: { colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'] }
      })
    }

    return charts
  }

  /**
   * Generate report insights
   */
  private async generateReportInsights(
    type: CRMReport['type'],
    period: { start: number; end: number },
    filters?: Record<string, any>
  ): Promise<string[]> {
    const insights: string[] = []

    if (type === 'leads') {
      const leads = this.getLeads({ dateRange: period })
      const conversionRate = leads.length > 0 ? (leads.filter(lead => lead.status === 'closed_won').length / leads.length) * 100 : 0
      
      if (conversionRate > 20) {
        insights.push('High conversion rate indicates effective lead qualification')
      } else if (conversionRate < 10) {
        insights.push('Low conversion rate suggests need for better lead qualification')
      }
    }

    if (type === 'deals') {
      const deals = this.getDeals({ dateRange: period })
      const averageDealSize = deals.length > 0 ? deals.reduce((sum, deal) => sum + deal.value, 0) / deals.length : 0
      
      if (averageDealSize > 10000) {
        insights.push('High average deal size indicates strong value proposition')
      } else if (averageDealSize < 1000) {
        insights.push('Low average deal size suggests opportunity for upselling')
      }
    }

    return insights
  }

  /**
   * Generate report recommendations
   */
  private async generateReportRecommendations(
    type: CRMReport['type'],
    period: { start: number; end: number },
    filters?: Record<string, any>
  ): Promise<string[]> {
    const recommendations: string[] = []

    if (type === 'leads') {
      recommendations.push('Implement lead scoring to prioritize high-value prospects')
      recommendations.push('Set up automated follow-up sequences for new leads')
    }

    if (type === 'deals') {
      recommendations.push('Focus on deals in negotiation stage to accelerate closure')
      recommendations.push('Implement deal review process for better forecasting')
    }

    if (type === 'performance') {
      recommendations.push('Provide additional training for underperforming team members')
      recommendations.push('Implement performance incentives for top performers')
    }

    return recommendations
  }

  /**
   * Validate lead data
   */
  private validateLeadData(lead: Lead): void {
    if (!lead.email || !lead.email.includes('@')) {
      throw new Error('Invalid email address')
    }
    if (!lead.firstName || lead.firstName.trim().length === 0) {
      throw new Error('First name is required')
    }
    if (!lead.lastName || lead.lastName.trim().length === 0) {
      throw new Error('Last name is required')
    }
  }

  /**
   * Validate contact data
   */
  private validateContactData(contact: Contact): void {
    if (!contact.email || !contact.email.includes('@')) {
      throw new Error('Invalid email address')
    }
    if (!contact.firstName || contact.firstName.trim().length === 0) {
      throw new Error('First name is required')
    }
    if (!contact.lastName || contact.lastName.trim().length === 0) {
      throw new Error('Last name is required')
    }
  }

  /**
   * Validate deal data
   */
  private validateDealData(deal: Deal): void {
    if (!deal.name || deal.name.trim().length === 0) {
      throw new Error('Deal name is required')
    }
    if (deal.value <= 0) {
      throw new Error('Deal value must be greater than 0')
    }
    if (deal.probability < 0 || deal.probability > 100) {
      throw new Error('Deal probability must be between 0 and 100')
    }
  }

  /**
   * Update pipeline metadata
   */
  private updatePipelineMetadata(deal: Deal): void {
    const pipeline = this.pipelines.get('default_pipeline')
    if (pipeline) {
      pipeline.metadata.totalDeals++
      pipeline.metadata.totalValue += deal.value
      pipeline.metadata.averageDealSize = pipeline.metadata.totalValue / pipeline.metadata.totalDeals
      pipeline.updatedAt = Date.now()
      this.pipelines.set(pipeline.id, pipeline)
    }
  }

  /**
   * Trigger automations
   */
  private async triggerAutomations(triggerType: string, data: any): Promise<void> {
    const activeAutomations = Array.from(this.automations.values())
      .filter(automation => automation.isActive && automation.trigger.type === triggerType)

    for (const automation of activeAutomations) {
      try {
        // Check trigger conditions
        if (this.evaluateTriggerConditions(automation.trigger.conditions, data)) {
          // Execute actions
          for (const action of automation.actions) {
            await this.executeAction(action, data)
          }
          
          // Update automation stats
          automation.executionCount++
          automation.lastExecutedAt = Date.now()
          this.automations.set(automation.id, automation)
        }
      } catch (error) {
        ErrorLogger.log(error as Error, { context: 'crm-automation', automationId: automation.id })
      }
    }
  }

  /**
   * Evaluate trigger conditions
   */
  private evaluateTriggerConditions(conditions: Record<string, any>, data: any): boolean {
    // Simplified condition evaluation
    // In real implementation, use a proper rule engine
    for (const [field, expectedValue] of Object.entries(conditions)) {
      if (data[field] !== expectedValue) {
        return false
      }
    }
    return true
  }

  /**
   * Execute action
   */
  private async executeAction(action: CRMAutomation['actions'][0], data: any): Promise<void> {
    switch (action.type) {
      case 'send_email':
        // Implement email sending
        break
      case 'create_task':
        // Implement task creation
        break
      case 'update_field':
        // Implement field update
        break
      case 'assign_to':
        // Implement assignment
        break
      case 'create_deal':
        // Implement deal creation
        break
      case 'send_notification':
        // Implement notification sending
        break
    }
  }

  /**
   * Perform backup using real database operations
   */
  private async performBackup(): Promise<void> {
    try {
      // Use real Convex database for backup
      const { ConvexHttpClient } = await import('convex/browser')
      const { api } = await import('../convex/_generated/api')
      
      const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)
      
      // Create backup record in database
      await convex.mutation(api.crm.createBackup, {
        leads: Array.from(this.leads.entries()),
        contacts: Array.from(this.contacts.entries()),
        deals: Array.from(this.deals.entries()),
        tasks: Array.from(this.tasks.entries()),
        communications: Array.from(this.communications.entries()),
        pipelines: Array.from(this.pipelines.entries()),
        reports: Array.from(this.reports.entries()),
        automations: Array.from(this.automations.entries()),
        timestamp: Date.now()
      })

      ErrorLogger.logInfo('CRM backup performed', {
        leadsCount: this.leads.size,
        contactsCount: this.contacts.size,
        dealsCount: this.deals.size,
        tasksCount: this.tasks.size
      })
      
    } catch (error) {
      ErrorLogger.log(error as Error, { context: 'crm-backup' })
    }
  }

  /**
   * Process notifications using real notification service
   */
  private async processNotifications(): Promise<void> {
    try {
      // Check for overdue tasks
      const overdueTasks = this.getTasks({ status: 'pending' })
        .filter(task => task.dueDate < Date.now())

      // Check for follow-up reminders
      const followUpLeads = this.getLeads()
        .filter(lead => lead.nextFollowUpAt && lead.nextFollowUpAt <= Date.now())

      // Send real notifications
      if (overdueTasks.length > 0 || followUpLeads.length > 0) {
        await this.sendNotifications(overdueTasks, followUpLeads)
        
        ErrorLogger.logInfo('CRM notifications processed', {
          overdueTasks: overdueTasks.length,
          followUpLeads: followUpLeads.length
        })
      }
    } catch (error) {
      ErrorLogger.log(error as Error, { context: 'crm-notifications' })
    }
  }

  /**
   * Send notifications using real notification service
   */
  private async sendNotifications(overdueTasks: Task[], followUpLeads: Lead[]): Promise<void> {
    try {
      const response = await fetch(`/api/notifications/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NOTIFICATION_SERVICE_API_KEY}`
        },
        body: JSON.stringify({
          overdueTasks: overdueTasks.map(task => ({
            id: task.id,
            title: task.title,
            dueDate: task.dueDate,
            assignedTo: task.assignedTo
          })),
          followUpLeads: followUpLeads.map(lead => ({
            id: lead.id,
            name: `${lead.firstName} ${lead.lastName}`,
            email: lead.email,
            nextFollowUpAt: lead.nextFollowUpAt,
            assignedTo: lead.assignedTo
          }))
        })
      })
      
      if (!response.ok) {
        throw new Error(`Failed to send notifications: ${response.statusText}`)
      }
      
    } catch (error) {
      ErrorLogger.log(error as Error, { context: 'send-notifications' })
    }
  }

  /**
   * Get CRM statistics
   */
  public getCRMStats(): {
    totalLeads: number
    totalContacts: number
    totalDeals: number
    totalTasks: number
    totalCommunications: number
    activePipelines: number
    totalReports: number
    activeAutomations: number
  } {
    return {
      totalLeads: this.leads.size,
      totalContacts: this.contacts.size,
      totalDeals: this.deals.size,
      totalTasks: this.tasks.size,
      totalCommunications: this.communications.size,
      activePipelines: Array.from(this.pipelines.values()).filter(p => p.isActive).length,
      totalReports: this.reports.size,
      activeAutomations: Array.from(this.automations.values()).filter(a => a.isActive).length
    }
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<CRMConfig>): void {
    this.config = { ...this.config, ...newConfig }
    
    // Restart services if needed
    if (newConfig.autoBackupInterval || newConfig.notificationInterval) {
      this.stopCRMServices()
      this.startCRMServices()
    }
  }

  /**
   * Stop CRM services
   */
  private stopCRMServices(): void {
    if (this.backupInterval) {
      clearInterval(this.backupInterval)
      this.backupInterval = undefined
    }
    if (this.notificationInterval) {
      clearInterval(this.notificationInterval)
      this.notificationInterval = undefined
    }
  }

  /**
   * Cleanup CRM
   */
  public cleanup(): void {
    this.stopCRMServices()
    this.leads.clear()
    this.contacts.clear()
    this.deals.clear()
    this.tasks.clear()
    this.communications.clear()
    this.pipelines.clear()
    this.reports.clear()
    this.automations.clear()
  }
}

// Singleton instance
export const internalCRM = new InternalCRM()

// Export types and class
export { InternalCRM }
