import { PrismaClient } from '@prisma/client'
import { portfolioData } from '../lib/portfolio-data'

const prisma = new PrismaClient()

async function seedPortfolio() {
  console.log('🌱 Seeding portfolio data...')

  try {
    // Seed Personal Info
    console.log('📝 Seeding personal info...')
    await prisma.personalInfo.upsert({
      where: { email: portfolioData.personal.email },
      update: {
        name: portfolioData.personal.name,
        title: portfolioData.personal.title,
        phone: portfolioData.personal.phone,
        address: portfolioData.personal.address,
        website: portfolioData.personal.website,
        linkedin: portfolioData.personal.linkedin,
        avatar: portfolioData.personal.avatar,
        aboutEn: portfolioData.about.en,
        aboutFr: portfolioData.about.fr,
        active: true
      },
      create: {
        name: portfolioData.personal.name,
        title: portfolioData.personal.title,
        email: portfolioData.personal.email,
        phone: portfolioData.personal.phone,
        address: portfolioData.personal.address,
        website: portfolioData.personal.website,
        linkedin: portfolioData.personal.linkedin,
        avatar: portfolioData.personal.avatar,
        aboutEn: portfolioData.about.en,
        aboutFr: portfolioData.about.fr,
        active: true
      }
    })

    // Seed Skills
    console.log('🛠️ Seeding skills...')
    const skillCategories = {
      languages: 'LANGUAGE',
      cloud: 'CLOUD',
      tools: 'TOOL',
      networking: 'NETWORKING',
      methodologies: 'METHODOLOGY',
      soft: 'SOFT_SKILL'
    }

    for (const [category, skills] of Object.entries(portfolioData.skills)) {
      const categoryEnum = skillCategories[category as keyof typeof skillCategories]
      if (!categoryEnum) continue

      for (let i = 0; i < skills.length; i++) {
        const skill = skills[i]

        const existingSkill = await prisma.skill.findUnique({
          where: { name: skill }
        })

        if (existingSkill) {
          await prisma.skill.update({
            where: { id: existingSkill.id },
            data: {
              category: categoryEnum as any,
              level: 'ADVANCED',
              featured: i < 3, // First 3 skills in each category are featured
              sortOrder: i,
              active: true
            }
          })
        } else {
          await prisma.skill.create({
            data: {
              name: skill,
              category: categoryEnum as any,
              level: 'ADVANCED',
              featured: i < 3,
              sortOrder: i,
              active: true
            }
          })
        }
      }
    }

    // Seed Experience
    console.log('💼 Seeding experience...')
    for (let i = 0; i < portfolioData.experience.length; i++) {
      const exp = portfolioData.experience[i]
      const startDate = new Date(exp.period.split(' – ')[0] + '-01-01')
      const endDate = exp.period.includes('Present') ? null : new Date(exp.period.split(' – ')[1] + '-12-31')
      
      const experienceId = exp.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + exp.company.toLowerCase().replace(/[^a-z0-9]+/g, '-')

      const existingExp = await prisma.experience.findFirst({
        where: { title: exp.title, company: exp.company }
      })

      if (existingExp) {
        await prisma.experience.update({
          where: { id: existingExp.id },
          data: {
            title: exp.title,
            company: exp.company,
            startDate,
            endDate,
            current: exp.period.includes('Present'),
            descriptionEn: exp.description.en,
            descriptionFr: exp.description.fr,
            technologies: [], // Will be populated later
            achievements: [],
            featured: i === 0, // First experience is featured
            sortOrder: i,
            active: true
          }
        })
      } else {
        await prisma.experience.create({
          data: {
            title: exp.title,
            company: exp.company,
            startDate,
            endDate,
            current: exp.period.includes('Present'),
            descriptionEn: exp.description.en,
            descriptionFr: exp.description.fr,
            technologies: [],
            achievements: [],
            featured: i === 0,
            sortOrder: i,
            active: true
          }
        })
      }
    }

    // Seed Projects
    console.log('🚀 Seeding projects...')
    for (let i = 0; i < portfolioData.projects.length; i++) {
      const project = portfolioData.projects[i]
      const slug = project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      
      await prisma.project.upsert({
        where: { slug },
        update: {
          titleEn: project.name,
          titleFr: project.name,
          descriptionEn: project.description.en,
          descriptionFr: project.description.fr,
          shortDescEn: project.description.en.substring(0, 150) + '...',
          shortDescFr: project.description.fr.substring(0, 150) + '...',
          technologies: project.tech,
          category: 'web',
          status: project.status === 'Completed' ? 'COMPLETED' : 'IN_PROGRESS',
          featured: i < 3, // First 3 projects are featured
          startDate: new Date('2023-01-01'),
          endDate: project.status === 'Completed' ? new Date('2024-01-01') : null,
          sortOrder: i,
          active: true
        },
        create: {
          slug,
          titleEn: project.name,
          titleFr: project.name,
          descriptionEn: project.description.en,
          descriptionFr: project.description.fr,
          shortDescEn: project.description.en.substring(0, 150) + '...',
          shortDescFr: project.description.fr.substring(0, 150) + '...',
          technologies: project.tech,
          category: 'web',
          status: project.status === 'Completed' ? 'COMPLETED' : 'IN_PROGRESS',
          featured: i < 3,
          startDate: new Date('2023-01-01'),
          endDate: project.status === 'Completed' ? new Date('2024-01-01') : null,
          sortOrder: i,
          active: true
        }
      })
    }

    // Seed Education
    console.log('🎓 Seeding education...')
    const existingEducation = await prisma.education.findFirst({
      where: { degree: portfolioData.education.degree, school: portfolioData.education.school }
    })

    if (existingEducation) {
      await prisma.education.update({
        where: { id: existingEducation.id },
        data: {
          degree: portfolioData.education.degree,
          field: 'Software Engineering',
          school: portfolioData.education.school,
          location: 'Yaoundé, Cameroon',
          startDate: new Date('2020-01-01'),
          endDate: new Date('2022-12-31'),
          current: false,
          descriptionEn: 'Comprehensive program covering software development, system design, and project management.',
          descriptionFr: 'Programme complet couvrant le développement logiciel, la conception de systèmes et la gestion de projet.',
          achievements: ['Graduated with Distinction', 'Best Final Year Project'],
          featured: true,
          sortOrder: 0,
          active: true
        }
      })
    } else {
      await prisma.education.create({
        data: {
          degree: portfolioData.education.degree,
          field: 'Software Engineering',
          school: portfolioData.education.school,
          location: 'Yaoundé, Cameroon',
          startDate: new Date('2020-01-01'),
          endDate: new Date('2022-12-31'),
          current: false,
          descriptionEn: 'Comprehensive program covering software development, system design, and project management.',
          descriptionFr: 'Programme complet couvrant le développement logiciel, la conception de systèmes et la gestion de projet.',
          achievements: ['Graduated with Distinction', 'Best Final Year Project'],
          featured: true,
          sortOrder: 0,
          active: true
        }
      })
    }

    // Seed Certificates
    console.log('🏆 Seeding certificates...')
    for (let i = 0; i < portfolioData.certificates.length; i++) {
      const cert = portfolioData.certificates[i]
      const issuer = cert.includes('Google') ? 'Google Cloud' :
                   cert.includes('AWS') ? 'Amazon Web Services' :
                   cert.includes('Networking') ? 'Cisco' : 'Professional Institute'

      const existingCert = await prisma.certificate.findFirst({
        where: { name: cert }
      })

      if (existingCert) {
        await prisma.certificate.update({
          where: { id: existingCert.id },
          data: {
            name: cert,
            issuer,
            issueDate: new Date('2023-01-01'),
            description: `Professional certification in ${cert}`,
            skills: cert.includes('Cloud') ? ['Cloud Computing', 'Infrastructure'] :
                   cert.includes('Networking') ? ['Networking', 'Security'] : ['General'],
            featured: i === 0,
            verified: true,
            sortOrder: i,
            active: true
          }
        })
      } else {
        await prisma.certificate.create({
          data: {
            name: cert,
            issuer,
            issueDate: new Date('2023-01-01'),
            description: `Professional certification in ${cert}`,
            skills: cert.includes('Cloud') ? ['Cloud Computing', 'Infrastructure'] :
                   cert.includes('Networking') ? ['Networking', 'Security'] : ['General'],
            featured: i === 0,
            verified: true,
            sortOrder: i,
            active: true
          }
        })
      }
    }

    console.log('✅ Portfolio data seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding portfolio data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  seedPortfolio()
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export default seedPortfolio
