import { Suspense } from 'react'
import dynamic from 'next/dynamic'

const GoogleCallbackPageClient = dynamic(() => import('./GoogleCallbackPageClient'), { ssr: false })

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GoogleCallbackPageClient />
    </Suspense>
  )
}