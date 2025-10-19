"use client";

import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Plus, Trash2, Edit, User, Briefcase, Code, Award, Globe } from "lucide-react";
import { portfolioData } from "@/lib/portfolio-data";

export default function AdminPortfolioPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const [portfolio, setPortfolio] = useState(portfolioData);
  const [activeTab, setActiveTab] = useState("personal");

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

  const handleSave = () => {
    // TODO: Implement save to Convex
    console.log("Saving portfolio data:", portfolio);
  };

  const handlePersonalChange = (field: string, value: string) => {
    setPortfolio(prev => ({
      ...prev,
      personal: {
        ...prev.personal,
        [field]: value
      }
    }));
  };

  const handleAboutChange = (locale: string, value: string) => {
    setPortfolio(prev => ({
      ...prev,
      about: {
        ...prev.about,
        [locale]: value
      }
    }));
  };

  return (
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
                    <BreadcrumbLink href="/admin">
                      Admin
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Portfolio Editor</BreadcrumbPage>
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
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-3xl font-bold">Portfolio Editor</h1>
                    <p className="text-muted-foreground">
                      Edit your portfolio content and information
                    </p>
                  </div>
                  <Button onClick={handleSave} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="personal" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Personal
                    </TabsTrigger>
                    <TabsTrigger value="about" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      About
                    </TabsTrigger>
                    <TabsTrigger value="experience" className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Experience
                    </TabsTrigger>
                    <TabsTrigger value="projects" className="flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      Projects
                    </TabsTrigger>
                    <TabsTrigger value="skills" className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Skills
                    </TabsTrigger>
                  </TabsList>

                  {/* Personal Information Tab */}
                  <TabsContent value="personal" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>
                          Update your personal details and contact information
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                              id="name"
                              value={portfolio.personal.name}
                              onChange={(e) => handlePersonalChange("name", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="title">Job Title</Label>
                            <Input
                              id="title"
                              value={portfolio.personal.title}
                              onChange={(e) => handlePersonalChange("title", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={portfolio.personal.email}
                              onChange={(e) => handlePersonalChange("email", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                              id="phone"
                              value={portfolio.personal.phone}
                              onChange={(e) => handlePersonalChange("phone", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                              id="address"
                              value={portfolio.personal.address}
                              onChange={(e) => handlePersonalChange("address", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="website">Website</Label>
                            <Input
                              id="website"
                              value={portfolio.personal.website}
                              onChange={(e) => handlePersonalChange("website", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="linkedin">LinkedIn</Label>
                            <Input
                              id="linkedin"
                              value={portfolio.personal.linkedin}
                              onChange={(e) => handlePersonalChange("linkedin", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="github">GitHub</Label>
                            <Input
                              id="github"
                              value={portfolio.personal.github}
                              onChange={(e) => handlePersonalChange("github", e.target.value)}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* About Tab */}
                  <TabsContent value="about" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>About Section</CardTitle>
                        <CardDescription>
                          Update your professional summary in multiple languages
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="about-en">English Description</Label>
                          <Textarea
                            id="about-en"
                            value={portfolio.about.en}
                            onChange={(e) => handleAboutChange("en", e.target.value)}
                            rows={4}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="about-fr">French Description</Label>
                          <Textarea
                            id="about-fr"
                            value={portfolio.about.fr}
                            onChange={(e) => handleAboutChange("fr", e.target.value)}
                            rows={4}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Experience Tab */}
                  <TabsContent value="experience" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Work Experience</CardTitle>
                        <CardDescription>
                          Manage your work experience entries
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {portfolio.experience.map((exp, index) => (
                            <div key={index} className="border rounded-lg p-4 space-y-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-semibold">{exp.title}</h3>
                                  <p className="text-sm text-muted-foreground">{exp.company} • {exp.period}</p>
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-sm">{exp.description.en}</p>
                            </div>
                          ))}
                          <Button variant="outline" className="w-full">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Experience
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Projects Tab */}
                  <TabsContent value="projects" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Projects</CardTitle>
                        <CardDescription>
                          Manage your project portfolio
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {portfolio.projects.map((project, index) => (
                            <div key={index} className="border rounded-lg p-4 space-y-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-semibold">{project.name}</h3>
                                  <p className="text-sm text-muted-foreground">{project.description.en}</p>
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {project.tech.map((tech, techIndex) => (
                                      <Badge key={techIndex} variant="secondary" className="text-xs">
                                        {tech}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                          <Button variant="outline" className="w-full">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Project
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Skills Tab */}
                  <TabsContent value="skills" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Skills & Technologies</CardTitle>
                        <CardDescription>
                          Organize your technical skills by category
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {Object.entries(portfolio.skills).map(([category, skills]) => (
                            <div key={category} className="space-y-2">
                              <Label className="text-sm font-medium capitalize">
                                {category.replace(/([A-Z])/g, ' $1').trim()}
                              </Label>
                              <div className="flex flex-wrap gap-2">
                                {skills.map((skill, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
