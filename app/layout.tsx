import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { StructuredData } from "@/components/structured-data";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mouil Prosper Merimee - Full Stack Developer | Portfolio",
  description: "Full Stack Developer with 4+ years experience in JavaScript, React.js, Next.js, Node.js, PHP. Specializing in scalable web applications and AI integration.",
  keywords: ["Full Stack Developer", "JavaScript", "React.js", "Next.js", "Node.js", "PHP", "Web Development", "Cameroon", "Yaoundé"],
  authors: [{ name: "Mouil Moudon Prosper Merimee" }],
  creator: "Mouil Moudon Prosper Merimee",
  publisher: "Mouil Moudon Prosper Merimee",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pepis.pro/",
    title: "Mouil Prosper Merimee - Full Stack Developer",
    description: "Full Stack Developer specializing in modern web technologies and AI integration",
    siteName: "Prosper Merimee Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mouil Prosper Merimee - Full Stack Developer",
    description: "Full Stack Developer specializing in modern web technologies and AI integration",
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
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <StructuredData />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
