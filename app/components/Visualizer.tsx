import React, { useRef, useEffect } from 'react';
import { View, Animated } from 'react-native';

export const Visualizer = ({ volume }: { volume: number }) => {
  const barCount = 30; // Fewer bars for mobile performance
  
  return (
    <View className="flex-row items-center justify-center h-24 space-x-1">
      {Array.from({ length: barCount }).map((_, i) => (
        <Bar key={i} volume={volume} index={i} total={barCount} />
      ))}
    </View>
  );
};

const Bar = ({ volume, index, total }: { volume: number, index: number, total: number }) => {
    const heightAnim = useRef(new Animated.Value(4)).current;

    useEffect(() => {
        // Simple visualizer logic mimicking the CSS animation
        const center = total / 2;
        const dist = Math.abs(index - center);
        const maxDist = total / 2;
        const scale = 1 - (dist / maxDist); // Higher in center
        
        // Random variance
        const random = Math.random() * 0.5 + 0.5;
        
        const targetHeight = Math.max(4, volume * 100 * scale * random);

        Animated.timing(heightAnim, {
            toValue: targetHeight,
            duration: 100,
            useNativeDriver: false,
        }).start();

    }, [volume, index, total]);

    return (
        <Animated.View 
            style={{
                height: heightAnim,
                width: 4,
                backgroundColor: volume > 0.01 ? '#60A5FA' : '#374151', // blue-400 : gray-700
                borderRadius: 2,
            }} 
        />
    );
};

