import './polyfills'; // MUST BE FIRST
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PERSONAS } from '../constants';
import SessionView from '../components/SessionView';
import HistoryModal from '../components/HistoryModal';
import AboutModal from '../components/AboutModal';
import { Dropdown } from '../components/Dropdown';
import { Persona } from '../types';
import { Info, History, ArrowRight } from 'lucide-react-native';

export default function App() {
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [previewPersonaId, setPreviewPersonaId] = useState<string>(PERSONAS[0].id);
  const [showHistory, setShowHistory] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const previewPersona = PERSONAS.find(p => p.id === previewPersonaId) || PERSONAS[0];
  const personaOptions = PERSONAS.map(p => ({ value: p.id, label: p.title }));

  // Color mapping for gradients
  const getGradientColors = (colorClass: string): [string, string, ...string[]] => {
      // Very basic mapping from Tailwind class string to hex array
      // Ideally move colors to a constant object map
      if (colorClass.includes('blue')) return ['#3B82F6', '#4F46E5'];
      if (colorClass.includes('emerald')) return ['#10B981', '#0D9488'];
      if (colorClass.includes('green')) return ['#16A34A', '#047857'];
      if (colorClass.includes('red')) return ['#DC2626', '#E11D48'];
      if (colorClass.includes('cyan')) return ['#06B6D4', '#0284C7'];
      if (colorClass.includes('rose')) return ['#FB7185', '#EC4899'];
      if (colorClass.includes('amber')) return ['#FBBF24', '#F97316'];
      if (colorClass.includes('violet')) return ['#8B5CF6', '#7C3AED'];
      if (colorClass.includes('pink')) return ['#EC4899', '#BE185D'];
      return ['#6B7280', '#475569']; // Default Gray
  };

  if (selectedPersona) {
      return (
          <SessionView 
              persona={selectedPersona} 
              onBack={() => setSelectedPersona(null)} 
          />
      );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <StatusBar barStyle="light-content" />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Header Section */}
          <View className="p-6 pt-10 items-center">
              {/* Top Buttons */}
              <View className="w-full flex-row justify-end space-x-3 mb-8">
                  <TouchableOpacity 
                      onPress={() => setShowAbout(true)}
                      className="bg-gray-800/80 p-3 rounded-full border border-gray-700"
                  >
                      <Info color="white" size={20} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                      onPress={() => setShowHistory(true)}
                      className="bg-gray-800/80 p-3 rounded-full border border-gray-700"
                  >
                      <History color="white" size={20} />
                  </TouchableOpacity>
              </View>

              {/* Logo/Title */}
              <View className="items-center mb-8">
                  <LinearGradient
                      colors={['#8B5CF6', '#4F46E5']}
                      className="w-16 h-16 rounded-2xl items-center justify-center mb-4 shadow-lg"
                  >
                     <Text className="text-3xl text-white">🎙️</Text>
                  </LinearGradient>
                  <Text className="text-4xl font-extrabold text-white text-center mb-2">
                      TalkToMeAI
                  </Text>
                  <Text className="text-gray-400 text-center px-4 leading-6">
                      Experience real-time voice conversations with specialized AI personalities.
                  </Text>
              </View>
          </View>

          {/* Main Card */}
          <View className="mx-4 bg-gray-800 rounded-3xl p-6 border border-gray-700 shadow-2xl">
              <Dropdown 
                  label="Select a Persona"
                  options={personaOptions}
                  selectedValue={previewPersonaId}
                  onChange={setPreviewPersonaId}
              />

              {/* Preview Content */}
              <View className="items-center mt-4">
                  <LinearGradient
                      colors={getGradientColors(previewPersona.color)}
                      className="w-28 h-28 rounded-full items-center justify-center mb-6 border-4 border-gray-700"
                  >
                      <Text className="text-6xl">{previewPersona.icon}</Text>
                  </LinearGradient>

                  <Text className="text-2xl font-bold text-white mb-2 text-center">
                      {previewPersona.title}
                  </Text>
                  <Text className="text-gray-400 text-center mb-8 leading-6">
                      {previewPersona.description}
                  </Text>

                  {/* Badges */}
                  <View className="flex-row flex-wrap justify-center gap-2 mb-8">
                      {previewPersona.requiresFile && (
                          <View className="bg-blue-900/50 px-3 py-1.5 rounded-lg border border-blue-800">
                              <Text className="text-blue-300 text-xs font-bold">📄 Requires File</Text>
                          </View>
                      )}
                      {previewPersona.requiresCamera && (
                          <View className="bg-orange-900/50 px-3 py-1.5 rounded-lg border border-orange-800">
                              <Text className="text-orange-300 text-xs font-bold">📷 Requires Camera</Text>
                          </View>
                      )}
                      {!previewPersona.requiresFile && !previewPersona.requiresCamera && (
                          <View className="bg-green-900/50 px-3 py-1.5 rounded-lg border border-green-800">
                              <Text className="text-green-300 text-xs font-bold">⚡ Instant Start</Text>
                          </View>
                      )}
                  </View>

                  <TouchableOpacity
                      onPress={() => setSelectedPersona(previewPersona)}
                      className="w-full shadow-lg"
                  >
                      <LinearGradient
                          colors={getGradientColors(previewPersona.color)}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          className="w-full py-4 rounded-xl flex-row items-center justify-center"
                      >
                          <Text className="text-white font-bold text-lg mr-2">Start Session</Text>
                          <ArrowRight color="white" size={20} />
                      </LinearGradient>
                  </TouchableOpacity>
              </View>
          </View>

          {/* Footer Info */}
          <View className="mt-8 px-6">
              <Text className="text-center text-gray-600 text-xs">
                  Powered by Gemini 2.5 Live API
              </Text>
          </View>
      </ScrollView>

      {/* Modals */}
      {showHistory && (
          <HistoryModal 
              onClose={() => setShowHistory(false)} 
              sessions={[]} // TODO: Load actual sessions from storage
              onDeleteSession={() => {}} 
          />
      )}
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
    </SafeAreaView>
  );
}

