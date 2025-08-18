// frontend/src/api/user.ts

// Simulate a delay to mimic network requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'User' | 'Admin';
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Mock database of users
const mockUsers: User[] = [
  { id: '1', name: 'Steve Evolve', email: 'steve@myevolve.com', role: 'Admin' },
  { id: '2', name: 'Test User', email: 'test@example.com', role: 'User' },
];

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  await delay(500);
  const user = mockUsers.find(u => u.email === email);

  if (user && password === 'password') { // Use a simple password for mock
    return {
      token: `mock-jwt-token-for-${user.id}`,
      user: user,
    };
  } else {
    throw new Error('Invalid email or password');
  }
};

export const signup = async (name: string, email: string, password: string): Promise<AuthResponse> => {
  await delay(500);
  if (mockUsers.some(u => u.email === email)) {
    throw new Error('User with this email already exists');
  }

  const newUser: User = {
    id: String(mockUsers.length + 1),
    name,
    email,
    role: 'User', // New users are always 'User' role
  };
  mockUsers.push(newUser);

  return {
    token: `mock-jwt-token-for-${newUser.id}`,
    user: newUser,
  };
};

export const logout = async (): Promise<void> => {
  await delay(200);
  // In a real app, you might invalidate the token on the server
  return Promise.resolve();
};

export const checkAuth = async (token: string): Promise<User | null> => {
    await delay(100);
    const userId = token.replace('mock-jwt-token-for-', '');
    const user = mockUsers.find(u => u.id === userId);
    return user || null;
}

// Add a few more users to the mock database for the admin page
mockUsers.push(
  { id: '3', name: 'Jane Doe', email: 'jane.doe@example.com', role: 'User' },
  { id: '4', name: 'John Smith', email: 'john.smith@work.com', role: 'User' },
  { id: '5', name: 'Emily White', email: 'emily.white@company.net', role: 'Admin' },
);

export type AdminUser = User & { lastLogin: string; status: "Active" | "Inactive" };

// Create a more detailed mock user list for the admin panel
let mockAdminUsers: AdminUser[] = [
  { id: '1', name: 'Steve Evolve', email: 'steve@myevolve.com', role: 'Admin', status: 'Active', lastLogin: '2024-08-18T10:00:00Z' },
  { id: '2', name: 'Test User', email: 'test@example.com', role: 'User', status: 'Active', lastLogin: '2024-08-17T12:30:00Z' },
  { id: '3', name: 'Jane Doe', email: 'jane.doe@example.com', role: 'User', status: 'Inactive', lastLogin: '2024-07-01T08:00:00Z' },
  { id: '4', name: 'John Smith', email: 'john.smith@work.com', role: 'User', status: 'Active', lastLogin: '2024-08-18T09:45:00Z' },
  { id: '5', name: 'Emily White', email: 'emily.white@company.net', role: 'Admin', status: 'Active', lastLogin: '2024-08-16T15:20:00Z' },
];

export const listUsers = async (): Promise<AdminUser[]> => {
  await delay(500);
  return [...mockAdminUsers];
};

export const updateUserRole = async (userId: string, newRole: 'User' | 'Admin'): Promise<AdminUser> => {
  await delay(300);
  const userIndex = mockAdminUsers.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    throw new Error("User not found");
  }
  mockAdminUsers[userIndex].role = newRole;
  return mockAdminUsers[userIndex];
};

export const deleteUser = async (userId: string): Promise<{ success: boolean }> => {
  await delay(300);
  const initialLength = mockAdminUsers.length;
  mockAdminUsers = mockAdminUsers.filter(u => u.id !== userId);
  if (mockAdminUsers.length === initialLength) {
    throw new Error("User not found");
  }
  return { success: true };
};
