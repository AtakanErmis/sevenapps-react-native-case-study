import { View, Text, TouchableOpacity } from 'react-native';

import { cn } from '@/lib/utils/cn';
import { List } from '@/types';

interface ListCardProps {
  list: List;
  onPress: (list: List) => void;
  disabled?: boolean;
}

export function ListCard({ list, onPress, disabled = false }: ListCardProps) {
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={() => onPress(list)}
      className={cn(
        styles.container,
        disabled ? styles.containerDisabled : styles.containerEnabled
      )}>
      <View className={styles.content}>
        <View className={styles.info}>
          <Text className={styles.listName}>{list.name}</Text>
          <Text className={styles.dateText}>
            Created {new Date(list.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = {
  container: 'flex-1 rounded-lg border border-gray-200 p-4',
  containerEnabled: 'bg-white',
  containerDisabled: 'bg-gray-100 opacity-50',
  content: 'flex-row items-center justify-between',
  info: 'flex-1',
  listName: 'text-lg font-semibold text-gray-900',
  dateText: 'mt-1 text-xs text-gray-400',
};
