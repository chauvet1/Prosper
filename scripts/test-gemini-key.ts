import { GoogleGenerativeAI } from '@google/generative-ai'
import { config } from 'dotenv'

config({ path: '.env.local' })
config({ path: '.env' })

console.log('🔑 GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 8) + '...' : 'Not found')

async function testGeminiKey() {
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found')
    process.exit(1)
  }
  try {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }) // Use Gemini Flash 2.0
    const result = await model.generateContent('Say hello in English.')
    const text = result.response.text()
    console.log('✅ Gemini API key works! Response:', text)
  } catch (error) {
    console.error('❌ Gemini API key test failed:', error)
  }
}

testGeminiKey()
