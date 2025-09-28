export const portfolioData = {
  personal: {
    name: "Mouil Prosper",
    title: "Full-Stack Engineer",
    phone: "+237 691-958-707",
    email: "xsmafred@gmail.com",
    address: "Yaoundé, Cameroon",
    website: "https://pepis.world",
    linkedin: "https://linkedin.com/in/prosper-merimee",
    github: "https://github.com/Menendezpolo5",
    avatar: "/profile-image.jpg"
  },
  
  about: {
    en: "4+ years building secure, cloud-native SaaS. Cut PostgreSQL latency 40% for 3M-row dataset; built crypto gateway ($2M monthly, <0.2% fraud); lead 4-engineer Agile squad. Stack: Java 17, Spring Boot, Angular, React, TypeScript, AWS, GCP, Docker, CI/CD.",
    fr: "Plus de 4 ans à construire des SaaS sécurisés et cloud-native. Réduit la latence PostgreSQL de 40% pour un dataset de 3M lignes; construit une passerelle crypto (2M$ mensuel, <0.2% fraude); dirige une équipe Agile de 4 ingénieurs. Stack: Java 17, Spring Boot, Angular, React, TypeScript, AWS, GCP, Docker, CI/CD."
  },

  skills: {
    languages: ["Java", "TypeScript", "JavaScript", "Python", "PHP"],
    frameworks: ["Spring Boot", "Hibernate", "Angular", "React", "Next.js", "Node.js", "Laravel"],
    cloud: ["AWS", "GCP", "Docker", "Vercel", "Coolify", "GitHub Actions", "Terraform"],
    databases: ["PostgreSQL", "MySQL", "MongoDB", "Supabase"],
    protocols: ["REST", "JSON", "JWT", "OAuth2", "WebSocket", "gRPC", "GraphQL"],
    security: ["OWASP Top-10", "SSL/TLS", "Network Hardening", "Anti-fraud ML"],
    methodologies: ["Agile", "Scrum", "CI/CD"],
    ai: ["OpenAI API", "Deepseek", "Mistral AI", "Machine Learning", "AI Integration", "Automation"],
    soft: ["Strategic Thinking", "Analytical Problem Solving", "Team Collaboration", "Bilingual Communication"]
  },

  experience: [
    {
      title: "Full-Stack Developer",
      company: "Stevo Digital",
      period: "2023 – 2025",
      description: {
        en: "Shipped 5 major features per 6-week sprint (Spring Boot + Angular/React). Reduced deployment time 35% by moving GCP workloads to Coolify CI/CD. Built REST micro-services serving 1M+ monthly calls at 99.9% uptime. Boosted user-engagement 18% via Hotjar-driven UI/UX iterations.",
        fr: "Livré 5 fonctionnalités majeures par sprint de 6 semaines (Spring Boot + Angular/React). Réduit le temps de déploiement de 35% en déplaçant les charges de travail GCP vers Coolify CI/CD. Construit des micro-services REST servant 1M+ appels mensuels avec 99.9% de disponibilité. Augmenté l'engagement utilisateur de 18% via des itérations UI/UX basées sur Hotjar."
      }
    },
    {
      title: "Software Engineer & IT Support",
      company: "Micro QQ Tech",
      period: "2022 – 2023",
      description: {
        en: "Designed Laravel CMS for maternity records; accelerated data retrieval 40%. Administered Ubuntu VPS & PostgreSQL; zero security incidents. Mentored 4 junior devs on Git flow, code reviews, unit testing. Rolled out campus-wide upgrades for 75+ workstations.",
        fr: "Conçu un CMS Laravel pour les dossiers de maternité; accéléré la récupération de données de 40%. Administré VPS Ubuntu & PostgreSQL; zéro incident de sécurité. Mentoré 4 développeurs juniors sur Git flow, revues de code, tests unitaires. Déployé des mises à niveau à l'échelle du campus pour 75+ postes de travail."
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
      name: "Tasky",
      description: {
        en: "Multi-tenant task manager with Dockerized containers deployed to VPS with auto-SSL",
        fr: "Gestionnaire de tâches multi-tenant avec conteneurs Docker déployés sur VPS avec SSL automatique"
      },
      tech: ["Java", "Spring Boot", "Angular", "JWT", "Docker", "GitHub Actions", "VPS"],
      status: "Completed",
      github: "https://github.com/yourhandle/tasky"
    },
    {
      name: "Prellia",
      description: {
        en: "Crypto payment gateway processing BTC, ETH, USDT; integrated 3 exchanges; fraud rate < 0.2%",
        fr: "Passerelle de paiement crypto traitant BTC, ETH, USDT; intégrée à 3 exchanges; taux de fraude < 0.2%"
      },
      tech: ["Node.js", "TypeScript", "PostgreSQL", "AWS Lambda", "Anti-fraud ML"],
      status: "Completed"
    },
    {
      name: "AI Social Media Manager",
      description: {
        en: "Auto-generates and schedules posts; reduces content-team workload 60%",
        fr: "Génère et planifie automatiquement les posts; réduit la charge de travail de l'équipe de contenu de 60%"
      },
      tech: ["Python", "Node.js", "React", "OpenAI API", "Deepseek", "Mistral AI", "Cron", "Docker"],
      status: "Completed"
    },
    {
      name: "Bahinlink",
      description: {
        en: "Security-management platform managing security operations, agent tracking, and client communications",
        fr: "Plateforme de gestion de sécurité gérant les opérations de sécurité, le suivi des agents et les communications clients"
      },
      tech: ["Next.js", "TypeScript", "Supabase"],
      status: "Completed"
    },
    {
      name: "M0DE",
      description: {
        en: "AI-curated shopping with conversational storefront + fully automated backend",
        fr: "Shopping organisé par IA avec vitrine conversationnelle + backend entièrement automatisé"
      },
      tech: ["AI/ML", "Conversational AI", "Backend Automation"],
      status: "In Development"
    }
  ],

  education: {
    degree: "Higher National Diploma (HND) in Software Engineering",
    school: "University Institute of Science and Technology, Yaoundé (IUSTY)",
    period: "2020 – 2022"
  },

  certificates: [
    "Google Cloud Fundamentals",
    "AWS Cloud Practitioner"
  ],

  languages: ["English: Fluent", "French: Fluent"]
};

export type PortfolioData = typeof portfolioData;
