import { User } from "@/api/user";

export const mockAdminUsers: (User & { lastLogin: string, status: 'Active' | 'Inactive' })[] = [
  { id: '1', name: 'Steve Evolve', email: 'steve@myevolve.com', role: 'Admin', status: 'Active', lastLogin: '2024-08-18T10:00:00Z' },
  { id: '2', name: 'Test User', email: 'test@example.com', role: 'User', status: 'Active', lastLogin: '2024-08-17T12:30:00Z' },
  { id: '3', name: 'Jane Doe', email: 'jane.doe@example.com', role: 'User', status: 'Inactive', lastLogin: '2024-07-01T08:00:00Z' },
  { id: '4', name: 'John Smith', email: 'john.smith@work.com', role: 'User', status: 'Active', lastLogin: '2024-08-18T09:45:00Z' },
  { id: '5', name: 'Emily White', email: 'emily.white@company.net', role: 'Admin', status: 'Active', lastLogin: '2024-08-16T15:20:00Z' },
];
