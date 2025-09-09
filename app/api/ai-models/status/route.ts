import { NextRequest, NextResponse } from 'next/server'
import aiModelManager from '@/lib/ai-model-manager'
import { rateLimiters, getClientIdentifier } from '@/lib/rate-limiter'
import { ErrorLogger, AppError, formatErrorResponse } from '@/lib/error-handler'

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getClientIdentifier(request)
    const rateLimitResult = rateLimiters.api.check(identifier)
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        formatErrorResponse(new AppError('Too many requests, please try again later', 429)),
        { 
          status: 429,
          headers: rateLimiters.api.getHeaders(identifier)
        }
      )
    }

    // Get model status
    const modelStatus = aiModelManager.getModelStatus()
    
    // Calculate overall system health
    const availableModels = modelStatus.filter(model => model.isAvailable)
    const totalModels = modelStatus.length
    const healthPercentage = (availableModels.length / totalModels) * 100
    
    let systemStatus: 'healthy' | 'degraded' | 'critical'
    if (healthPercentage >= 80) {
      systemStatus = 'healthy'
    } else if (healthPercentage >= 40) {
      systemStatus = 'degraded'
    } else {
      systemStatus = 'critical'
    }

    const response = {
      systemStatus,
      healthPercentage,
      timestamp: new Date().toISOString(),
      models: modelStatus,
      summary: {
        totalModels,
        availableModels: availableModels.length,
        unavailableModels: totalModels - availableModels.length,
        primaryModel: modelStatus.find(m => m.isAvailable && m.id.includes('gemini-2.5-flash'))?.name ||
                     modelStatus.find(m => m.isAvailable && m.id.includes('gemini-1.5-flash'))?.name ||
                     'Fallback Active',
        averageQuotaUsage: modelStatus.reduce((acc, model) => acc + model.quotaPercentage, 0) / totalModels
      }
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    ErrorLogger.log(error as Error, { 
      endpoint: 'ai-models-status'
    })
    
    return NextResponse.json(
      formatErrorResponse(error as Error),
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getClientIdentifier(request)
    const rateLimitResult = rateLimiters.api.check(identifier)
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        formatErrorResponse(new AppError('Too many requests, please try again later', 429)),
        { 
          status: 429,
          headers: rateLimiters.api.getHeaders(identifier)
        }
      )
    }

    const { action, modelId } = await request.json()

    if (action === 'reset' && modelId) {
      const success = aiModelManager.resetModel(modelId)
      
      if (success) {
        ErrorLogger.logWarning(`Model ${modelId} manually reset`, { 
          endpoint: 'ai-models-status',
          action: 'reset'
        })
        
        return NextResponse.json({
          success: true,
          message: `Model ${modelId} has been reset`,
          timestamp: new Date().toISOString()
        })
      } else {
        return NextResponse.json(
          formatErrorResponse(new AppError(`Model ${modelId} not found`, 404)),
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      formatErrorResponse(new AppError('Invalid action or missing modelId', 400)),
      { status: 400 }
    )

  } catch (error) {
    ErrorLogger.log(error as Error, { 
      endpoint: 'ai-models-status',
      action: 'post'
    })
    
    return NextResponse.json(
      formatErrorResponse(error as Error),
      { status: 500 }
    )
  }
}
