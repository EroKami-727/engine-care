import React, { useEffect, useState, useCallback } from 'react';
import './CustomCursor.css';

const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isOnDark, setIsOnDark] = useState(false);

  const updatePosition = useCallback((e: MouseEvent) => {
    setPosition({ x: e.clientX, y: e.clientY });
    
    // Check if cursor is over a dark element
    const element = document.elementFromPoint(e.clientX, e.clientY);
    if (element) {
      const computedStyle = window.getComputedStyle(element);
      const bgColor = computedStyle.backgroundColor;
      // Parse RGB values
      const match = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        const [, r, g, b] = match.map(Number);
        // Calculate luminance
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        setIsOnDark(luminance < 0.5);
      }
    }
  }, []);

  useEffect(() => {
    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        target.getAttribute('role') === 'button' ||
        target.classList.contains('clickable') ||
        target.classList.contains('upload-zone') ||
        target.closest('.model-card') ||
        target.closest('.accordion-header')
      ) {
        setIsHovering(true);
      }
    };

    const handleMouseOut = () => {
      setIsHovering(false);
    };

    document.addEventListener('mousemove', updatePosition);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      document.removeEventListener('mousemove', updatePosition);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, [updatePosition]);

  return (
    <>
      <div
        className={`cursor-dot ${isHovering ? 'hovering' : ''} ${isClicking ? 'clicking' : ''} ${isOnDark ? 'on-dark' : ''}`}
        style={{ 
          transform: `translate(${position.x}px, ${position.y}px)`
        }}
      />
      <div
        className={`cursor-ring ${isHovering ? 'hovering' : ''} ${isClicking ? 'clicking' : ''} ${isOnDark ? 'on-dark' : ''}`}
        style={{ 
          transform: `translate(${position.x}px, ${position.y}px)`
        }}
      />
    </>
  );
};

export default CustomCursor;
