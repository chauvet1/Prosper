# 🚀 Database Setup Guide - Prisma + Accelerate

## Overview
This guide will help you set up the automated blog system using **Prisma** with **Accelerate** for optimal performance and **Google Gemini AI** for content generation.

---

## 📋 Prerequisites

1. **PostgreSQL Database** (choose one):
   - [Neon](https://neon.tech/) - Recommended (Free tier available)
   - [Railway](https://railway.app/) - Simple deployment
   - [PlanetScale](https://planetscale.com/) - MySQL alternative
   - Local PostgreSQL installation

2. **Prisma Accelerate** (optional but recommended):
   - [Prisma Cloud](https://cloud.prisma.io/) - Free tier available

3. **Google Gemini API Key with Nano Banana Access**:
   - [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Includes Gemini 1.5 Pro + Gemini 2.5 Flash Image (Nano Banana)

---

## 🛠️ Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

#### Option A: Neon (Recommended)
1. Go to [Neon](https://neon.tech/) and create a free account
2. Create a new project
3. Copy the connection string from the dashboard
4. It should look like: `postgresql://username:password@host/database?sslmode=require`

#### Option B: Railway
1. Go to [Railway](https://railway.app/) and create a project
2. Add a PostgreSQL database service
3. Copy the connection string from the database settings

#### Option C: Local PostgreSQL
```bash
# Install PostgreSQL locally
brew install postgresql  # macOS
sudo apt install postgresql  # Ubuntu

# Create database
createdb prosper_blog

# Connection string
DATABASE_URL="postgresql://username:password@localhost:5432/prosper_blog"
```

### 3. Environment Variables

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Fill in your environment variables:
```env
# Required
DATABASE_URL="your_postgresql_connection_string"
GEMINI_API_KEY="your_gemini_api_key"

# Optional (for Prisma Accelerate)
DIRECT_URL="your_postgresql_connection_string"
```

### 4. Prisma Setup

1. Generate Prisma client:
```bash
npm run db:generate
```

2. Push the schema to your database:
```bash
npm run db:push
```

3. Seed the database with initial data:
```bash
npm run db:seed
```

### 5. Prisma Accelerate Setup (Optional but Recommended)

1. Go to [Prisma Cloud](https://cloud.prisma.io/)
2. Create a free account
3. Create a new project
4. Connect your database
5. Get your Accelerate connection string
6. Update your `.env` file:
```env
DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=your_api_key"
DIRECT_URL="your_original_postgresql_connection_string"
```

### 6. Google Gemini API Setup

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file:
```env
GEMINI_API_KEY="your_gemini_api_key_here"
```

---

## 🧪 Testing the Setup

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Test Database Connection
```bash
npm run db:studio
```
This opens Prisma Studio where you can view your database.

### 3. Test AI Blog Generation
```bash
# Create a test API call to generate a blog post
curl -X POST http://localhost:3000/api/blog/generate \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "React Best Practices",
    "targetAudience": "developers",
    "contentType": "tutorial",
    "technicalLevel": "intermediate",
    "includeCode": true,
    "wordCount": 1000,
    "seoKeywords": ["react", "best practices", "javascript"],
    "tone": "professional"
  }'
```

---

## 📊 Database Schema Overview

### Core Tables:
- **blog_posts** - Main blog content with bilingual support
- **blog_analytics** - Performance tracking and metrics
- **seo_metrics** - SEO keyword performance
- **generation_queue** - Automated content generation queue
- **blog_categories** - Content organization
- **blog_tags** - Flexible tagging system

### AI Features:
- **Automated content generation** with Gemini AI
- **Bilingual content** (English/French)
- **SEO optimization** with keyword tracking
- **Performance analytics** and engagement metrics
- **Scheduled publishing** with queue management

---

## 🔧 Available Scripts

```bash
# Database operations
npm run db:generate    # Generate Prisma client
npm run db:push       # Push schema to database
npm run db:migrate    # Create and run migrations
npm run db:studio     # Open Prisma Studio
npm run db:seed       # Seed database with initial data

# Development
npm run dev           # Start development server
npm run build         # Build for production
npm run start         # Start production server
```

---

## 🚀 Automated Blog Generation

### How it Works:
1. **Queue System**: Blog topics are added to the generation queue
2. **Scheduled Generation**: AI generates content at specified times
3. **Automatic Publishing**: Generated content is automatically published
4. **SEO Optimization**: Each post is optimized for search engines
5. **Analytics Tracking**: Performance is monitored and tracked

### Manual Generation:
```bash
# Generate a blog post immediately
curl -X POST http://localhost:3000/api/blog/generate \
  -H "Content-Type: application/json" \
  -d '{"topic": "Your Topic Here", ...}'
```

### Scheduled Generation:
The system automatically checks the generation queue and creates new blog posts based on the schedule defined in the database.

---

## 📈 Performance Optimization

### Prisma Accelerate Benefits:
- **Global CDN** for database queries
- **Connection pooling** for better performance
- **Query caching** for faster response times
- **Edge computing** for reduced latency

### Caching Strategy:
- Blog posts: 5-10 minutes
- Categories/Tags: 30-60 minutes
- Analytics: 5 minutes
- Search results: 3 minutes

---

## 🔒 Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **Database Access**: Use read-only connections where possible
3. **API Rate Limiting**: Implement rate limiting for AI generation
4. **Input Validation**: Validate all user inputs
5. **SQL Injection**: Prisma provides built-in protection

---

## 🐛 Troubleshooting

### Common Issues:

1. **Database Connection Error**:
   - Check your connection string
   - Ensure database is accessible
   - Verify SSL settings

2. **Prisma Generate Error**:
   ```bash
   npx prisma generate --force
   ```

3. **Migration Issues**:
   ```bash
   npx prisma db push --force-reset
   npm run db:seed
   ```

4. **Gemini API Error**:
   - Check your API key
   - Verify API quota
   - Check network connectivity

### Getting Help:
- Check the [Prisma Documentation](https://www.prisma.io/docs)
- Review [Gemini AI Documentation](https://ai.google.dev/docs)
- Open an issue in the repository

---

## ✅ Success Checklist

- [ ] Database connected successfully
- [ ] Prisma client generated
- [ ] Schema pushed to database
- [ ] Initial data seeded
- [ ] Gemini API key configured
- [ ] Development server running
- [ ] Test blog post generated
- [ ] Prisma Studio accessible

Once all items are checked, your automated blog system is ready! 🎉
