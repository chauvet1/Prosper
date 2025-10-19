"use client"

import * as React from "react"
import {
  User,
  Briefcase,
  Code,
  FolderOpen,
  BookOpen,
  Wrench,
} from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useTranslations } from "@/hooks/use-translations"
import { portfolioData } from "@/lib/portfolio-data"
import { useAuth } from '@workos-inc/authkit-nextjs/components'
import { useUserRole } from '@/hooks/use-user-role'
import { Settings, BarChart3, Users, FileText, Mail } from "lucide-react"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslations()
  const { user, loading } = useAuth()
  const { isAdmin, isAuthenticated, isLoading } = useUserRole()
  
  console.log('Sidebar auth state:', { isAuthenticated, isLoading, isAdmin, user: user?.email });

  const data = {
    user: {
      name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email || portfolioData.personal.name,
      email: user?.email || portfolioData.personal.email,
      avatar: user?.profilePictureUrl || portfolioData.personal.avatar,
    },
    navMain: isAuthenticated ? [
      {
        title: "Dashboard",
        url: isAdmin ? "/admin" : "/dashboard",
        icon: BarChart3,
        isActive: true,
      },
      {
        title: "Projects",
        url: "/projects",
        icon: FolderOpen,
      },
      {
        title: "Messages",
        url: "/messages",
        icon: Mail,
      },
      {
        title: "Team",
        url: "/team",
        icon: Users,
      },
      {
        title: "Reports",
        url: "/reports",
        icon: FileText,
      },
    ] : [
      {
        title: t.nav.about,
        url: "#about",
        icon: User,
        isActive: true,
      },
      {
        title: t.nav.experience,
        url: "#experience",
        icon: Briefcase,
      },
      {
        title: t.nav.skills,
        url: "#skills",
        icon: Code,
      },
      {
        title: t.nav.projects,
        url: "/projects",
        icon: FolderOpen,
      },
      {
        title: "Services",
        url: "/services",
        icon: Wrench,
      },
      {
        title: t.nav.blog,
        url: "#blog",
        icon: BookOpen,
      },
    ],
    navSecondary: isAuthenticated ? [
      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
      },
      {
        title: "Help & Support",
        url: "/help",
        icon: Mail,
      },
    ] : [
      {
        title: t.nav.contact,
        url: "/contact",
        icon: Mail,
      },
    ],
    // Admin navigation items (only shown when authenticated)
    adminNav: [
      {
        title: "Dashboard",
        url: "/admin",
        icon: BarChart3,
      },
      {
        title: "Portfolio Editor",
        url: "/admin/portfolio",
        icon: FileText,
      },
      {
        title: "Analytics",
        url: "/admin/analytics",
        icon: BarChart3,
      },
      {
        title: "Users",
        url: "/admin/users",
        icon: Users,
      },
      {
        title: "Settings",
        url: "/admin/settings",
        icon: Settings,
      },
    ],
  }

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Prosper Merimee - Full Stack Developer">
              <a href="#">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={portfolioData.personal.avatar} alt={portfolioData.personal.name} />
                  <AvatarFallback className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    {portfolioData.personal.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Prosper Merimee</span>
                  <span className="truncate text-xs">Full Stack Developer</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
        
        {/* Admin Navigation - Only shown when authenticated and is admin */}
        {isAuthenticated && isAdmin && (
          <>
            <div className="px-2 py-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Admin
              </div>
            </div>
            <NavMain items={data.adminNav} />
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
