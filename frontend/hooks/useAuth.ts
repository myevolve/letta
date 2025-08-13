import { useEffect, useState } from 'react';
import useAuthStore from '@/stores/useAuthStore';

const useAuth = () => {
  const { login, logout, token, user } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // This effect ensures that we don't try to access the store's state
    // until after the component has mounted on the client. This is crucial
    // for Next.js to avoid hydration mismatches between server and client.
    const unsub = useAuthStore.subscribe((state) => {
      // You can add logic here if you need to react to state changes.
    });

    // Manually trigger hydration check on mount
    useAuthStore.getState().hydrate();
    setHydrated(true);

    return () => unsub();
  }, []);

  return {
    login,
    logout,
    token,
    user,
    isAuthenticated: hydrated && !!token,
    isLoading: !hydrated,
  };
};

export default useAuth;
