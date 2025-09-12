import { useState, useEffect } from 'react';
import { PawPrint } from 'lucide-react';

interface PawTrailProps {
  children: React.ReactNode;
  className?: string;
}

interface Paw {
  id: number;
  x: number;
  y: number;
}

export const PawTrail = ({ children, className = '' }: PawTrailProps) => {
  const [paws, setPaws] = useState<Paw[]>([]);
  const [pawId, setPawId] = useState(0);

  const addPaw = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newPaw = { id: pawId, x, y };
    setPaws(prev => [...prev.slice(-5), newPaw]); // Keep only last 6 paws
    setPawId(prev => prev + 1);
    
    // Remove paw after animation
    setTimeout(() => {
      setPaws(prev => prev.filter(paw => paw.id !== newPaw.id));
    }, 800);
  };

  return (
    <div 
      className={`relative ${className}`}
      onMouseMove={addPaw}
    >
      {children}
      
      {/* Paw trail */}
      {paws.map((paw, index) => (
        <PawPrint
          key={paw.id}
          className="absolute pointer-events-none text-primary/30 h-3 w-3 animate-paw-trail"
          style={{
            left: paw.x - 6,
            top: paw.y - 6,
            animationDelay: `${index * 0.1}s`
          }}
        />
      ))}
    </div>
  );
};