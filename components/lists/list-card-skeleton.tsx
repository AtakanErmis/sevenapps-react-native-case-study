import { View } from 'react-native';

export function ListCardSkeleton() {
  return (
    <View className={styles.container}>
      <View className={styles.content}>
        <View className={styles.info}>
          <View className={styles.listNameSkeleton} />
          <View className={styles.dateTextSkeleton} />
        </View>
      </View>
    </View>
  );
}

const styles = {
  container: 'flex-1 rounded-lg border border-gray-200 p-4 bg-white',
  content: 'flex-row items-center justify-between gap-8',
  info: 'flex-1 gap-1',
  listNameSkeleton: 'h-6 bg-gray-200 rounded animate-pulse mb-1',
  dateTextSkeleton: 'h-3 bg-gray-200 rounded animate-pulse w-1/2',
};
