'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useSearchParams } from 'next/navigation'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const BACKEND_URL = 'http://localhost:3001'

interface File {
  id: string
  name: string
  mimeType: string
  thumbnailLink?: string
}

interface User {
  email: string
  name: string
}

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [spreadsheets, setSpreadsheets] = useState<File[]>([])
  const [presentations, setPresentations] = useState<File[]>([])
  const [selectedSpreadsheet, setSelectedSpreadsheet] = useState('')
  const [selectedPresentation, setSelectedPresentation] = useState('')
  const [sheetRange, setSheetRange] = useState('')
  const [slidePageId, setSlidePageId] = useState('')
  const [selectedBlocks, setSelectedBlocks] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)

  const searchParams = useSearchParams()

  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/check`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setIsAuthenticated(data.isAuthenticated)
        setUser(data.user)
        if (data.isAuthenticated) {
          fetchSpreadsheets()
          fetchPresentations()
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
      setError('Failed to check authentication status')
    }
  }, [])

  useEffect(() => {
    checkAuthStatus()
  }, [checkAuthStatus])

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      setError(errorParam === 'auth_failed' ? 'Authentication failed. Please try again.' : errorParam)
    }
  }, [searchParams])

  const handleAuth = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/google/url`)
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error getting auth URL:', error)
      setError('Failed to initiate authentication')
    }
  }

  const fetchSpreadsheets = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/spreadsheets`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setSpreadsheets(data)
      } else if (response.status === 401) {
        setIsAuthenticated(false)
        setError('Authentication expired. Please log in again.')
      } else {
        throw new Error('Failed to fetch spreadsheets')
      }
    } catch (error) {
      console.error('Error fetching spreadsheets:', error)
      setError('Failed to fetch spreadsheets')
    }
  }

  const fetchPresentations = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/presentations`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setPresentations(data)
      } else if (response.status === 401) {
        setIsAuthenticated(false)
        setError('Authentication expired. Please log in again.')
      } else {
        throw new Error('Failed to fetch presentations')
      }
    } catch (error) {
      console.error('Error fetching presentations:', error)
      setError('Failed to fetch presentations')
    }
  }

  const handleConnect = async () => {
    if (!isAuthenticated) {
      handleAuth()
      return
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/connections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          sheetId: selectedSpreadsheet,
          slideId: selectedPresentation,
          sheetRange,
          slidePageId,
          blocks: selectedBlocks,
          isImage: false
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Connection created successfully:', data)
      } else if (response.status === 401) {
        setIsAuthenticated(false)
        setError('Authentication expired. Please log in again.')
      } else {
        throw new Error('Connection failed')
      }
    } catch (error) {
      console.error('Connection error:', error)
      setError('Failed to create connection')
    }
  }

  const toggleBlockSelection = (blockId: number) => {
    setSelectedBlocks(prev => 
      prev.includes(blockId) 
        ? prev.filter(id => id !== blockId)
        : [...prev, blockId]
    )
  }

  return (
    <div className="container mx-auto p-4 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-center text-black">Hive Theory</h1>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="flex justify-center mb-8 space-x-4">
        <Button 
          onClick={handleAuth}
          className="bg-green-500 text-white hover:bg-green-600 focus:ring-2 focus:ring-green-500"
        >
          {isAuthenticated ? 'Reauthenticate with Google' : 'Authenticate with Google'}
        </Button>
        <Button 
          onClick={handleConnect}
          className="bg-white text-black border-2 border-black hover:bg-gray-100 focus:ring-2 focus:ring-black"
          disabled={!isAuthenticated}
        >
          Connect
        </Button>
      </div>
      {isAuthenticated && user && (
        <div className="mb-4 text-center">
          <p>Logged in as: {user.email}</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-2 border-black shadow-none">
          <CardHeader>
            <CardTitle className="text-black">Google Sheets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <Select onValueChange={setSelectedSpreadsheet}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a spreadsheet" />
                </SelectTrigger>
                <SelectContent>
                  {spreadsheets.map((sheet) => (
                    <SelectItem key={sheet.id} value={sheet.id}>{sheet.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="sheet-range" className="text-black">Sheet Range</Label>
                <Input 
                  id="sheet-range" 
                  placeholder="e.g., Sheet1!A1:B10" 
                  value={sheetRange}
                  onChange={(e) => setSheetRange(e.target.value)}
                  className="border-2 border-black focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-black shadow-none">
          <CardHeader>
            <CardTitle className="text-black">Google Slides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <Select onValueChange={setSelectedPresentation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a presentation" />
                </SelectTrigger>
                <SelectContent>
                  {presentations.map((pres) => (
                    <SelectItem key={pres.id} value={pres.id}>{pres.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="slide-page-id" className="text-black">Slide Page ID</Label>
                <Input 
                  id="slide-page-id" 
                  placeholder="Enter slide page ID" 
                  value={slidePageId}
                  onChange={(e) => setSlidePageId(e.target.value)}
                  className="border-2 border-black focus:ring-2 focus:ring-black"
                />
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Select Blocks</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Select Blocks</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-3 gap-4 py-4">
                    {[...Array(9)].map((_, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className={`h-20 ${selectedBlocks.includes(index) ? 'bg-primary text-primary-foreground' : ''}`}
                        onClick={() => toggleBlockSelection(index)}
                      >
                        {index + 1}
                      </Button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}