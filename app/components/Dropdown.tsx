import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface DropdownProps {
  label: string;
  options: { value: string; label: string }[];
  selectedValue: string;
  onChange: (value: string) => void;
}

export const Dropdown: React.FC<DropdownProps> = ({ label, options, selectedValue, onChange }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const selectedLabel = options.find(o => o.value === selectedValue)?.label;

  return (
    <View className="mb-4">
      <Text className="text-gray-400 text-sm mb-2">{label}</Text>
      
      <TouchableOpacity 
        onPress={() => setModalVisible(true)}
        className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex-row justify-between items-center"
      >
        <Text className="text-white text-base">{selectedLabel || 'Select...'}</Text>
        <Text className="text-gray-400">▼</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-gray-900 rounded-t-3xl p-6 h-[50%]">
             <View className="flex-row justify-between items-center mb-4">
                 <Text className="text-white text-xl font-bold">{label}</Text>
                 <TouchableOpacity onPress={() => setModalVisible(false)}>
                     <Text className="text-blue-400 text-lg">Done</Text>
                 </TouchableOpacity>
             </View>
             
             <ScrollView>
                 {options.map((option) => (
                     <TouchableOpacity
                        key={option.value}
                        onPress={() => {
                            onChange(option.value);
                            setModalVisible(false);
                        }}
                        className={`p-4 rounded-xl mb-2 ${selectedValue === option.value ? 'bg-gray-800 border border-blue-500' : 'bg-gray-800/50'}`}
                     >
                        <Text className={`text-lg ${selectedValue === option.value ? 'text-blue-400 font-bold' : 'text-gray-300'}`}>
                            {option.label}
                        </Text>
                     </TouchableOpacity>
                 ))}
             </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

