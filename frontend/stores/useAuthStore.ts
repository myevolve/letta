import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'User' | 'Admin';
}

interface AuthState {
  token: string | null;
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
  hydrate: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      login: (token) => {
        try {
          const decoded = jwtDecode<{ sub: string; name: string; email: string; role: 'User' | 'Admin' }>(token);
          const user: User = {
            id: decoded.sub,
            name: decoded.name,
            email: decoded.email,
            role: decoded.role,
          };
          set({ token, user });
        } catch (error) {
          console.error("Failed to decode token:", error);
          set({ token: null, user: null });
        }
      },
      logout: () => {
        set({ token: null, user: null });
      },
      hydrate: () => {
        // This function is called by the useAuth hook to ensure the state is loaded from storage
        // before any components that depend on it are rendered.
        // Zustand's persist middleware handles hydration automatically, but this is a way to manually trigger it
        // if needed, though we will rely on the automatic hydration.
        const state = get();
        if (state.token && !state.user) {
            try {
                const decoded = jwtDecode<{ sub: string; name: string; email: string; role: 'User' | 'Admin' }>(state.token);
                const user: User = {
                    id: decoded.sub,
                    name: decoded.name,
                    email: decoded.email,
                    role: decoded.role,
                };
                set({ user });
            } catch (error) {
                console.error("Failed to re-hydrate user from token:", error);
                set({ token: null, user: null });
            }
        }
      },
    }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);

export default useAuthStore;
