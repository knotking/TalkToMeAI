import React from 'react';

interface VisualizerProps {
  volume: number;
  isActive: boolean;
  isThinking?: boolean;
  isCameraActive?: boolean;
  color: string;
}

const Visualizer: React.FC<VisualizerProps> = ({ volume, isActive, isThinking = false, isCameraActive = false, color }) => {
  // Normalize volume roughly to 0-1 scale for CSS scaling (0-255 input usually)
  const normalizedVol = Math.min(Math.max(volume / 50, 0.1), 1.5);
  
  // Extract gradient colors or use defaults if complex string
  const baseColorClass = color.includes('from-') ? color : 'from-blue-500 to-indigo-600';

  return (
    <div className="relative flex items-center justify-center w-36 h-36">
       
       {/* 1. Background Aura / Thinking Pulse */}
       {/* When thinking, this breathes. When talking, it scales with volume. */}
      <div 
        className={`absolute inset-0 rounded-full blur-2xl transition-all duration-700 
          ${isThinking 
            ? 'bg-white/10 animate-breathe scale-110' 
            : `opacity-30 ${baseColorClass.replace('from-', 'bg-').split(' ')[0]}`
          }`}
        style={{ transform: !isThinking ? `scale(${isActive ? 1 + normalizedVol * 0.4 : 1})` : undefined }}
      />
      
      {/* 2. Thinking Ring (Orbiting) */}
      {isThinking && (
        <div className="absolute inset-0 rounded-full border border-white/10 border-t-white/60 animate-spin-slow w-full h-full shadow-[0_0_15px_rgba(255,255,255,0.1)]"></div>
      )}

      {/* 3. Camera Analysis Ripple (Only if thinking + camera) */}
      {isThinking && isCameraActive && (
         <div className="absolute inset-2 border border-blue-400/40 rounded-full animate-pulse-ring"></div>
      )}

      {/* 4. Core Circle */}
      <div className={`relative z-10 w-24 h-24 rounded-full bg-gradient-to-br shadow-2xl flex items-center justify-center transition-all duration-500
          ${isThinking ? 'scale-90 brightness-110 shadow-inner' : ''}
          ${baseColorClass}
        `}
        style={{ transform: !isThinking ? `scale(${isActive ? 1 + normalizedVol * 0.15 : 1})` : undefined }}
      >
        {isActive ? (
           <div className="flex items-center justify-center h-8 w-12 overflow-hidden">
             {isThinking ? (
               // Thinking State: Subtle dots animation
               <div className="flex space-x-1.5">
                 <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                 <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                 <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
               </div>
             ) : (
               // Talking/Listening State: Wave bars
                <div className="flex space-x-1 items-end h-full">
                  {[1, 2, 3, 4, 5].map((i) => (
                      <div 
                        key={i} 
                        className="w-1 bg-white/90 rounded-full transition-all duration-75"
                        style={{ 
                          height: `${Math.max(15, Math.min(100, Math.random() * 120 * normalizedVol))}%`,
                        }}
                      />
                  ))}
                </div>
             )}
           </div>
        ) : (
            // Inactive State
            <div className="text-3xl text-white/80">
                🎙️
            </div>
        )}
      </div>
    </div>
  );
};

export default Visualizer;