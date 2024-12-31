import { useState, useEffect } from 'react';

interface Position {
  x: number;
  y: number;
}

interface DragOffset {
  x: number;
  y: number;
}

export const useDraggable = (initialPosition: Position) => {
  const [position, setPosition] = useState<Position>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<DragOffset>({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target instanceof Element && e.target.closest('.drag-handle')) {
      setIsDragging(true);
      const element = e.currentTarget.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - element.left,
        y: e.clientY - element.top
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = Math.min(
        Math.max(0, e.clientX - dragOffset.x),
        window.innerWidth - 300 // approximate toolbar width
      );
      const newY = Math.min(
        Math.max(0, e.clientY - dragOffset.y),
        window.innerHeight - 60 // approximate toolbar height
      );
      
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  return {
    position,
    handleMouseDown,
  };
};