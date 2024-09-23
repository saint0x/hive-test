'use client'

import { useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const BACKEND_URL = 'http://localhost:3001'

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleCallback = useCallback(async (code: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/google/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Received token:', data.token)
        router.push('/')
      } else {
        throw new Error('Authentication failed')
      }
    } catch (error) {
      console.error('Error during authentication:', error)
      router.push('/')
    }
  }, [router])

  useEffect(() => {
    const code = searchParams.get('code')
    if (code) {
      handleCallback(code)
    }
  }, [searchParams, handleCallback])

  return (
    <p className="text-xl">Authenticating...</p>
  )
}

export default function GoogleCallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Suspense fallback={<p className="text-xl">Loading...</p>}>
        <CallbackContent />
      </Suspense>
    </div>
  )
}