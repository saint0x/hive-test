'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTheme } from "next-themes"
import { Sun, Moon, LayoutGrid, Link, Settings as SettingsIcon, FileSpreadsheet, PresentationIcon } from 'lucide-react'
import Dashboard from '@/components/Dashboard'
import ConnectionManager from '@/components/ConnectionManager'
import BatchSlideGenerator from '@/components/BatchSlideGenerator'
import Settings from '@/components/Settings'
import GoogleAuthButton from '@/components/GoogleAuthButton'
import { useAuth } from '@/hooks/use-auth'

// Define the User type
interface User {
  image?: string;
  name?: string;
  email?: string;
}

// Update the return type of useAuth
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth() as AuthState
  const [activeTab, setActiveTab] = useState('dashboard')
  const { theme, setTheme } = useTheme()

  const handleNavigate = (path: string) => {
    router.push(path)
  }

  const handleLogout = () => {
    // Implement logout logic here
    console.log('Logout')
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Hive Theory</CardTitle>
          </CardHeader>
          <CardContent>
            <GoogleAuthButton />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <aside className="w-64 border-r border-border">
        <div className="p-4 flex flex-col h-full">
          <div className="flex items-center space-x-2 mb-8">
            <Avatar>
              <AvatarImage src={user?.image || ''} alt={user?.name || ''} />
              <AvatarFallback>{user?.name?.charAt(0) || ''}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user?.name || ''}</p>
              <p className="text-sm text-muted-foreground">{user?.email || ''}</p>
            </div>
          </div>
          <ScrollArea className="flex-grow">
            <Tabs defaultValue="dashboard" orientation="vertical" onValueChange={setActiveTab}>
              <TabsList className="flex flex-col items-start w-full">
                <TabsTrigger value="dashboard" className="w-full justify-start">
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="connections" className="w-full justify-start">
                  <Link className="mr-2 h-4 w-4" />
                  Manage Connections
                </TabsTrigger>
                <TabsTrigger value="batch" className="w-full justify-start">
                  <PresentationIcon className="mr-2 h-4 w-4" />
                  Batch Slide Generator
                </TabsTrigger>
                <TabsTrigger value="sheets" className="w-full justify-start">
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Sheets
                </TabsTrigger>
                <TabsTrigger value="settings" className="w-full justify-start">
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  Settings
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </ScrollArea>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="mt-auto"
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
        </div>
      </aside>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <main className="flex-1 p-6 overflow-auto">
          <TabsContent value="dashboard">
            <Card>
              <CardHeader>
                <CardTitle>Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <Dashboard onNavigate={handleNavigate} onLogout={handleLogout}>
                  <div>Welcome to your dashboard!</div>
                </Dashboard>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="connections">
            <Card>
              <CardHeader>
                <CardTitle>Manage Connections</CardTitle>
              </CardHeader>
              <CardContent>
                <ConnectionManager />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="batch">
            <Card>
              <CardHeader>
                <CardTitle>Batch Slide Generator</CardTitle>
              </CardHeader>
              <CardContent>
                <BatchSlideGenerator 
                  sheetId="" 
                  slideId="" 
                  sheetRange="" 
                  onBatchGenerate={() => {}}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="sheets">
            <Card>
              <CardHeader>
                <CardTitle>Sheets</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add Sheets component here */}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <Settings />
              </CardContent>
            </Card>
          </TabsContent>
        </main>
      </Tabs>
    </div>
  )
}