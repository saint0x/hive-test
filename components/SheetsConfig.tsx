'use client'

import { useState, useEffect } from 'react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Toast } from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"

// Mock function to fetch sheets data
const fetchSheetsData = async (): Promise<Array<{ id: string; name: string }>> => {
  // This would be replaced with actual API call to Google Sheets
  return [
    { id: 'sheet1', name: 'Project Overview' },
    { id: 'sheet2', name: 'Budget' },
    { id: 'sheet3', name: 'Timeline' },
  ]
}

// Mock function to fetch sheet content
const fetchSheetContent = async (sheetId: string): Promise<string[][]> => {
  // This would be replaced with actual API call to Google Sheets
  return Array(10).fill(null).map((_, rowIndex) => 
    Array(5).fill(null).map((_, colIndex) => `Cell ${rowIndex + 1}-${colIndex + 1}`)
  )
}

interface SlideSelection {
  // Define the structure of slideSelection here
  // For example:
  id: string;
  area: { x: number; y: number; width: number; height: number };
}

export default function SheetsConfig({ slideSelection, onConnect }: { slideSelection: SlideSelection, onConnect: (sheetId: string, sheetRange: string) => void }) {
  const [sheets, setSheets] = useState<Array<{ id: string; name: string }>>([])
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null)
  const [sheetContent, setSheetContent] = useState<string[][]>([])
  const [selectedCells, setSelectedCells] = useState<string[]>([])

  const { toast } = useToast()

  useEffect(() => {
    fetchSheetsData().then(setSheets)
  }, [])

  useEffect(() => {
    if (selectedSheet) {
      fetchSheetContent(selectedSheet).then(setSheetContent)
    }
  }, [selectedSheet])

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    const cellId = `${rowIndex}-${colIndex}`
    setSelectedCells(prev => 
      prev.includes(cellId) 
        ? prev.filter(id => id !== cellId)
        : [...prev, cellId]
    )
  }

  const handleConfirmConnection = () => {
    if (!selectedSheet || selectedCells.length === 0) {
      toast({
        title: "Error",
        description: "Please select a sheet and at least one cell",
        variant: "destructive",
      })
      return
    }

    const sheetRange = `${selectedSheet}!${selectedCells.join(',')}`
    onConnect(selectedSheet, sheetRange)
    
    toast({
      title: "Connection Established",
      description: `Connected ${selectedCells.length} cells to the selected slide area.`,
    })
  }

  return (
    <div className="flex flex-col h-screen p-4">
      <div className="mb-4">
        <Select onValueChange={(value: string) => setSelectedSheet(value)}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Select a sheet" />
          </SelectTrigger>
          <SelectContent>
            {sheets.map(sheet => (
              <SelectItem key={sheet.id} value={sheet.id}>{sheet.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <ScrollArea className="flex-grow">
        <Table>
          <TableHeader>
            <TableRow>
              {sheetContent[0]?.map((_, index) => (
                <TableHead key={index}>{String.fromCharCode(65 + index)}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sheetContent.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {row.map((cell, colIndex) => (
                  <TableCell 
                    key={`${rowIndex}-${colIndex}`}
                    className={`cursor-pointer ${selectedCells.includes(`${rowIndex}-${colIndex}`) ? 'bg-primary/20' : ''}`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                  >
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
      <div className="mt-4">
        <Button onClick={handleConfirmConnection} disabled={selectedCells.length === 0}>
          Confirm Connection
        </Button>
      </div>
    </div>
  )
}