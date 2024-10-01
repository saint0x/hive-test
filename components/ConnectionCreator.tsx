import React, { useState } from 'react'
import SheetsConfig from './SheetsConfig'
import SlidesConfig from './SlidesConfig'
import ConnectionManager from './ConnectionManager'
import { useToast } from "@/hooks/use-toast"
import BatchSlideGenerator from './BatchSlideGenerator'
import { Button } from './ui/button'
import { Loader2 } from 'lucide-react'
import { history } from '../utils/history';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

interface Selection {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SlideSelection {
  id: string;
  pageId: string;
  area: Selection;
}

export default function ConnectionCreator() {
  const [selectedSheet, setSelectedSheet] = useState<{ id: string, range: string } | null>(null)
  const [selectedSlide, setSelectedSlide] = useState<SlideSelection | null>(null)
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleSheetConnect = (sheetId: string, sheetRange: string) => {
    setSelectedSheet({ id: sheetId, range: sheetRange })
  }

  const handleSlideAreaSelect = (slideId: string, pageId: string, selection: Selection) => {
    setSelectedSlide({ id: slideId, pageId, area: selection })
  }

  const handleCreateConnection = async () => {
    if (!selectedSheet || !selectedSlide) {
      toast({
        title: "Error",
        description: "Please select both a sheet range and a slide area",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`${BACKEND_URL}/api/connections`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          sheetId: selectedSheet.id,
          slideId: selectedSlide.id,
          sheetRange: selectedSheet.range,
          slidePageId: selectedSlide.pageId,
          x: selectedSlide.area.x,
          y: selectedSlide.area.y,
          width: selectedSlide.area.width,
          height: selectedSlide.area.height,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create connection');
      }

      const newConnection = await response.json();
      toast({
        title: "Connection Created",
        description: "The connection between the sheet and slide has been created",
      })

      // Reset selections
      setSelectedSheet(null)
      setSelectedSlide(null)
    } catch (error: unknown) {
      console.error('Error creating connection:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create connection",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }

    history.execute({
      execute: async () => {
        // ... (connection creation code)
      },
      undo: async () => {
        // Code to delete the created connection
      }
    });
  }

  const handleBatchGenerate = (newConnections: any[]) => {
    // Update the UI or state with the new connections
    // For example, you might want to add these to your existing connections list
    // or refresh the ConnectionManager component
    console.log('New connections generated:', newConnections);
    // You might want to call a function to refresh the connections list here
    // refreshConnections();
  }

  return (
    <div className="space-y-8">
      <SheetsConfig 
        slideSelection={selectedSlide || { id: '', pageId: '', area: { x: 0, y: 0, width: 0, height: 0 } }} 
        onConnect={handleSheetConnect} 
      />
      <SlidesConfig onSelectArea={handleSlideAreaSelect} />
      <Button 
        onClick={handleCreateConnection}
        disabled={!selectedSheet || !selectedSlide || isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Connection...
          </>
        ) : (
          'Create Connection'
        )}
      </Button>
      <ConnectionManager />
      <BatchSlideGenerator 
        sheetId={selectedSheet?.id || ''} 
        slideId={selectedSlide?.id || ''}
        sheetRange={selectedSheet?.range || ''}
        onBatchGenerate={handleBatchGenerate}
      />
    </div>
  )
}