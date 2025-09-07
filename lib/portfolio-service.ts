import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class PortfolioService {
  // Personal Info
  static async getPersonalInfo() {
    try {
      const personalInfo = await prisma.personalInfo.findFirst({
        where: { active: true },
        orderBy: { updatedAt: 'desc' }
      })
      return personalInfo
    } catch (error) {
      console.error('Error fetching personal info:', error)
      return null
    }
  }

  static async updatePersonalInfo(data: any) {
    try {
      const existing = await prisma.personalInfo.findFirst({
        where: { active: true }
      })

      if (existing) {
        return await prisma.personalInfo.update({
          where: { id: existing.id },
          data: {
            ...data,
            updatedAt: new Date()
          }
        })
      } else {
        return await prisma.personalInfo.create({
          data: {
            ...data,
            active: true
          }
        })
      }
    } catch (error) {
      console.error('Error updating personal info:', error)
      throw error
    }
  }

  // Skills
  static async getSkills(category?: string) {
    try {
      const where: any = { active: true }
      if (category) {
        where.category = category
      }

      const skills = await prisma.skill.findMany({
        where,
        orderBy: [
          { featured: 'desc' },
          { sortOrder: 'asc' },
          { name: 'asc' }
        ]
      })
      return skills
    } catch (error) {
      console.error('Error fetching skills:', error)
      return []
    }
  }

  static async getSkillsByCategory() {
    try {
      const skills = await prisma.skill.findMany({
        where: { active: true },
        orderBy: [
          { category: 'asc' },
          { featured: 'desc' },
          { sortOrder: 'asc' }
        ]
      })

      // Group by category
      const grouped = skills.reduce((acc, skill) => {
        const category = skill.category
        if (!acc[category]) {
          acc[category] = []
        }
        acc[category].push(skill)
        return acc
      }, {} as Record<string, typeof skills>)

      return grouped
    } catch (error) {
      console.error('Error fetching skills by category:', error)
      return {}
    }
  }

  // Experience
  static async getExperiences() {
    try {
      const experiences = await prisma.experience.findMany({
        where: { active: true },
        orderBy: [
          { current: 'desc' },
          { startDate: 'desc' }
        ]
      })
      return experiences
    } catch (error) {
      console.error('Error fetching experiences:', error)
      return []
    }
  }

  // Projects
  static async getProjects(featured?: boolean) {
    try {
      const where: any = { active: true }
      if (featured !== undefined) {
        where.featured = featured
      }

      const projects = await prisma.project.findMany({
        where,
        orderBy: [
          { featured: 'desc' },
          { sortOrder: 'asc' },
          { createdAt: 'desc' }
        ]
      })
      return projects
    } catch (error) {
      console.error('Error fetching projects:', error)
      return []
    }
  }

  static async getProjectBySlug(slug: string) {
    try {
      const project = await prisma.project.findUnique({
        where: { slug, active: true }
      })

      if (project) {
        // Increment view count
        await prisma.project.update({
          where: { id: project.id },
          data: { viewCount: { increment: 1 } }
        })
      }

      return project
    } catch (error) {
      console.error('Error fetching project by slug:', error)
      return null
    }
  }

  // Education
  static async getEducation() {
    try {
      const education = await prisma.education.findMany({
        where: { active: true },
        orderBy: [
          { current: 'desc' },
          { startDate: 'desc' }
        ]
      })
      return education
    } catch (error) {
      console.error('Error fetching education:', error)
      return []
    }
  }

  // Certificates
  static async getCertificates() {
    try {
      const certificates = await prisma.certificate.findMany({
        where: { active: true },
        orderBy: [
          { featured: 'desc' },
          { issueDate: 'desc' }
        ]
      })
      return certificates
    } catch (error) {
      console.error('Error fetching certificates:', error)
      return []
    }
  }

  // Complete portfolio data
  static async getCompletePortfolio() {
    try {
      const [
        personalInfo,
        skills,
        experiences,
        projects,
        education,
        certificates
      ] = await Promise.all([
        this.getPersonalInfo(),
        this.getSkillsByCategory(),
        this.getExperiences(),
        this.getProjects(),
        this.getEducation(),
        this.getCertificates()
      ])

      return {
        personal: personalInfo,
        skills,
        experiences,
        projects,
        education,
        certificates
      }
    } catch (error) {
      console.error('Error fetching complete portfolio:', error)
      throw error
    }
  }

  // Analytics
  static async getPortfolioAnalytics() {
    try {
      const [
        totalProjects,
        featuredProjects,
        totalViews,
        totalSkills,
        activeExperiences
      ] = await Promise.all([
        prisma.project.count({ where: { active: true } }),
        prisma.project.count({ where: { active: true, featured: true } }),
        prisma.project.aggregate({
          where: { active: true },
          _sum: { viewCount: true }
        }),
        prisma.skill.count({ where: { active: true } }),
        prisma.experience.count({ where: { active: true } })
      ])

      return {
        totalProjects,
        featuredProjects,
        totalViews: totalViews._sum.viewCount || 0,
        totalSkills,
        activeExperiences
      }
    } catch (error) {
      console.error('Error fetching portfolio analytics:', error)
      return {
        totalProjects: 0,
        featuredProjects: 0,
        totalViews: 0,
        totalSkills: 0,
        activeExperiences: 0
      }
    }
  }
}

export default PortfolioService
