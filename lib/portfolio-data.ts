export const portfolioData = {
  personal: {
    name: "Mouil Moudon Prosper Merimee",
    title: "Full Stack Developer",
    phone: "+237 691-958-707",
    email: "xsmafred@gmail.com",
    address: "Total Messasi., Yaoundé, Cameroon",
    website: "https://pepis.pro/",
    linkedin: "https://www.linkedin.com/in/mouil-prosper",
    avatar: "/profile-image.jpg"
  },
  
  about: {
    en: "A problem-solving developer with a knack for turning complex ideas into scalable, secure web applications. Over 4 years of hands-on experience with JavaScript (React.js, Next.js, Node.js), PHP. I thrive in agile environments where clean code and teamwork drive results. When I'm not debugging or optimizing APIs, I'm mentoring peers or exploring new ways to integrate AI into backend systems.",
    fr: "Développeur passionné, j'ai le don de transformer des idées complexes en applications web évolutives et sécurisées. Fort de plus de 4 ans d'expérience pratique en JavaScript (React.js, Next.js, Node.js), PHP. Je m'épanouis dans les environnements agiles où code propre et travail d'équipe sont gages de résultats. Lorsque je ne suis pas occupé à déboguer ou à optimiser des API, j'accompagne mes pairs ou j'explore de nouvelles façons d'intégrer l'IA aux systèmes back-end."
  },

  skills: {
    languages: ["JavaScript", "React.js", "Next.js", "Node.js", "PHP", "Java", "SQL", "HTML/CSS"],
    cloud: ["Google Cloud", "AWS", "Vercel", "Coolify", "VPS Management"],
    tools: ["Git", "VS Code", "Cursor", "Postman", "Excel", "Word"],
    networking: ["LAN/WAN Setup", "System Administration", "Network Security"],
    methodologies: ["Agile", "Scrum", "CI/CD"],
    soft: ["Strategic Thinking", "Analytical Problem Solving", "Team Collaboration", "Bilingual Communication"]
  },

  experience: [
    {
      title: "Founder & Lead Developer",
      company: "Pepis Pro",
      period: "2024 – Present",
      description: {
        en: "SaaS startup offering custom-built software projects and development services. Leads project architecture, team collaboration, and client interaction from planning to deployment.",
        fr: "Startup SaaS proposant des projets logiciels sur mesure et des services de développement. Dirige l'architecture du projet, la collaboration en équipe et l'interaction avec le client, de la planification au déploiement."
      }
    },
    {
      title: "Creator & Lead Engineer",
      company: "Pepis Dev",
      period: "Under Development",
      description: {
        en: "AI-powered full-stack app builder and deep research platform enabling rapid development and intelligent code generation.",
        fr: "Générateur d'applications full-stack alimenté par l'IA et plateforme de recherche permettant un développement rapide et une génération de code intelligente."
      }
    },
    {
      title: "Full-Stack Developer",
      company: "Freelance",
      period: "2022 – Present",
      description: {
        en: "Various projects including Prellia.com cryptocurrency gateway, e-commerce platforms, AI social media management tools, and Linux server deployment.",
        fr: "Divers projets incluant la passerelle crypto Prellia.com, plateformes e-commerce, outils de gestion IA des médias sociaux, et déploiement de serveurs Linux."
      }
    }
  ],

  projects: [
    {
      name: "Prellia.com",
      description: {
        en: "Secure cryptocurrency gateway with advanced payment processing",
        fr: "Passerelle de crypto-monnaie sécurisée avec traitement de paiement avancé"
      },
      tech: ["React.js", "Node.js", "Blockchain", "Security"],
      status: "Completed"
    },
    {
      name: "Pepis Dev",
      description: {
        en: "AI-powered full-stack application builder",
        fr: "Générateur d'applications full-stack alimenté par l'IA"
      },
      tech: ["Next.js", "AI/ML", "Node.js", "Database"],
      status: "In Development"
    },
    {
      name: "E-commerce Platform",
      description: {
        en: "Custom online payment processor with advanced features",
        fr: "Processeur de paiement en ligne personnalisé avec fonctionnalités avancées"
      },
      tech: ["PHP", "JavaScript", "Payment APIs", "Security"],
      status: "Completed"
    }
  ],

  education: {
    degree: "Higher National Diploma (HND) in Software Engineering",
    school: "University Institute of Science and Technology, Yaoundé (IUSTY)",
    period: "2020 – 2022"
  },

  certificates: [
    "Google Cloud Fundamentals",
    "AWS Cloud Practitioner (In Progress)",
    "Networking & Cybersecurity Essentials"
  ],

  languages: ["English: Fluent", "French: Fluent"]
};

export type PortfolioData = typeof portfolioData;
