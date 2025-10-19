# Prosper - AI-Powered Portfolio & Blog Platform

A modern, full-stack portfolio and blog platform built with Next.js, Convex, and AI integration.

## 🚀 Features

- **Real-time Portfolio Management** - Dynamic portfolio with projects, skills, and experience
- **AI-Powered Blog Generation** - Automated content creation using Gemini AI
- **Image Generation** - AI-generated images using DALL-E integration
- **Lead Management** - Complete CRM system for client inquiries
- **Appointment Scheduling** - Calendar booking system
- **Analytics & SEO** - Comprehensive tracking and optimization
- **Multi-language Support** - English and French content
- **Real-time Updates** - Live data synchronization with Convex

## 🏗️ Architecture

- **Frontend**: Next.js 15 with React 19
- **Backend**: Convex (real-time database and functions)
- **AI Integration**: Google Gemini, DALL-E
- **Styling**: Tailwind CSS with Radix UI components
- **Deployment**: Vercel with Convex Cloud

## 📋 Real Data Policy

This project enforces a strict **Real Data Only** policy. All implementations must use:

- ✅ Real database connections (Convex)
- ✅ Actual API integrations
- ✅ Genuine user authentication
- ✅ Real content generation
- ✅ Actual file operations
- ✅ Real analytics tracking

**Never use mock data, placeholders, or simulated responses.**

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm or yarn
- Convex account

### Setup

1. **Clone and install dependencies**
   ```bash
   git clone <repository>
   cd prosper
   npm install
   ```

2. **Configure Convex**
   ```bash
   npx convex dev
   ```
   This will create your `.env.local` with Convex configuration.

3. **Set up environment variables**
   Edit `.env.local` and add your API keys:
   ```bash
   # Required AI API Keys
   GEMINI_API_KEY=your_gemini_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Optional fallback APIs
   STABILITY_API_KEY=your_stability_api_key_here
   ```

4. **Get API Keys**
   - **Gemini AI**: Get from [Google AI Studio](https://aistudio.google.com/)
   - **OpenAI**: Get from [OpenAI Platform](https://platform.openai.com/api-keys)
   - **Stability AI**: Get from [Stability Platform](https://platform.stability.ai/account/keys) (optional)

5. **Start development server**
   ```bash
   npm run dev
   ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run check:real-data` - Verify real data compliance

### Testing

- `npm run test:gemini` - Test AI content generation
- `npm run test:blog` - Test blog functionality
- `npm run test:images` - Test image generation
- `npm run test:complete` - Run complete test suite

### Environment Variables

The application requires the following environment variables in `.env.local`:

#### Required
- `GEMINI_API_KEY` - Google Gemini AI for content generation
- `OPENAI_API_KEY` - OpenAI API for DALL-E image generation
- `NEXT_PUBLIC_CONVEX_URL` - Convex database URL (auto-generated)
- `CONVEX_DEPLOYMENT` - Convex deployment name (auto-generated)

#### Optional
- `STABILITY_API_KEY` - Stability AI for alternative image generation
- `NEXTAUTH_SECRET` - NextAuth.js secret for authentication
- `EMAIL_SERVER_*` - Email configuration for contact forms
- `NEXT_PUBLIC_GA_ID` - Google Analytics tracking
- `BLOG_GEN_SCHEDULE` - Cron schedule for automated blog generation

## 🗄️ Database Schema

The application uses Convex with the following main tables:

- **blogPosts** - Blog articles with AI generation metadata
- **blogImages** - AI-generated images for blog posts
- **leads** - Client inquiries and lead management
- **appointments** - Calendar booking system
- **projects** - Portfolio projects
- **skills** - Technical skills and certifications
- **experiences** - Work experience and education
- **analytics** - User behavior and performance metrics

## 🤖 AI Integration

### Content Generation
- **Gemini AI** for blog post generation
- **DALL-E** for image creation
- **Automated SEO** optimization
- **Multi-language** content support

### Features
- Topic suggestions based on trends
- SEO keyword generation
- Content quality scoring
- Automated publishing workflows

## 📊 Analytics & SEO

- Real-time user behavior tracking
- SEO performance monitoring
- Content engagement metrics
- Lead conversion tracking
- Performance optimization

## 🌐 Multi-language Support

- English and French content
- Localized user interface
- SEO-optimized multilingual URLs
- Cultural adaptation for content

## 🔒 Security & Performance

- Real user authentication
- Secure API integrations
- Optimized database queries
- Caching strategies
- Error handling and monitoring

## 📱 Responsive Design

- Mobile-first approach
- Progressive Web App features
- Optimized for all devices
- Accessibility compliance

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard:
   - `GEMINI_API_KEY`
   - `OPENAI_API_KEY`
   - `STABILITY_API_KEY` (optional)
   - `NEXTAUTH_SECRET`
   - `EMAIL_SERVER_*` (optional)
3. Deploy automatically on push

### Convex Deployment
1. Run `npx convex deploy` to deploy to production
2. Update environment variables with production Convex URLs
3. Configure production environment settings

### Environment Setup for Production
```bash
# Production environment variables
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXTAUTH_URL=https://your-domain.com
VERCEL_ENV=production
```

## 📈 Monitoring

- Real-time error tracking
- Performance monitoring
- User analytics
- System health checks

## 🤝 Contributing

1. **Follow the Real Data Policy** - Never use mock data
2. **Use real implementations only** - All APIs and databases must be real
3. **Test with actual data** - Use real API keys and data
4. **Document all changes** - Update README and code comments
5. **Ensure type safety** - Use TypeScript and Convex types
6. **Run compliance checks** - `npm run check:real-data`
7. **Test thoroughly** - Use provided test scripts

### Development Workflow
```bash
# 1. Set up environment
cp .env.local .env.local.backup
# Edit .env.local with your API keys

# 2. Start development
npm run dev

# 3. Run tests
npm run test:complete

# 4. Check compliance
npm run check:real-data

# 5. Build and deploy
npm run build
```

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the Real Data Policy
- Run compliance checks
- Test with real data

---

**Remember: Real data = Real results = Real value**