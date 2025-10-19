"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { RoleBasedRedirect } from "@/components/role-based-redirect"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { AIAssistant } from "@/components/ui/ai-assistant"
import { useTranslations } from "@/hooks/use-translations"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  User, 
  Briefcase, 
  Code, 
  FolderOpen, 
  BookOpen, 
  Mail, 
  Eye, 
  TrendingUp, 
  Activity,
  Calendar,
  Clock,
  Star,
  MessageSquare,
  Download,
  ExternalLink
} from "lucide-react"

export default function ClientDashboard() {
  const { locale } = useTranslations()
  
  return (
    <RoleBasedRedirect requiredRole="client">
    <div className="h-screen overflow-hidden">
        <SidebarProvider defaultOpen={true}>
        <AppSidebar />
          <SidebarInset className="flex flex-col h-screen">
            <header className="flex h-16 shrink-0 items-center gap-2 justify-between sticky top-0 z-50">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="/">
                        Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                      <BreadcrumbPage>Client Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
              <div className="flex items-center gap-2 px-4">
                <LanguageToggle />
            <ThemeToggle />
          </div>
        </header>
            <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth">
              <div className="h-full p-6">
                <div className="space-y-6">
                  {/* Header */}
                  <div>
                    <h1 className="text-3xl font-bold">Welcome to Your Dashboard</h1>
                    <p className="text-muted-foreground">
                      Manage your projects, track progress, and collaborate with your team.
                    </p>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Active Projects
                        </CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">3</div>
                        <p className="text-xs text-muted-foreground">
                          +1 new this month
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Completed Tasks
                        </CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">24</div>
                        <p className="text-xs text-muted-foreground">
                          +8 this week
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Messages
                        </CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">
                          +3 unread
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Team Members
                        </CardTitle>
                        <User className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">5</div>
                        <p className="text-xs text-muted-foreground">
                          All active
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Main Content Grid */}
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Recent Projects */}
                    <Card className="md:col-span-2">
                      <CardHeader>
                        <CardTitle>Recent Projects</CardTitle>
                        <CardDescription>
                          Your latest project updates and progress
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">E-commerce Platform</p>
                              <p className="text-xs text-muted-foreground">Frontend development completed</p>
                            </div>
                            <div className="text-xs text-muted-foreground">2 days ago</div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">Mobile App</p>
                              <p className="text-xs text-muted-foreground">Backend integration in progress</p>
                            </div>
                            <div className="text-xs text-muted-foreground">1 week ago</div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">Website Redesign</p>
                              <p className="text-xs text-muted-foreground">Design phase completed</p>
                            </div>
                            <div className="text-xs text-muted-foreground">2 weeks ago</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>
                          Common tasks and shortcuts
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <Button variant="outline" className="w-full justify-start">
                            <FolderOpen className="mr-2 h-4 w-4" />
                            View All Projects
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <Mail className="mr-2 h-4 w-4" />
                            Send Message
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <Download className="mr-2 h-4 w-4" />
                            Download Reports
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Portfolio
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Upcoming Deadlines */}
                    <Card className="md:col-span-2">
                      <CardHeader>
                        <CardTitle>Upcoming Deadlines</CardTitle>
                        <CardDescription>
                          Important dates and milestones
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-4">
                            <Calendar className="h-4 w-4 text-red-500" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">Project Alpha - Final Review</p>
                              <p className="text-xs text-muted-foreground">Due in 3 days</p>
                            </div>
                            <Button size="sm" variant="outline">View</Button>
                          </div>
                          <div className="flex items-center space-x-4">
                            <Clock className="h-4 w-4 text-yellow-500" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">Beta Testing Phase</p>
                              <p className="text-xs text-muted-foreground">Starts next week</p>
                            </div>
                            <Button size="sm" variant="outline">Prepare</Button>
                          </div>
                          <div className="flex items-center space-x-4">
                            <Star className="h-4 w-4 text-green-500" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">Client Presentation</p>
                              <p className="text-xs text-muted-foreground">Scheduled for next month</p>
                            </div>
                            <Button size="sm" variant="outline">Schedule</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Team Activity */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Team Activity</CardTitle>
                        <CardDescription>
                          Recent team updates
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                              JD
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">John Doe</p>
                              <p className="text-xs text-muted-foreground">Updated project status</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                              SM
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">Sarah Miller</p>
                              <p className="text-xs text-muted-foreground">Completed code review</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                              MJ
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">Mike Johnson</p>
                              <p className="text-xs text-muted-foreground">Added new feature</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
          </div>
        </div>
            </main>
        </SidebarInset>
      </SidebarProvider>

      {/* AI Assistant */}
      <AIAssistant locale={locale} context="dashboard" />
    </div>
    </RoleBasedRedirect>
  )
}
