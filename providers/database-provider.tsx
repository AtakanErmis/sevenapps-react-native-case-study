import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { SQLiteProvider } from 'expo-sqlite';
import { Suspense } from 'react';
import { ActivityIndicator } from 'react-native';

import migrations from '../drizzle/migrations';

import { DATABASE_NAME, db } from '@/db';

interface DatabaseProviderProps {
  children: React.ReactNode;
}

export default function DatabaseProvider(props: DatabaseProviderProps) {
  useMigrations(db, migrations);

  return (
    <Suspense fallback={<ActivityIndicator size="large" />}>
      <SQLiteProvider
        databaseName={DATABASE_NAME}
        options={{ enableChangeListener: true }}
        useSuspense>
        {props.children}
      </SQLiteProvider>
    </Suspense>
  );
}
