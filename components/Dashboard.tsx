import React from 'react'
import { Button } from "@/components/ui/button"

interface DashboardProps {
  onNavigate: (tab: string) => void
  onLogout: () => void
  setActiveTab: (tab: string) => void
  activeTab: string
  children?: React.ReactNode
}

export default function Dashboard({ onNavigate, onLogout, setActiveTab, activeTab, children }: DashboardProps) {
  return (
    <div>
      <nav>
        <Button onClick={() => onNavigate('dashboard')} className={activeTab === 'dashboard' ? 'active' : ''}>Dashboard</Button>
        <Button onClick={() => onNavigate('profile')} className={activeTab === 'profile' ? 'active' : ''}>Profile</Button>
        <Button onClick={() => onNavigate('settings')} className={activeTab === 'settings' ? 'active' : ''}>Settings</Button>
      </nav>
      <main>
        {/* Render different content based on activeTab */}
        {activeTab === 'dashboard' && <h1>Dashboard Content</h1>}
        {activeTab === 'profile' && <h1>Profile Content</h1>}
        {activeTab === 'settings' && <h1>Settings Content</h1>}
        {children}
      </main>
    </div>
  )
}