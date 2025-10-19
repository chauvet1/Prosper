"use client";

import { useAuth } from '@workos-inc/authkit-nextjs/components';
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { RoleBasedRedirect } from "@/components/role-based-redirect";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, FileText, Mail, Eye, TrendingUp, Activity } from "lucide-react";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const isAuthenticated = !!user
  const isLoading = loading

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <RoleBasedRedirect requiredRole="admin">
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
                    <BreadcrumbPage>Admin Dashboard</BreadcrumbPage>
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
                  <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                  <p className="text-muted-foreground">
                    Welcome to the admin panel. Manage your portfolio and content.
                  </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Views
                      </CardTitle>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">12,345</div>
                      <p className="text-xs text-muted-foreground">
                        +20.1% from last month
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Blog Posts
                      </CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">24</div>
                      <p className="text-xs text-muted-foreground">
                        +2 new this week
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Projects
                      </CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">8</div>
                      <p className="text-xs text-muted-foreground">
                        +1 new project
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Contact Messages
                      </CardTitle>
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">156</div>
                      <p className="text-xs text-muted-foreground">
                        +12 this week
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle>Content Management</CardTitle>
                      <CardDescription>
                        Manage your blog posts and projects
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <button className="w-full text-left p-2 rounded hover:bg-muted">
                          Create New Blog Post
                        </button>
                        <button className="w-full text-left p-2 rounded hover:bg-muted">
                          Add New Project
                        </button>
                        <button className="w-full text-left p-2 rounded hover:bg-muted">
                          Update Portfolio
                        </button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Analytics</CardTitle>
                      <CardDescription>
                        View detailed analytics and insights
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <button className="w-full text-left p-2 rounded hover:bg-muted">
                          View Traffic Analytics
                        </button>
                        <button className="w-full text-left p-2 rounded hover:bg-muted">
                          User Behavior Reports
                        </button>
                        <button className="w-full text-left p-2 rounded hover:bg-muted">
                          Performance Metrics
                        </button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Settings</CardTitle>
                      <CardDescription>
                        Configure your portfolio settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <button className="w-full text-left p-2 rounded hover:bg-muted">
                          General Settings
                        </button>
                        <button className="w-full text-left p-2 rounded hover:bg-muted">
                          SEO Configuration
                        </button>
                        <button className="w-full text-left p-2 rounded hover:bg-muted">
                          Backup & Restore
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Latest updates and changes to your portfolio
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <Activity className="h-4 w-4 text-green-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">New blog post published</p>
                          <p className="text-xs text-muted-foreground">2 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Portfolio views increased</p>
                          <p className="text-xs text-muted-foreground">5 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Mail className="h-4 w-4 text-orange-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">New contact message received</p>
                          <p className="text-xs text-muted-foreground">1 day ago</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
    </RoleBasedRedirect>
  );
}
