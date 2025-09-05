"use client"

import * as React from "react"
import {
  User,
  Briefcase,
  Code,
  FolderOpen,
  BookOpen,
  Mail,
  Command,
} from "lucide-react"

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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslations()

  const data = {
    user: {
      name: portfolioData.personal.name,
      email: portfolioData.personal.email,
      avatar: portfolioData.personal.avatar,
    },
    navMain: [
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
        title: t.nav.blog,
        url: "#blog",
        icon: BookOpen,
      },
    ],
    navSecondary: [
      {
        title: t.nav.contact,
        url: "/contact",
        icon: Mail,
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
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
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
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
