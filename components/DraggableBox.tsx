import React, { useState, useRef } from 'react'

const DraggableBox: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const onMouseDown = (e: React.MouseEvent) => {
    if (ref.current) {
      const startX = e.pageX - ref.current.offsetLeft
      const startY = e.pageY - ref.current.offsetTop

      const onMouseMove = (e: MouseEvent) => {
        setPosition({
          x: e.pageX - startX,
          y: e.pageY - startY,
        })
      }

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
        setIsDragging(false)
      }

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
      setIsDragging(true)
    }
  }

  return (
    <div
      ref={ref}
      className={`absolute w-32 h-32 bg-blue-500 cursor-move ${isDragging ? 'opacity-75' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      onMouseDown={onMouseDown}
    >
      Draggable Box
    </div>
  )
}

export default DraggableBox