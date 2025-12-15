import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { X, Github, ExternalLink } from 'lucide-react-native';

interface AboutModalProps {
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <View className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <View className="bg-gray-900 w-full max-w-lg rounded-2xl border border-gray-800 flex-1 max-h-[80%] overflow-hidden">
        <View className="p-4 border-b border-gray-800 flex-row justify-between items-center bg-gray-900">
            <Text className="text-xl font-bold text-white">About TalkToMeAI</Text>
            <TouchableOpacity onPress={onClose} className="p-2">
                <X color="#9CA3AF" size={24} />
            </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-6">
            <View className="items-center mb-6">
                <View className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl items-center justify-center mb-4">
                    <Text className="text-3xl text-white">🎙️</Text>
                </View>
                <Text className="text-2xl font-bold text-white mb-2">TalkToMeAI</Text>
                <Text className="text-gray-400 text-center">
                    Real-time multimodal conversations powered by Google Gemini 2.5 Live API.
                </Text>
            </View>

            <View className="space-y-4">
                <View className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                    <Text className="text-blue-400 font-bold mb-2">⚡ Real-time Voice</Text>
                    <Text className="text-gray-300 text-sm leading-5">
                        Experience ultra-low latency voice interactions. The AI listens, interrupts naturally, and responds instantly with emotional nuance.
                    </Text>
                </View>

                <View className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                    <Text className="text-purple-400 font-bold mb-2">👁️ Vision Capable</Text>
                    <Text className="text-gray-300 text-sm leading-5">
                        With your permission, specialized personas like the Chef or Handyman can see your environment through your camera to provide contextual advice.
                    </Text>
                </View>

                <TouchableOpacity 
                    onPress={() => Linking.openURL('https://aistudio.google.com/')}
                    className="flex-row items-center justify-between bg-gray-800 p-4 rounded-xl border border-gray-700"
                >
                    <View className="flex-row items-center">
                        <Text className="text-white font-medium mr-2">Powered by Gemini API</Text>
                    </View>
                    <ExternalLink size={16} color="#9CA3AF" />
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={() => Linking.openURL('https://github.com/yourusername/TalkToMeAI')}
                    className="flex-row items-center justify-between bg-gray-800 p-4 rounded-xl border border-gray-700"
                >
                     <View className="flex-row items-center">
                        <Github size={20} color="white" />
                        <Text className="text-white font-medium ml-2">View on GitHub</Text>
                    </View>
                    <ExternalLink size={16} color="#9CA3AF" />
                </TouchableOpacity>
            </View>
            
            <View className="mt-8 items-center">
                <Text className="text-gray-600 text-xs">Version 1.0.0 (Expo)</Text>
            </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default AboutModal;

