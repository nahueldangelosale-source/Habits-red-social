import React, { useEffect, useState, useRef } from 'react';
import { useCanaryStore } from '../../stores/useCanaryStore';

export const ShatteringGlassAnimation: React.FC = () => {
  const { isShatteringGlassEnabled, isShadowMode, disableDueToPerformance } = useCanaryStore();
  const [isActive, setIsActive] = useState(false);
  const particleContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // SSE Listener (Simulated connection to /api/v1/gaming/sse)
    const eventSource = new EventSource('/api/v1/gaming/sse');

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'shattering_glass' && !isShadowMode) {
          triggerAnimation();
        }
      } catch (e) {
        console.error('Error parsing SSE', e);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [isShadowMode]);

  const triggerAnimation = () => {
    setIsActive(true);
    
    if (isShatteringGlassEnabled) {
      // Performance Tracker (Circuit Breaker)
      const startTime = performance.now();
      
      // Simulating heavy DOM manipulation
      setTimeout(() => {
        const latency = performance.now() - startTime;
        if (latency > 300) {
          disableDueToPerformance(); // Degradación inmediata si el dispositivo es lento
        }
      }, 0);
    }

    setTimeout(() => setIsActive(false), 3000);
  };

  if (!isActive) return null;

  if (!isShatteringGlassEnabled) {
    // Graceful Fallback (CSS Puro)
    return (
      <div className="fixed top-10 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded shadow-lg transition-opacity duration-500">
        ¡Rutina completada con éxito!
      </div>
    );
  }

  return (
    <div 
      ref={particleContainerRef}
      className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center bg-black bg-opacity-20 backdrop-blur-sm"
    >
      <div className="relative animate-pulse">
        {/* Simulación visual de partículas complejas */}
        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 drop-shadow-lg scale-150 transform transition-transform duration-500">
          SHATTERING GLASS!
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-cyan-400 opacity-50 blur-xl animate-ping rounded-full"></div>
      </div>
    </div>
  );
};
