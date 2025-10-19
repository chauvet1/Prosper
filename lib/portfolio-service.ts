import { withCache, CACHE_KEYS, CACHE_TTL, invalidatePortfolioCache } from './cache'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '../convex/_generated/api'

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export class PortfolioService {
  // Personal Info
  static async getPersonalInfo() {
    return withCache(
      CACHE_KEYS.PORTFOLIO_PERSONAL,
      async () => {
        try {
          const personalInfo = await convex.query(api.portfolio.getPersonalInfo, {})
          return personalInfo
        } catch (error) {
          console.error('Error fetching personal info:', error)
          return null
        }
      },
      CACHE_TTL.PORTFOLIO_DATA
    )
  }

  static async updatePersonalInfo(data: any) {
    try {
      const result = await convex.mutation(api.portfolio.updatePersonalInfo, data)

      // Invalidate cache after update
      invalidatePortfolioCache()

      return result
    } catch (error) {
      console.error('Error updating personal info:', error)
      throw error
    }
  }

  // Skills
  static async getSkills(category?: string) {
    try {
      const skills = await convex.query(api.portfolio.getSkills, { category })
      return skills
    } catch (error) {
      console.error('Error fetching skills:', error)
      return []
    }
  }

  static async getSkillsByCategory() {
    try {
      const skills = await convex.query(api.portfolio.getSkillsByCategory, {})
      return skills
    } catch (error) {
      console.error('Error fetching skills by category:', error)
      return {}
    }
  }

  // Experience
  static async getExperiences() {
    try {
      const experiences = await convex.query(api.portfolio.getExperiences, {})
      return experiences
    } catch (error) {
      console.error('Error fetching experiences:', error)
      return []
    }
  }

  // Projects
  static async getProjects(featured?: boolean) {
    try {
      const projects = await convex.query(api.portfolio.getProjects, { featured })
      return projects
    } catch (error) {
      console.error('Error fetching projects:', error)
      return []
    }
  }

  static async getProjectBySlug(slug: string) {
    try {
      const project = await convex.query(api.portfolio.getProjectBySlug, { slug })
      return project
    } catch (error) {
      console.error('Error fetching project by slug:', error)
      return null
    }
  }

  // Education
  static async getEducation() {
    try {
      const education = await convex.query(api.portfolio.getEducation, {})
      return education
    } catch (error) {
      console.error('Error fetching education:', error)
      return []
    }
  }

  // Certificates
  static async getCertificates() {
    try {
      const certificates = await convex.query(api.portfolio.getCertificates, {})
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
      const analytics = await convex.query(api.portfolio.getPortfolioAnalytics, {})
      return analytics
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
