'use client'

import { useState, useRef, useEffect } from 'react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronLeft, ChevronRight, Link } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

// Mock function to fetch slides data
const fetchSlidesData = async () => {
  // This would be replaced with actual API call to Google Slides
  return Array(10).fill(null).map((_, i) => ({
    id: `slide-${i + 1}`,
    thumbnailUrl: `/placeholder.svg?height=150&width=200&text=Slide ${i + 1}`,
  }))
}

interface Slide {
  id: string;
  thumbnailUrl: string;
}

interface Selection {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function SlidesConfig({ onSelectArea }: { onSelectArea: (slideId: string, pageId: string, selection: Selection) => void }) {
  const [slides, setSlides] = useState<Slide[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [selection, setSelection] = useState<Selection | null>(null)
  const slideRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchSlidesData().then(setSlides)
  }, [])

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const startX = e.nativeEvent.offsetX
    const startY = e.nativeEvent.offsetY

    const handleMouseMove = (e: MouseEvent) => {
      const endX = e.offsetX
      const endY = e.offsetY
      setSelection({
        x: Math.min(startX, endX),
        y: Math.min(startY, endY),
        width: Math.abs(endX - startX),
        height: Math.abs(endY - startY),
      })
    }

    const handleMouseUp = () => {
      slideRef.current?.removeEventListener('mousemove', handleMouseMove)
      slideRef.current?.removeEventListener('mouseup', handleMouseUp)
    }

    slideRef.current?.addEventListener('mousemove', handleMouseMove)
    slideRef.current?.addEventListener('mouseup', handleMouseUp)
  }

  const handleConnectToSheets = () => {
    if (!selection || currentSlide === null) {
      toast({
        title: "Error",
        description: "Please select an area on the slide",
        variant: "destructive",
      })
      return
    }

    const currentSlideData = slides[currentSlide]
    onSelectArea(currentSlideData.id, 'pageId', selection) // Replace 'pageId' with actual page ID when available
    
    toast({
      title: "Area Selected",
      description: "Selected area is ready to be connected to a sheet",
    })
  }

  return (
    <div className="flex h-screen">
      <ScrollArea className="w-64 border-r">
        {slides.map((slide, index) => (
          <Card 
            key={slide.id} 
            className={`m-2 cursor-pointer ${index === currentSlide ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setCurrentSlide(index)}
          >
            <CardContent className="p-2">
              <img src={slide.thumbnailUrl} alt={`Slide ${index + 1}`} className="w-full" />
            </CardContent>
          </Card>
        ))}
      </ScrollArea>
      <div className="flex-1 p-4">
        <div className="flex justify-between mb-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
            disabled={currentSlide === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1))}
            disabled={currentSlide === slides.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div 
          ref={slideRef}
          className="relative w-full h-[calc(100vh-8rem)] border rounded-lg overflow-hidden"
          onMouseDown={handleMouseDown}
        >
          {slides[currentSlide] && (
            <img 
              src={slides[currentSlide].thumbnailUrl} 
              alt={`Slide ${currentSlide + 1}`} 
              className="w-full h-full object-contain"
            />
          )}
          {selection && (
            <div 
              style={{
                position: 'absolute',
                left: `${selection.x}px`,
                top: `${selection.y}px`,
                width: `${selection.width}px`,
                height: `${selection.height}px`,
                border: '2px solid blue',
                backgroundColor: 'rgba(0, 0, 255, 0.1)',
              }}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="absolute bottom-0 right-0">
                    <Link className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={handleConnectToSheets}>
                    Connect to Sheets
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}