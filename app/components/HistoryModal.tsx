import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SessionLog } from '../types';
import { PERSONAS } from '../constants';
import { X, Trash2 } from 'lucide-react-native';

interface HistoryModalProps {
  onClose: () => void;
  sessions: SessionLog[];
  onDeleteSession: (id: string) => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ onClose, sessions, onDeleteSession }) => {
  return (
    <View className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <View className="bg-gray-900 w-full max-w-lg rounded-2xl border border-gray-800 flex-1 max-h-[80%] overflow-hidden">
        <View className="p-4 border-b border-gray-800 flex-row justify-between items-center bg-gray-900">
          <Text className="text-xl font-bold text-white">Session History</Text>
          <TouchableOpacity onPress={onClose} className="p-2">
            <X color="#9CA3AF" size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4">
          {sessions.length === 0 ? (
            <View className="items-center justify-center py-12">
               <Text className="text-4xl mb-4">📜</Text>
               <Text className="text-gray-500">No history yet</Text>
            </View>
          ) : (
            sessions.map((session) => {
                const persona = PERSONAS.find(p => p.id === session.personaId);
                const date = new Date(session.startTime).toLocaleString();
                
                return (
                    <View key={session.id} className="bg-gray-800 rounded-xl p-4 mb-3 border border-gray-700">
                        <View className="flex-row justify-between items-start mb-2">
                            <View className="flex-row items-center">
                                <Text className="text-2xl mr-2">{persona?.icon || '🤖'}</Text>
                                <View>
                                    <Text className="text-white font-bold">{persona?.title || 'Unknown'}</Text>
                                    <Text className="text-xs text-gray-500">{date}</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => onDeleteSession(session.id)} className="p-2">
                                <Trash2 color="#EF4444" size={18} />
                            </TouchableOpacity>
                        </View>
                        <Text className="text-gray-400 text-sm" numberOfLines={2}>
                            {session.messages.find(m => m.role === 'user')?.text || 'Voice session...'}
                        </Text>
                    </View>
                );
            })
          )}
        </ScrollView>
      </View>
    </View>
  );
};

export default HistoryModal;

