'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function GoogleCallbackPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(true)

  const handleCallback = async (code: string) => {
    try {
      const response = await fetch('/api/auth/google/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })

      if (response.ok) {
        router.push('/dashboard')
      } else {
        const data = await response.json()
        setError(data.error || 'An error occurred during authentication')
      }
    } catch (err) {
      console.error('Error during authentication:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    if (!searchParams) return;

    const errorParam = searchParams.get('error')
    if (errorParam) {
      setError(errorParam === 'auth_failed' ? 'Authentication failed. Please try again.' : errorParam)
      setIsProcessing(false)
      return
    }

    const code = searchParams.get('code')
    if (code) {
      handleCallback(code)
    } else {
      setError('No authentication code received')
      setIsProcessing(false)
    }
  }, [searchParams, router])

  if (isProcessing) {
    return <div>Processing authentication...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return <div>Authenticating...</div>
}