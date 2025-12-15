import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';

export const TypingIndicator = () => {
    const fadeAnim1 = useRef(new Animated.Value(0.3)).current;
    const fadeAnim2 = useRef(new Animated.Value(0.3)).current;
    const fadeAnim3 = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const createAnimation = (anim: Animated.Value, delay: number) => {
            return Animated.sequence([
                Animated.timing(anim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                    delay: delay
                }),
                Animated.timing(anim, {
                    toValue: 0.3,
                    duration: 400,
                    useNativeDriver: true,
                })
            ]);
        };

        const loop = Animated.loop(
            Animated.stagger(200, [
                createAnimation(fadeAnim1, 0),
                createAnimation(fadeAnim2, 0),
                createAnimation(fadeAnim3, 0),
            ])
        );

        loop.start();

        return () => loop.stop();
    }, []);

    return (
        <View className="flex-row items-center space-x-1 h-6 px-2">
            <Animated.View className="w-2 h-2 rounded-full bg-gray-400" style={{ opacity: fadeAnim1 }} />
            <Animated.View className="w-2 h-2 rounded-full bg-gray-400" style={{ opacity: fadeAnim2 }} />
            <Animated.View className="w-2 h-2 rounded-full bg-gray-400" style={{ opacity: fadeAnim3 }} />
        </View>
    );
};

