'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function SearchParamsComponent() {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState<string | null>(null)

  useEffect(() => {
    // Use a more robust check for searchParams
    const currentQuery = searchParams ? searchParams.get('query') : null
    setQuery(currentQuery)
  }, [searchParams])

  // Render a loading state until the effect has run
  if (query === null) {
    return <div className="animate-pulse bg-gray-200 h-10 w-full rounded"></div>
  }

  return (
    <div className="bg-white shadow rounded-lg p-4">
      {query ? `Searching for: ${query}` : 'No search query'}
    </div>
  )
}