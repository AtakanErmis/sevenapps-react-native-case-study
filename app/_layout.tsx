import '../global.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import DatabaseProvider from '@/providers/database-provider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
    mutations: {
      retry: 1,
    },
  },
});

export default function Layout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <DatabaseProvider>
          <Stack>
            <Stack.Screen name="index" options={{ title: 'Task Manager' }} />
            <Stack.Screen name="tasks/[listId]" options={{ title: 'Tasks' }} />
          </Stack>
        </DatabaseProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
