"use client"

import {
  ChevronsUpDown,
  Sparkles,
  Mail,
  Shield,
  FileText,
  FolderOpen,
  LogIn,
  LogOut,
  User,
  UserPlus,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from '@workos-inc/authkit-nextjs/components'
import { signOut } from '@workos-inc/authkit-nextjs'
import { AuthModal } from "@/components/auth-modal"
import { Button } from "@/components/ui/button"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const { user: authUser, loading } = useAuth()
  
  const isAuthenticated = !!authUser
  const isLoading = loading

  // Show login/signup buttons if not authenticated
  if (!isAuthenticated && !isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <AuthModal mode="signin">
            <SidebarMenuButton size="sm" tooltip="Sign In">
              <LogIn className="h-4 w-4" />
              <span className="truncate font-medium group-data-[collapsible=icon]:hidden">Sign In</span>
            </SidebarMenuButton>
          </AuthModal>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <AuthModal mode="signup">
            <SidebarMenuButton size="sm" tooltip="Sign Up">
              <UserPlus className="h-4 w-4" />
              <span className="truncate font-medium group-data-[collapsible=icon]:hidden">Sign Up</span>
            </SidebarMenuButton>
          </AuthModal>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  // Show loading state
  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="sm" disabled tooltip="Loading...">
            <User className="h-4 w-4" />
            <span className="truncate font-medium group-data-[collapsible=icon]:hidden">Loading...</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              tooltip={user.name}
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <a href="/contact">
                  <Mail />
                  Contact
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/privacy">
                  <Shield />
                  Privacy Policy
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/terms">
                  <FileText />
                  Terms & Conditions
                </a>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href="/projects">
                <FolderOpen />
                View Projects
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
