import { Feather } from '@expo/vector-icons';
import * as ImagePickerExpo from 'expo-image-picker';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';

import { Label } from './label';

import { cn } from '@/lib/utils/cn';

interface ImagePickerProps {
  label: string;
  value?: string | null;
  onImageChange: (imageUri?: string) => void;
  placeholder?: string;
  aspectRatio?: [number, number];
  quality?: number;
  hasError?: boolean;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  testID?: string;
}

export function ImagePicker({
  label,
  value,
  onImageChange,
  placeholder = 'Add Image',
  aspectRatio = [16, 9],
  quality = 0.8,
  hasError = false,
  error,
  required = false,
  disabled = false,
  testID,
}: ImagePickerProps) {
  const pickImage = async () => {
    if (disabled) return;

    try {
      const { status } = await ImagePickerExpo.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission needed',
          'Sorry, we need camera roll permissions to pick an image.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePickerExpo.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: aspectRatio,
        quality,
      });

      if (!result.canceled && result.assets[0]) {
        onImageChange(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.', [{ text: 'OK' }]);
    }
  };

  const removeImage = () => {
    onImageChange(undefined);
  };

  return (
    <View className="mb-4" testID={testID}>
      <Label required={required}>{label}</Label>

      {value ? (
        <View className="relative">
          <Image
            source={{ uri: value }}
            className={cn(
              'h-32 w-full rounded-lg',
              hasError && 'border-2 border-red-500',
              disabled && 'opacity-50'
            )}
            resizeMode="cover"
            testID={`${testID}-image`}
          />
          {!disabled && (
            <TouchableOpacity
              className="absolute right-2 top-2 rounded-full bg-red-500 p-1"
              onPress={removeImage}
              testID={`${testID}-remove`}>
              <Feather name="x" size={16} color="white" />
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <TouchableOpacity
          className={cn(
            'h-32 items-center justify-center rounded-lg border-2 border-dashed',
            hasError ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50',
            disabled && 'bg-gray-100 opacity-50'
          )}
          onPress={pickImage}
          disabled={disabled}
          testID={`${testID}-placeholder`}>
          <Feather
            name="camera"
            size={24}
            color={hasError ? '#dc2626' : disabled ? '#9CA3AF' : '#6B7280'}
          />
          <Text
            className={cn(
              'mt-2 text-sm',
              hasError ? 'text-red-600' : disabled ? 'text-gray-400' : 'text-gray-500'
            )}>
            {placeholder}
          </Text>
        </TouchableOpacity>
      )}

      {hasError && error && (
        <Text className="mt-1 text-sm text-red-600" testID={`${testID}-error`}>
          {error}
        </Text>
      )}
    </View>
  );
}
