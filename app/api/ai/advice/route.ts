// ============================================
// AI ADVICE API ROUTE
// ============================================

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateAdvice } from "@/lib/ai/client"
import { RATE_LIMIT } from "@/lib/ai/config"

// Simple in-memory rate limiting (use Redis in production)
const rateLimitMap = new Map<string, number[]>()

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const oneMinute = 60 * 1000
  
  const timestamps = rateLimitMap.get(userId) || []
  const recent = timestamps.filter(t => now - t < oneMinute)
  
  if (recent.length >= RATE_LIMIT.maxRequestsPerMinute) {
    return false
  }
  
  recent.push(now)
  rateLimitMap.set(userId, recent)
  return true
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Rate limiting
    if (!checkRateLimit(user.id)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again in a minute." },
        { status: 429 }
      )
    }

    // Parse request
    const body = await request.json()
    const { context, type = 'general' } = body

    if (!context) {
      return NextResponse.json(
        { error: "Context is required" },
        { status: 400 }
      )
    }

    // Validate type
    const validTypes = ['general', 'habits', 'goals', 'finance', 'health', 'skills']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid advice type" },
        { status: 400 }
      )
    }

    // Generate advice
    const advice = await generateAdvice(context, { 
      useAI: true, 
      type: type as any 
    })

    return NextResponse.json({ advice })

  } catch (error) {
    console.error("AI advice API error:", error)
    return NextResponse.json(
      { error: "Failed to generate advice" },
      { status: 500 }
    )
  }
}

// Streaming version for real-time feel
export async function GET(request: NextRequest) {
  // For now, just return a health check
  return NextResponse.json({ 
    status: "ok",
    aiEnabled: Boolean(process.env.AI_API_KEY),
    provider: process.env.NEXT_PUBLIC_AI_PROVIDER || 'local'
  })
}
