import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from 'lucide-react'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

interface BatchSlideGeneratorProps {
  sheetId: string;
  slideId: string;
  sheetRange: string;
  onBatchGenerate: (newConnections: any[]) => void;
}

export default function BatchSlideGenerator({ sheetId, slideId, sheetRange, onBatchGenerate }: BatchSlideGeneratorProps) {
  const [count, setCount] = useState(5)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleGenerateSlides = async () => {
    if (!sheetId || !slideId || !sheetRange) {
      toast({
        title: "Error",
        description: "Please select a sheet, a slide, and a range first",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`${BACKEND_URL}/api/connections/generate-batch`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ sheetId, slideId, sheetRange, count }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate batch slides');
      }

      const newConnections = await response.json();
      toast({
        title: "Slides Generated",
        description: `Successfully generated ${newConnections.length} slides`,
      })
      onBatchGenerate(newConnections);
    } catch (error) {
      console.error('Error generating batch slides:', error);
      toast({
        title: "Error",
        description: "Failed to generate batch slides",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Input
        type="number"
        value={count}
        onChange={(e) => setCount(parseInt(e.target.value))}
        min={1}
        max={20}
        disabled={isLoading}
      />
      <Button onClick={handleGenerateSlides} disabled={isLoading || !sheetId || !slideId || !sheetRange}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          'Generate Slides'
        )}
      </Button>
    </div>
  )
}