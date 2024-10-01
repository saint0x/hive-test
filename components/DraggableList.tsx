import React from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'

interface Connection {
  id: string;
  sheetId: string;
  slideId: string;
  sheetRange: string;
  slidePageId: string;
  slideElementId: string;
}

interface DraggableListProps {
  items: Connection[]
  onReorder: (items: Connection[]) => void
}

const DraggableList: React.FC<DraggableListProps> = ({ items, onReorder }) => {
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);

    onReorder(newItems);
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="list">
        {(provided) => (
          <ul {...provided.droppableProps} ref={provided.innerRef}>
            {items.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided) => (
                  <li
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="p-4 mb-2 bg-white border rounded shadow"
                  >
                    Sheet: {item.sheetId.slice(0, 8)}... | 
                    Slide: {item.slideId.slice(0, 8)}... | 
                    Range: {item.sheetRange}
                  </li>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  )
}

export default DraggableList