import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast" // Corrected casing to match the actual file name
import { ChevronUp, ChevronDown, Trash2, Loader2 } from 'lucide-react'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { FixedSizeList as List } from 'react-window';
import { AlertCircle } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

interface Connection {
  id: string;
  sheetId: string;
  slideId: string;
  sheetRange: string;
  slidePageId: string;
  slideElementId: string;
  syncStatus: 'synced' | 'syncing' | 'error';
}

export default function ConnectionManager() {
  const [connections, setConnections] = useState<Connection[]>([])
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchConnections()
  }, [])

  const fetchConnections = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/connections`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setConnections(data)
      } else {
        throw new Error('Failed to fetch connections')
      }
    } catch (error) {
      console.error('Error fetching connections:', error)
      setError('Failed to fetch connections')
    }
  }

  const handleMoveConnection = async (connectionId: string, direction: 'up' | 'down') => {
    const index = connections.findIndex(conn => conn.id === connectionId)
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === connections.length - 1)) {
      return
    }

    const newConnections = [...connections]
    const [movedConnection] = newConnections.splice(index, 1)
    newConnections.splice(direction === 'up' ? index - 1 : index + 1, 0, movedConnection)

    setConnections(newConnections)

    try {
      await updateConnectionOrder(newConnections.map(conn => conn.id))
      toast({
        title: "Connection Moved",
        description: `Connection moved ${direction}`,
      })
    } catch (error) {
      console.error('Error moving connection:', error)
      setError('Failed to move connection')
      // Revert the change
      setConnections(connections)
    }
  }

  const handleDeleteConnection = async (connectionId: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/connections/${connectionId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to delete connection')
      }

      setConnections(connections.filter(conn => conn.id !== connectionId))
      toast({
        title: "Connection Deleted",
        description: "Connection has been deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting connection:', error)
      setError('Failed to delete connection')
    }
  }

  const handleSyncConnection = async (connectionId: string) => {
    try {
      setConnections(prev => prev.map(conn => 
        conn.id === connectionId ? { ...conn, syncStatus: 'syncing' } : conn
      ));

      await fetch(`${BACKEND_URL}/api/connections/${connectionId}/sync`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
      });

      setConnections(prev => prev.map(conn => 
        conn.id === connectionId ? { ...conn, syncStatus: 'synced' } : conn
      ));

      toast({
        title: "Connection Synced",
        description: "Connection has been synced successfully",
      });
    } catch (error) {
      console.error('Error syncing connection:', error);
      setConnections(prev => prev.map(conn => 
        conn.id === connectionId ? { ...conn, syncStatus: 'error' } : conn
      ));
      setError('Failed to sync connection');
    }
  };

  const updateConnectionOrder = async (connectionIds: string[]) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/connections/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ connectionIds }),
      })

      if (!response.ok) {
        throw new Error('Failed to update connection order')
      }
    } catch (error) {
      console.error('Error updating connection order:', error)
      throw error
    }
  }

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) {
      return
    }

    const newConnections = Array.from(connections)
    const [reorderedItem] = newConnections.splice(result.source.index, 1)
    newConnections.splice(result.destination.index, 0, reorderedItem)

    setConnections(newConnections)

    try {
      await updateConnectionOrder(newConnections.map(conn => conn.id))
      toast({
        title: "Connections Reordered",
        description: "Connection order updated successfully",
      })
    } catch (error) {
      console.error('Error reordering connections:', error)
      setError('Failed to reorder connections')
      // Revert the change
      setConnections(connections)
    }
  }

  const ConnectionRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const connection = connections[index];
    return (
      <div style={style} className="flex items-center justify-between p-2 border rounded mb-2">
        <span>{connection.sheetRange} → {connection.slidePageId}</span>
        <div className="flex items-center">
          {connection.syncStatus === 'syncing' && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
          {connection.syncStatus === 'error' && <AlertCircle className="text-red-500 h-4 w-4 mr-2" />}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleSyncConnection(connection.id)}
            disabled={connection.syncStatus === 'syncing'}
          >
            Sync
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => handleMoveConnection(connection.id, 'up')}
            disabled={index === 0}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => handleMoveConnection(connection.id, 'down')}
            disabled={index === connections.length - 1}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => handleDeleteConnection(connection.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Manage Connections</h2>
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      <List
        height={400}
        itemCount={connections.length}
        itemSize={50}
        width="100%"
      >
        {ConnectionRow}
      </List>
    </div>
  )
}