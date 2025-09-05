# 🚀 AI-Powered Portfolio Blog System

## Automated Blog Generation with Gemini AI & Nano Banana 🍌

A cutting-edge portfolio website with **fully automated blog generation** using Google's Gemini AI for content and **Nano Banana (Gemini 2.5 Flash Image)** for AI-generated featured images.

### ✨ **Key Features**

- 🤖 **Automated Content Generation** - Daily blog posts using Gemini 1.5 Pro
- 🍌 **AI Image Generation** - Custom featured images with Nano Banana
- 🌍 **Bilingual Support** - English/French content and images
- 📊 **SEO Optimization** - AI-powered keywords, meta descriptions, alt text
- 📈 **Analytics Tracking** - Performance monitoring and engagement metrics
- ⚡ **Edge Performance** - Prisma Accelerate for global speed
- 📱 **Responsive Design** - Modern UI with Tailwind CSS
- 🎯 **Lead Generation** - Contact forms and service inquiries

---

## 🚀 **Quick Start**

### **1. One-Command Setup**
```bash
# Clone and setup everything automatically
git clone <your-repo>
cd prosper-portfolio
npm run setup
```

### **2. Configure Environment**
```bash
# Edit .env file with your API keys
cp .env.example .env
# Add your Gemini API key and database URL
```

### **3. Start Development**
```bash
npm run dev
# Open http://localhost:3000
```

---

## 🛠️ **Tech Stack**

### **Frontend**
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Shadcn/ui** - Modern component library
- **Framer Motion** - Smooth animations

### **Backend & Database**
- **Prisma** - Type-safe database ORM
- **PostgreSQL** - Robust relational database
- **Prisma Accelerate** - Global edge caching

### **AI & Automation**
- **Gemini 1.5 Pro** - Content generation
- **Nano Banana** - AI image generation (Gemini 2.5 Flash Image)
- **Smart Fallbacks** - DALL-E 3, Stability AI
- **SEO AI** - Automated optimization

---

## 🤖 **AI Features**

### **Content Generation**
```typescript
// Automated blog post generation
const config = {
  topic: 'React Performance Optimization',
  targetAudience: 'developers',
  contentType: 'tutorial',
  technicalLevel: 'intermediate',
  includeCode: true,
  wordCount: 1500,
  generateImage: true,        // ← Nano Banana magic
  imageStyle: 'professional',
  imageAspectRatio: '16:9'
}
```

### **Image Generation Pipeline**
1. **Smart Prompt Creation** - AI analyzes content and generates optimized image prompts
2. **Nano Banana Generation** - Gemini 2.5 Flash Image creates custom visuals
3. **Fallback System** - DALL-E 3 → Stability AI → Placeholder
4. **SEO Optimization** - AI-generated alt text and captions in both languages
5. **Metadata Tracking** - Complete generation history and performance metrics

---

## 📊 **Database Schema**

### **Core Tables**
- **blog_posts** - Bilingual content with AI metadata
- **blog_images** - AI-generated images with full metadata
- **blog_analytics** - Performance tracking and engagement
- **generation_queue** - Automated content scheduling
- **seo_metrics** - Keyword performance tracking

### **AI Integration**
- **Generation Config** - AI model settings and preferences
- **Prompt History** - Complete prompt and response tracking
- **Quality Metrics** - Content and image quality scoring
- **Performance Data** - Generation speed and success rates

---

## 🎯 **API Endpoints**

### **Blog Generation**
```bash
# Generate blog post with image
POST /api/blog/generate
{
  "topic": "Modern React Patterns",
  "generateImage": true,
  "imageStyle": "professional"
}

# Get topic suggestions
GET /api/blog/generate/topics?category=web-development

# Generate SEO keywords
POST /api/blog/keywords
{
  "topic": "React Performance",
  "count": 20
}
```

### **Image Generation**
```bash
# Generate image for existing post
POST /api/images/generate
{
  "blogTitle": "React Hooks Guide",
  "blogContent": "Content preview...",
  "style": "modern",
  "aspectRatio": "16:9"
}
```

---

## 📈 **Performance Features**

### **Caching Strategy**
- **Blog Posts**: 5-10 minutes cache
- **Images**: Permanent storage with CDN
- **Analytics**: 5 minutes cache
- **Search Results**: 3 minutes cache

### **Edge Optimization**
- **Prisma Accelerate** - Global database caching
- **Image CDN** - Optimized image delivery
- **Static Generation** - Pre-rendered pages
- **Smart Prefetching** - Predictive content loading

---

## 🔧 **Development Commands**

```bash
# Setup and Development
npm run setup          # Complete project setup
npm run dev            # Start development server
npm run build          # Build for production
npm run start          # Start production server

# Database Operations
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema to database
npm run db:migrate     # Create and run migrations
npm run db:studio      # Open Prisma Studio
npm run db:seed        # Seed with sample data

# AI Testing
npm run test:ai        # Test AI generation
npm run test:images    # Test image generation
```

---

## 🌍 **Deployment**

### **Vercel (Recommended)**
```bash
# Deploy to Vercel
vercel --prod

# Environment variables needed:
# - DATABASE_URL
# - DIRECT_URL
# - GEMINI_API_KEY
# - OPENAI_API_KEY (optional)
```

### **Other Platforms**
- **Railway** - Easy PostgreSQL + app deployment
- **Netlify** - Static site with serverless functions
- **Docker** - Containerized deployment

---

## 📚 **Documentation**

- 📖 [Database Setup Guide](docs/DATABASE_SETUP.md)
- 🤖 [AI Blog Vision](docs/AI_BLOG_VISION.md)
- 🍌 [Nano Banana Setup](docs/NANO_BANANA_SETUP.md)
- 🎨 [Portfolio Features](docs/PORTFOLIO_ENHANCEMENT_FEATURES.md)

---

## 🎯 **Business Impact**

### **Content Marketing**
- **90% Time Reduction** - Automated content creation
- **Daily Publishing** - Consistent, high-quality posts
- **SEO Growth** - AI-optimized content for better rankings
- **Lead Generation** - Strategic CTAs and contact forms

### **Technical Showcase**
- **AI Integration** - Demonstrate cutting-edge AI skills
- **Modern Stack** - Latest Next.js, TypeScript, Prisma
- **Performance** - Edge-optimized, globally fast
- **Scalability** - Built for growth and automation

---

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 **Acknowledgments**

- **Google AI** - For Gemini and Nano Banana APIs
- **Vercel** - For Next.js and deployment platform
- **Prisma** - For excellent database tooling
- **Shadcn** - For beautiful UI components

---

**🚀 Built with ❤️ by Prosper Merimee - Full Stack Developer**

*Showcasing the future of automated content creation with AI*
