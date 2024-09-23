'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onAuth: (token: string) => void
}

export default function AuthModal({ isOpen, onClose, onAuth }: AuthModalProps) {
  const [token, setToken] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAuth(token)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Authenticate</DialogTitle>
          <DialogDescription>
            Enter your Google OAuth token to connect with Google services.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="token" className="text-right">
                OAuth Token
              </Label>
              <Input
                id="token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="col-span-3"
                placeholder="Enter your Google OAuth token"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Authenticate</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}