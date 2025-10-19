# Real Data Implementation Policy

## CRITICAL REQUIREMENT: Use Real Data Only

This project enforces a strict policy of using real data in all implementations. **NEVER use mock data, sample data, or placeholder responses.**

## What This Means

### ✅ ALWAYS Use Real Data For:

1. **Database Operations**
   - Connect to actual Convex database
   - Store and retrieve real user data
   - Implement real-time subscriptions
   - Use actual database queries and mutations

2. **API Integrations**
   - Use real external APIs with proper authentication
   - Handle real API responses and errors
   - Implement proper rate limiting and retry logic
   - Store actual API data in the database

3. **File Operations**
   - Read/write actual files from the filesystem
   - Handle real file uploads and downloads
   - Store actual file metadata
   - Implement real file processing

4. **User Interactions**
   - Handle real user input and validation
   - Store actual user preferences and settings
   - Track real user behavior and analytics
   - Implement genuine user authentication

5. **Content Generation**
   - Use actual AI models (Gemini, DALL-E, etc.)
   - Generate real content and store results
   - Implement real content processing pipelines
   - Handle actual content moderation

6. **Analytics & Tracking**
   - Track real user behavior and interactions
   - Generate actual analytics reports
   - Store real performance metrics
   - Implement genuine A/B testing

7. **Communication**
   - Send real emails and SMS messages
   - Implement actual notification systems
   - Handle real user feedback and support
   - Process genuine user inquiries

8. **Payments & Transactions**
   - Process real payments with actual providers
   - Handle real transaction records
   - Implement actual billing and invoicing
   - Store genuine financial data

9. **Authentication & Security**
   - Implement real user authentication
   - Use actual security measures and encryption
   - Handle real user sessions and tokens
   - Implement genuine authorization checks

10. **External Services**
    - Integrate with real third-party services
    - Handle actual service responses and errors
    - Implement real webhook processing
    - Store actual service data

### ❌ NEVER Use:

- Mock data, sample data, or placeholder responses
- Simulated API calls or fake endpoints
- Hardcoded test data in production code
- Placeholder content or lorem ipsum text
- Fake user accounts or test credentials
- Simulated file operations or virtual file systems
- Mock payment processing or fake transactions
- Simulated email/SMS delivery
- Fake analytics or placeholder metrics
- Mock authentication or test tokens

## Implementation Guidelines

### Database Operations
```typescript
// ✅ CORRECT: Use real Convex queries
const posts = await convex.query(api.blog.getPublishedPosts, { limit: 10 })

// ❌ WRONG: Don't use mock data
const posts = [
  { id: '1', title: 'Mock Post', content: 'Lorem ipsum...' }
]
```

### API Integrations
```typescript
// ✅ CORRECT: Use real API calls
const response = await fetch('https://api.example.com/data', {
  headers: { 'Authorization': `Bearer ${realToken}` }
})

// ❌ WRONG: Don't use mock responses
const response = { data: 'mock response' }
```

### File Operations
```typescript
// ✅ CORRECT: Handle real file uploads
const file = await uploadFile(realFile, realPath)

// ❌ WRONG: Don't simulate file operations
const file = { name: 'mock.txt', size: 1024 }
```

### Content Generation
```typescript
// ✅ CORRECT: Use real AI models
const content = await generateContent(realPrompt, realConfig)

// ❌ WRONG: Don't use placeholder content
const content = 'This is placeholder content...'
```

## Error Handling

Always implement proper error handling for real data operations:

```typescript
try {
  const result = await realDataOperation()
  return result
} catch (error) {
  console.error('Real data operation failed:', error)
  // Handle actual errors, don't return mock data
  throw error
}
```

## Testing

When testing, use real test data that gets cleaned up:

```typescript
// ✅ CORRECT: Use real test data
const testUser = await createTestUser()
await performTest(testUser)
await cleanupTestUser(testUser)

// ❌ WRONG: Don't use mock data in tests
const mockUser = { id: 'test', name: 'Test User' }
```

## Monitoring

Implement real monitoring and logging:

```typescript
// ✅ CORRECT: Log real operations
console.log('Real data operation completed:', { 
  operation: 'createPost',
  userId: realUserId,
  timestamp: new Date()
})

// ❌ WRONG: Don't log mock operations
console.log('Mock operation completed')
```

## Compliance

This policy applies to:
- All production code
- All development code
- All scripts and utilities
- All API endpoints
- All database operations
- All external integrations
- All user-facing features
- All background processes

## Enforcement

- Code reviews must verify real data usage
- Automated tests must use real data
- Documentation must reflect real implementations
- Deployment must use real configurations
- Monitoring must track real operations

## Benefits

Using real data ensures:
- Accurate testing and validation
- Real-world performance characteristics
- Genuine user experience
- Actual system reliability
- True scalability testing
- Real security validation
- Authentic error handling
- Genuine integration testing

---

**Remember: Real data = Real results = Real value**
