import { View } from 'react-native';

export function TaskCardSkeleton() {
  return (
    <View className={styles.container}>
      <View className={styles.content}>
        <View className={styles.checkbox} />
        <View className={styles.taskInfo}>
          <View className={styles.taskNameSkeleton} />
          <View className={styles.taskDescriptionSkeleton} />
          <View className={styles.taskMeta}>
            <View className={styles.priorityBadgeSkeleton} />
            <View className={styles.dateTextSkeleton} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = {
  container: 'rounded-lg border border-gray-200 p-4 bg-white',
  content: 'flex-row items-center',
  checkbox: 'mr-3 h-6 w-6 rounded-full bg-gray-200 animate-pulse',
  taskInfo: 'flex-1',
  taskNameSkeleton: 'h-5 bg-gray-200 rounded animate-pulse mb-2',
  taskDescriptionSkeleton: 'h-4 bg-gray-200 rounded animate-pulse mb-2 w-3/4',
  taskMeta: 'flex-row items-center gap-2',
  priorityBadgeSkeleton: 'h-6 w-16 bg-gray-200 rounded-full animate-pulse',
  dateTextSkeleton: 'h-3 w-20 bg-gray-200 rounded animate-pulse',
};
