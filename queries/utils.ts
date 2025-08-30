export const simulateNetworkLatency = async () => {
  return new Promise((resolve) =>
    setTimeout(resolve, Math.floor(Math.random() * (1200 - 300 + 1)) + 300)
  );
};

// Generate unique temporary IDs for optimistic updates
export function generateTempId(prefix = 'temp'): string {
  return `${prefix}_${Date.now()}`;
}

// Check if an ID is a temporary optimistic ID
export function isTempId(id: string | number): boolean {
  return typeof id === 'string' && id.startsWith('temp_');
}
