import { portfolioData } from "@/lib/portfolio-data"

export function StructuredData() {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": portfolioData.personal.name,
    "jobTitle": portfolioData.personal.title,
    "email": portfolioData.personal.email,
    "telephone": portfolioData.personal.phone,
    "url": portfolioData.personal.website,
    "sameAs": [
      portfolioData.personal.linkedin,
      portfolioData.personal.website
    ],
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Yaoundé",
      "addressCountry": "Cameroon"
    },
    "knowsAbout": portfolioData.skills.languages,
    "alumniOf": {
      "@type": "EducationalOrganization",
      "name": portfolioData.education.school
    }
  }

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Pepis Pro",
    "founder": {
      "@type": "Person",
      "name": portfolioData.personal.name
    },
    "url": portfolioData.personal.website,
    "sameAs": [
      portfolioData.personal.linkedin
    ]
  }

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Prosper Merimee Portfolio",
    "url": portfolioData.personal.website,
    "author": {
      "@type": "Person",
      "name": portfolioData.personal.name
    },
    "description": "Full Stack Developer portfolio showcasing modern web development projects and expertise"
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema)
        }}
      />
    </>
  )
}
