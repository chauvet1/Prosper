import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { StructuredData } from "@/components/structured-data";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mouil Prosper - Full-Stack Engineer | Java, Spring Boot, React, AWS Expert",
  description: "4+ years building secure, cloud-native SaaS. Expert in Java 17, Spring Boot, Angular, React, TypeScript, AWS, GCP, Docker, CI/CD. Built crypto gateway ($2M monthly, <0.2% fraud). Lead 4-engineer Agile squad.",
  keywords: ["Full-Stack Engineer", "Java Developer", "Spring Boot", "Angular", "React", "TypeScript", "AWS", "GCP", "Docker", "CI/CD", "PostgreSQL", "Microservices", "SaaS", "Crypto Gateway", "Stevo Digital", "Micro QQ Tech", "Cameroon Developer"],
  authors: [{ name: "Mouil Prosper" }],
  creator: "Mouil Prosper",
  publisher: "Mouil Prosper",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pepis.world/",
    title: "Mouil Prosper - Full-Stack Engineer | Java, Spring Boot, React Expert",
    description: "4+ years building secure, cloud-native SaaS. Expert in Java 17, Spring Boot, Angular, React, TypeScript, AWS, GCP, Docker, CI/CD. Built crypto gateway ($2M monthly, <0.2% fraud).",
    siteName: "Mouil Prosper Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mouil Prosper - Full-Stack Engineer | Java, Spring Boot, React Expert",
    description: "4+ years building secure, cloud-native SaaS. Expert in Java 17, Spring Boot, Angular, React, TypeScript, AWS, GCP, Docker, CI/CD.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
            <Providers>
              <StructuredData />
              {children}
            </Providers>
      </body>
    </html>
  );
}
