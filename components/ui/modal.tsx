import { ReactNode } from 'react';
import { Modal as RNModal, View, Text, TouchableOpacity } from 'react-native';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  presentationStyle?: 'pageSheet' | 'formSheet' | 'fullScreen' | 'overFullScreen';
  animationType?: 'none' | 'slide' | 'fade';
}

export function Modal({
  visible,
  onClose,
  title,
  children,
  presentationStyle = 'pageSheet',
  animationType = 'slide',
}: ModalProps) {
  return (
    <RNModal visible={visible} animationType={animationType} presentationStyle={presentationStyle}>
      <View className="flex-1 bg-white p-4">
        <View className="mb-6 flex-row items-center justify-between">
          <Text className="text-xl font-bold">{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <Text className="font-medium text-blue-500">Cancel</Text>
          </TouchableOpacity>
        </View>
        {children}
      </View>
    </RNModal>
  );
}
