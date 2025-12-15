import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Platform, SafeAreaView } from 'react-native';
import { useLiveSession } from '../hooks/useLiveSession';
import { Visualizer } from './Visualizer';
import { TypingIndicator } from './TypingIndicator';
import { Persona } from '../types';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ArrowLeft, Mic, MicOff, Camera, Video, VideoOff } from 'lucide-react-native';

interface SessionViewProps {
  persona: Persona;
  onBack: () => void;
}

const SessionView: React.FC<SessionViewProps> = ({ persona, onBack }) => {
    const [isVideoEnabled, setIsVideoEnabled] = useState(false);
    const cameraRef = useRef<CameraView>(null);
    const [permission, requestPermission] = useCameraPermissions();
    
    // Setup session
    const {
        isConnected,
        isError,
        status,
        volume,
        connect,
        disconnect,
        messages
    } = useLiveSession({
        systemInstruction: persona.systemInstruction,
        voiceName: 'Puck', // Default for now
        language: 'English',
        cameraRef: cameraRef,
        isVideoEnabled: isVideoEnabled,
    });

    // Auto-connect on mount
    useEffect(() => {
        connect();
        return () => {
            disconnect();
        };
    }, []); // Run once on mount

    const toggleVideo = async () => {
        if (!isVideoEnabled) {
            if (!permission?.granted) {
                const { granted } = await requestPermission();
                if (!granted) return;
            }
        }
        setIsVideoEnabled(!isVideoEnabled);
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-800">
                <TouchableOpacity onPress={onBack} className="p-2">
                    <ArrowLeft color="white" size={24} />
                </TouchableOpacity>
                <View className="items-center">
                    <Text className="text-white font-bold text-lg">{persona.title}</Text>
                    <View className="flex-row items-center">
                        <View className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                        <Text className="text-xs text-gray-400">{status}</Text>
                    </View>
                </View>
                <View className="w-10" /> 
            </View>

            {/* Main Content */}
            <View className="flex-1 relative">
                {/* Camera View Layer (Background if active) */}
                {isVideoEnabled && (
                   <View className="absolute inset-0 z-0">
                       <CameraView
                           ref={cameraRef}
                           style={{ flex: 1 }}
                           facing="front"
                       />
                       {/* Overlay to dim camera slightly so text is readable */}
                       <View className="absolute inset-0 bg-black/40" />
                   </View>
                )}

                {/* Messages Area */}
                <ScrollView 
                    className="flex-1 p-4" 
                    contentContainerStyle={{ paddingBottom: 100 }}
                    // ref={scrollViewRef}
                >
                    {messages.length === 0 && isConnected && (
                         <View className="items-center mt-20 opacity-50">
                             <Text className="text-6xl mb-4">{persona.icon}</Text>
                             <Text className="text-gray-400">Listening...</Text>
                         </View>
                    )}
                    
                    {messages.map((msg, idx) => (
                        <View 
                            key={idx} 
                            className={`mb-4 max-w-[85%] rounded-2xl p-4 ${
                                msg.role === 'user' 
                                    ? 'self-end bg-blue-600 rounded-tr-sm' 
                                    : 'self-start bg-gray-800 rounded-tl-sm'
                            }`}
                        >
                            <Text className="text-white text-base leading-6">{msg.text}</Text>
                            {!msg.isFinal && msg.role === 'model' && (
                                <View className="mt-2">
                                    <TypingIndicator />
                                </View>
                            )}
                        </View>
                    ))}
                </ScrollView>

                {/* Controls Area */}
                <View className="absolute bottom-0 left-0 right-0 bg-gray-900/90 border-t border-gray-800 p-6 pb-8">
                     {/* Visualizer */}
                     <View className="mb-6 h-16 items-center justify-center">
                         {isConnected ? (
                             <Visualizer volume={Math.max(volume.input, volume.output)} />
                         ) : (
                             <Text className="text-red-400 text-sm">Disconnected</Text>
                         )}
                     </View>

                     {/* Action Buttons */}
                     <View className="flex-row justify-center space-x-6 items-center">
                         <TouchableOpacity 
                             onPress={toggleVideo}
                             className={`p-4 rounded-full ${isVideoEnabled ? 'bg-white' : 'bg-gray-800'}`}
                         >
                             {isVideoEnabled ? <VideoOff color="black" size={24} /> : <Video color="white" size={24} />}
                         </TouchableOpacity>
                         
                         <TouchableOpacity 
                             onPress={isConnected ? disconnect : connect}
                             className={`p-6 rounded-full ${isConnected ? 'bg-red-500' : 'bg-green-500'}`}
                         >
                             {isConnected ? <MicOff color="white" size={32} /> : <Mic color="white" size={32} />}
                         </TouchableOpacity>
                     </View>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default SessionView;

