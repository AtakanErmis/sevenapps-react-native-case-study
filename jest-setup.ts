// Mock React Native modules
jest.mock('expo-router', () => ({
  Stack: {
    Screen: () => null,
  },
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
  },
  useLocalSearchParams: () => ({}),
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
  }),
}));

jest.mock('@expo/vector-icons/Feather', () => 'Icon');

jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      name: 'Test App',
      slug: 'test-app',
    },
  },
}));

// Mock React Query
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: () => ({
    invalidateQueries: jest.fn(),
    refetchQueries: jest.fn(),
    setQueryData: jest.fn(),
    getQueryData: jest.fn(),
    cancelQueries: jest.fn(),
  }),
  QueryClient: jest.fn(),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock React Form
jest.mock('@tanstack/react-form', () => ({
  useForm: jest.fn(),
}));

// Mock SQLite
jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(() =>
    Promise.resolve({
      execAsync: jest.fn(),
      getFirstAsync: jest.fn(),
      getAllAsync: jest.fn(),
      runAsync: jest.fn(() => Promise.resolve({ changes: 1, lastInsertRowId: 1 })),
    })
  ),
}));

// Mock reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock gesture handler
jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }: { children: React.ReactNode }) => children,
  PanGestureHandler: ({ children }: { children: React.ReactNode }) => children,
  State: {
    BEGAN: 0,
    FAILED: 1,
    CANCELLED: 2,
    ACTIVE: 4,
    END: 5,
  },
  Directions: {
    RIGHT: 1,
    LEFT: 2,
    UP: 4,
    DOWN: 8,
  },
}));

// Mock NativeWind
jest.mock('nativewind', () => ({
  styled: () => () => null,
}));

// Mock React Native CSS Interop
jest.mock('react-native-css-interop', () => ({
  remapProps: jest.fn(),
  useCSSRuntimeValue: jest.fn(() => null),
  useCSSProperty: jest.fn(() => null),
}));

// Override Alert after jest-expo has mocked React Native
beforeEach(() => {
  const { Alert } = require('react-native');
  Alert.alert = jest.fn();
  Alert.prompt = jest.fn();
});

// Clear all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});
