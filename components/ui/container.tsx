import { SafeAreaView } from 'react-native';

export const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <SafeAreaView className={styles.container} testID="container">
      {children}
    </SafeAreaView>
  );
};

const styles = {
  container: 'flex flex-1 m-6',
};
