import { useMemo } from 'react';
import { useAuth } from '../../components/auth/v2/AuthProvider';
import ApiService from '../../services/v2/api';

export const useApi = () => {
  const { session } = useAuth();
  
  return useMemo(() => {
    return new ApiService(session);
  }, [session]);
};

export default useApi;
