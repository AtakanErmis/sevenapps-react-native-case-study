import Feather from '@expo/vector-icons/Feather';
import { useQueryClient } from '@tanstack/react-query';
import { Stack, router } from 'expo-router';
import { useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import { ListCard } from '@/components/lists/list-card';
import { ListCardSkeleton } from '@/components/lists/list-card-skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SwipeableListItem } from '@/components/ui/swipeable-item';
import { TextInputModal } from '@/components/ui/text-input-modal';
import { filterLists } from '@/lib/utils/list-filters';
import { useAllLists, useCreateList, useDeleteList, useRenameList } from '@/queries/hooks/lists';
import { isTempId } from '@/queries/utils';
import { List } from '@/types';

export default function Home() {
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');

  const { data: allLists, isLoading: listsLoading, error: listsError } = useAllLists();

  // Filter lists client-side
  const lists = useMemo(() => {
    return filterLists(allLists || [], searchTerm);
  }, [allLists, searchTerm]);

  const createListMutation = useCreateList();
  const deleteListMutation = useDeleteList();
  const renameListMutation = useRenameList();

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal states
  const [createListModalVisible, setCreateListModalVisible] = useState(false);
  const [renameListModalVisible, setRenameListModalVisible] = useState(false);
  const [selectedList, setSelectedList] = useState<List | null>(null);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await queryClient.refetchQueries({ queryKey: ['lists'] });
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient]);

  const handleCreateList = useCallback(() => {
    setCreateListModalVisible(true);
  }, []);

  const handleCreateListSubmit = useCallback(
    (text: string) => {
      createListMutation.mutate(text);
      setCreateListModalVisible(false);
    },
    [createListMutation]
  );

  const handleCreateListCancel = useCallback(() => {
    setCreateListModalVisible(false);
  }, []);

  const handleDeleteList = (list: List) => {
    Alert.alert('Delete List', `Are you sure you want to delete "${list.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteListMutation.mutate(list.id),
      },
    ]);
  };

  const handleRenameList = (list: List) => {
    setSelectedList(list);
    setRenameListModalVisible(true);
  };

  const handleRenameListSubmit = useCallback(
    (text: string) => {
      if (selectedList && text !== selectedList.name) {
        renameListMutation.mutate({ id: selectedList.id, name: text });
      }
      setRenameListModalVisible(false);
      setSelectedList(null);
    },
    [selectedList, renameListMutation]
  );

  const handleRenameListCancel = useCallback(() => {
    setRenameListModalVisible(false);
    setSelectedList(null);
  }, []);

  const handleListPress = (list: List) => {
    router.push(`/tasks/${list.id}`);
  };

  const renderListItem = (props: { item: List }) => {
    const item = props.item;

    // Check if this is an optimistic item
    const isOptimistic = isTempId(item.id);

    // Show optimistic updates via UI state
    const isDeleting = deleteListMutation.isPending && deleteListMutation.variables === item.id;
    const isRenaming = renameListMutation.isPending && renameListMutation.variables?.id === item.id;

    // Override name if renaming
    const displayItem = isRenaming
      ? { ...item, name: renameListMutation.variables?.name || item.name }
      : item;

    if (isDeleting) {
      return (
        <View className={styles.deletingContainer}>
          <Text className={styles.deletingText}>Deleting...</Text>
        </View>
      );
    }

    const leftActions = isOptimistic
      ? []
      : [
          {
            text: 'Rename',
            textClassName: 'text-white',
            buttonClassName: 'bg-blue-500',
            icon: <Feather name="edit-2" size={24} color="white" />,
            onPress: () => handleRenameList(displayItem),
          },
        ];

    const rightActions = isOptimistic
      ? []
      : [
          {
            text: 'Delete',
            textClassName: 'text-white',
            buttonClassName: 'bg-red-500',
            icon: <Feather name="trash" size={24} color="white" />,
            onPress: () => handleDeleteList(displayItem),
          },
        ];

    return (
      <SwipeableListItem leftActions={leftActions} rightActions={rightActions}>
        <ListCard list={displayItem} onPress={handleListPress} disabled={isOptimistic} />
      </SwipeableListItem>
    );
  };

  if (listsError) {
    return (
      <View className={styles.errorContainer}>
        <Stack.Screen options={{ title: 'Lists' }} />
        <Text className={styles.errorText}>Error loading lists: {listsError.message}</Text>
        <TouchableOpacity
          className={styles.retryButton}
          onPress={() => queryClient.invalidateQueries({ queryKey: ['lists'] })}>
          <Text className={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className={styles.container}>
      <Stack.Screen
        options={{
          title: 'Lists',
          headerRight: () => (
            <Button
              variant="header"
              onPress={handleCreateList}
              disabled={createListMutation.isPending}
              className={createListMutation.isPending ? 'bg-blue-400' : undefined}>
              {createListMutation.isPending ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <Text className="font-semibold text-white">+ Add</Text>
              )}
            </Button>
          ),
        }}
      />

      <View className={styles.content}>
        <Input
          left={<Feather name="search" size={20} />}
          showClearButton
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Search lists..."
          className="mb-4"
          variant="small"
          testID="lists-search"
        />

        {listsLoading ? (
          <FlatList
            data={Array.from({ length: 5 })}
            renderItem={() => <ListCardSkeleton />}
            keyExtractor={(_, index) => `skeleton-${index}`}
            showsVerticalScrollIndicator={false}
            contentContainerClassName={styles.listContent}
          />
        ) : (
          <FlatList
            data={lists}
            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
            renderItem={renderListItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerClassName={styles.listContent}
            ListEmptyComponent={
              <View className={styles.emptyContainer}>
                <Text className={styles.emptyTitle}>
                  {searchTerm.length > 0 ? 'No lists found' : 'No lists yet'}
                </Text>
                <Text className={styles.emptyDescription}>
                  {searchTerm.length > 0
                    ? `No lists match "${searchTerm}"`
                    : 'Create your first list to get started organizing your tasks!'}
                </Text>
              </View>
            }
          />
        )}
      </View>

      <TextInputModal
        visible={createListModalVisible}
        title="Create New List"
        message="Enter the list name:"
        placeholder="List name"
        onCancel={handleCreateListCancel}
        onSubmit={handleCreateListSubmit}
        cancelText="Cancel"
        submitText="Create"
      />

      <TextInputModal
        visible={renameListModalVisible}
        title="Rename List"
        message="Enter new name:"
        placeholder="List name"
        defaultValue={selectedList?.name || ''}
        onCancel={handleRenameListCancel}
        onSubmit={handleRenameListSubmit}
        cancelText="Cancel"
        submitText="Rename"
      />
    </View>
  );
}

const styles = {
  container: 'flex-1 bg-gray-50',
  content: 'flex-1 p-4',
  errorContainer: 'flex-1 items-center justify-center bg-gray-50 p-4',
  errorText: 'mb-4 text-center text-red-600',
  retryButton: 'rounded-lg bg-blue-500 px-4 py-2',
  retryButtonText: 'font-semibold text-white',
  loadingContainer: 'flex-1 items-center justify-center',
  loadingText: 'mt-2 text-gray-600',
  deletingContainer: 'mb-3 rounded-lg border border-gray-200 bg-gray-100 p-4 opacity-50',
  deletingText: 'text-lg font-semibold text-gray-500',
  listContent: 'gap-2',
  emptyContainer: 'flex-1 items-center justify-center py-12',
  emptyTitle: 'mb-2 text-lg text-gray-500',
  emptyDescription: 'text-center text-gray-400',
};
