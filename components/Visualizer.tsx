import React from 'react';

interface VisualizerProps {
  volume: number;
  isActive: boolean;
  color: string;
}

const Visualizer: React.FC<VisualizerProps> = ({ volume, isActive, color }) => {
  // Normalize volume roughly to 0-1 scale for CSS scaling (0-255 input usually)
  const normalizedVol = Math.min(Math.max(volume / 50, 0.1), 1.5);
  
  return (
    <div className="relative flex items-center justify-center w-32 h-32">
       {/* Background Glow */}
      <div 
        className={`absolute inset-0 rounded-full blur-xl opacity-40 transition-all duration-100 ${color.replace('from-', 'bg-').split(' ')[0]}`}
        style={{ transform: `scale(${isActive ? 1 + normalizedVol * 0.5 : 1})` }}
      />
      
      {/* Core Circle */}
      <div className={`relative z-10 w-24 h-24 rounded-full bg-gradient-to-br ${color} shadow-lg flex items-center justify-center transition-all duration-100`}
        style={{ transform: `scale(${isActive ? 1 + normalizedVol * 0.2 : 1})` }}
      >
        {isActive ? (
           <div className="space-x-1 flex items-center h-8">
             {/* Simple wave bars */}
             {[1, 2, 3, 4, 5].map((i) => (
                <div 
                  key={i} 
                  className="w-1 bg-white rounded-full animate-pulse"
                  style={{ 
                    height: `${Math.max(20, Math.random() * 100 * normalizedVol)}%`,
                    animationDuration: `${0.2 + Math.random() * 0.3}s`
                  }}
                />
             ))}
           </div>
        ) : (
            <div className="text-4xl text-white opacity-80">
                🎙️
            </div>
        )}
      </div>
    </div>
  );
};

export default Visualizer;
