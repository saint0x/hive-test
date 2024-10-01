'use client'

import React, { ReactNode } from 'react';
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FileText, Image, Link, Settings, User } from 'lucide-react'

interface DashboardProps {
  children: ReactNode;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ children, onNavigate, onLogout }) => {
  const menuItems = [
    { key: 'sheets', icon: <FileText className="mr-2 h-4 w-4" />, label: 'Sheets' },
    { key: 'slides', icon: <Image className="mr-2 h-4 w-4" />, label: 'Slides' },
    { key: 'connections', icon: <Link className="mr-2 h-4 w-4" />, label: 'Connections' },
    { key: 'settings', icon: <Settings className="mr-2 h-4 w-4" />, label: 'Settings' },
  ];

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-background border-r">
        <div className="p-4 text-center">
          <Avatar className="h-16 w-16 mx-auto">
            <AvatarImage src="/avatar.png" alt="User" />
            <AvatarFallback><User /></AvatarFallback>
          </Avatar>
          <h3 className="mt-2 font-semibold">User Name</h3>
        </div>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <nav className="space-y-1 p-2">
            {menuItems.map((item) => (
              <Button
                key={item.key}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => onNavigate(`/${item.key}`)}
              >
                {item.icon}
                {item.label}
              </Button>
            ))}
          </nav>
        </ScrollArea>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        <div className="mb-4">
          <Button variant="outline" onClick={() => onNavigate('/profile')}>
            Profile
          </Button>
          <Button variant="outline" onClick={onLogout}>
            Logout
          </Button>
        </div>
        {children}
      </main>
    </div>
  );
};

export default Dashboard;