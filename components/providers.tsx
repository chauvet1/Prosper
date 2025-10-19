"use client"

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { AuthKitProvider } from '@workos-inc/authkit-nextjs/components';
import { ThemeProvider } from "@/components/theme-provider";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ConvexProvider client={convex}>
      <AuthKitProvider
        clientId={process.env.NEXT_PUBLIC_WORKOS_CLIENT_ID!}
        redirectUri={process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI!}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </AuthKitProvider>
    </ConvexProvider>
  );
}
